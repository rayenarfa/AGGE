import { prisma } from '../prisma/client.js';
import { verifyToken } from '../utils/auth.js';
import { createEventSchema, updateEventSchema } from '../validators/eventValidators.js';

/**
 * Get published events with search and filters
 */
export async function getEvents(req, res) {
  try {
    const { type, online, upcoming, category, search } = req.query;

    const now = new Date();

    const whereClause = {
      status: 'PUBLISHED', // Public list only shows published
      AND: [
        type ? { eventType: type.toUpperCase() } : {},
        online !== undefined ? { online: online === 'true' } : {},
        upcoming === 'true' ? { endDate: { gte: now } } : {},
        upcoming === 'false' ? { endDate: { lt: now } } : {},
        category
          ? {
              categories: {
                some: { slug: category },
              },
            }
          : {},
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        categories: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.error('Get events list error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get events for calendar view
 */
export async function getCalendarEvents(req, res) {
  try {
    // Returns all published events to feed the calendar
    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        slug: true,
        eventType: true,
        startDate: true,
        endDate: true,
        online: true,
        location: true,
      },
      orderBy: { startDate: 'asc' },
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.error('Get calendar events error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get single event details by slug
 */
export async function getEventBySlug(req, res) {
  try {
    const { slug } = req.params;

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        categories: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Optional check: check if the user is already registered for this event
    let registered = false;
    const token = req.cookies.access_token;
    if (token) {
      try {
        const decoded = verifyToken(token);
        const registration = await prisma.eventRegistration.findFirst({
          where: {
            eventId: event.id,
            userId: decoded.userId,
            status: 'REGISTERED',
          },
        });
        if (registration) {
          registered = true;
        }
      } catch (err) {
        // Silently catch invalid token errors for public views
      }
    }

    return res.status(200).json({
      event,
      registered,
    });
  } catch (error) {
    console.error('Get event details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Register current user for an event (Protected)
 */
export async function registerForEvent(req, res) {
  try {
    const eventId = req.params.id;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Guard: check if event is in the past
    if (new Date(event.endDate) < new Date()) {
      return res.status(400).json({ error: 'Cannot register for a past event' });
    }

    // Guard: check registration deadline
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ error: 'Registration deadline has passed' });
    }

    // Guard: check duplicate registration
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        userId,
        status: 'REGISTERED',
      },
    });

    if (existingRegistration) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    // Create Registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        status: 'REGISTERED',
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EVENT_REGISTER',
        entityType: 'Event',
        entityId: eventId,
        details: `Registered for event: ${event.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(201).json({
      message: 'Registration successful',
      registration,
    });
  } catch (error) {
    console.error('Event registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create a new event (Admin only)
 */
export async function createEvent(req, res) {
  try {
    const validation = createEventSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const {
      title,
      slug,
      description,
      eventType,
      status,
      startDate,
      endDate,
      location,
      online,
      registrationDeadline,
      earlyBirdDeadline,
      abstractDeadline,
      priceMember,
      priceNonMember,
      organizer,
      imageUrl,
      categoryIds,
    } = validation.data;

    // Check if slug is unique
    const existingEvent = await prisma.event.findUnique({ where: { slug } });
    if (existingEvent) {
      return res.status(400).json({ error: 'Event slug already in use' });
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        eventType,
        status,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        online,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
        earlyBirdDeadline: earlyBirdDeadline ? new Date(earlyBirdDeadline) : null,
        abstractDeadline: abstractDeadline ? new Date(abstractDeadline) : null,
        priceMember,
        priceNonMember,
        organizer,
        imageUrl,
        ...(categoryIds && {
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
        }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE_EVENT',
        entityType: 'Event',
        entityId: event.id,
        details: `Created event: ${event.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update an existing event (Admin only)
 */
export async function updateEvent(req, res) {
  try {
    const { id } = req.params;

    const validation = updateEventSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const eventToUpdate = await prisma.event.findUnique({ where: { id } });
    if (!eventToUpdate) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // If slug is changing, verify uniqueness
    const { slug, categoryIds } = validation.data;
    if (slug && slug !== eventToUpdate.slug) {
      const slugTaken = await prisma.event.findUnique({ where: { slug } });
      if (slugTaken) {
        return res.status(400).json({ error: 'Event slug already in use' });
      }
    }

    const updateData = { ...validation.data };
    delete updateData.categoryIds;

    // Convert date strings
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    if (updateData.earlyBirdDeadline) updateData.earlyBirdDeadline = new Date(updateData.earlyBirdDeadline);
    if (updateData.abstractDeadline) updateData.abstractDeadline = new Date(updateData.abstractDeadline);

    // Update in DB
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        ...(categoryIds && {
          categories: {
            set: categoryIds.map((catId) => ({ id: catId })),
          },
        }),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'UPDATE_EVENT',
        entityType: 'Event',
        entityId: id,
        details: `Updated event: ${updatedEvent.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete an event (Admin only)
 */
export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;

    const eventToDelete = await prisma.event.findUnique({ where: { id } });
    if (!eventToDelete) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await prisma.event.delete({ where: { id } });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'DELETE_EVENT',
        entityType: 'Event',
        entityId: id,
        details: `Deleted event: ${eventToDelete.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
