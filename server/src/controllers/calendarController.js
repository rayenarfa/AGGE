import { prisma } from '../prisma/client.js';

/**
 * Retrieve unified, filtered calendar records of events and educational courses
 */
export async function getCalendarItems(req, res) {
  try {
    const {
      search,
      type,
      eventType,
      courseType,
      category,
      online,
      startDate,
      endDate,
    } = req.query;

    const itemsList = [];

    // 1. Query Events
    const queryEvents = !type || type === 'ALL' || type === 'EVENT';
    if (queryEvents) {
      const eventWhere = { status: 'PUBLISHED' };

      if (search) {
        eventWhere.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (eventType) {
        eventWhere.eventType = eventType;
      }

      if (online !== undefined) {
        eventWhere.online = online === 'true';
      }

      if (category) {
        eventWhere.categories = {
          some: { slug: category },
        };
      }

      if (startDate) {
        eventWhere.startDate = { gte: new Date(startDate) };
      }

      if (endDate) {
        eventWhere.endDate = { lte: new Date(endDate) };
      }

      const events = await prisma.event.findMany({
        where: eventWhere,
        include: { categories: { select: { name: true } } },
      });

      events.forEach((e) => {
        itemsList.push({
          id: e.id,
          slug: e.slug,
          title: e.title,
          itemType: 'EVENT',
          subType: e.eventType,
          startDate: e.startDate,
          endDate: e.endDate,
          location: e.online ? 'Online' : e.location || 'TBA',
          online: e.online,
          category: e.categories?.[0]?.name || 'General',
        });
      });
    }

    // 2. Query Courses
    const queryCourses = !type || type === 'ALL' || type === 'COURSE';
    if (queryCourses) {
      const courseWhere = { status: 'PUBLISHED' };

      // Courses are always online in this application
      if (online === 'false') {
        // If client specifically filters online: false, we exclude courses
        courseWhere.id = 'none'; // matches nothing
      }

      if (search) {
        courseWhere.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (courseType) {
        courseWhere.courseType = courseType;
      }

      if (category) {
        courseWhere.categories = {
          some: { slug: category },
        };
      }

      if (startDate) {
        // If the course is self-paced (startDate is null), we only include it if start date isn't bounding or we match nulls
        courseWhere.OR = [
          { startDate: { gte: new Date(startDate) } },
          { startDate: null },
        ];
      }

      if (endDate) {
        courseWhere.OR = [
          { endDate: { lte: new Date(endDate) } },
          { endDate: null },
        ];
      }

      const courses = await prisma.course.findMany({
        where: courseWhere,
        include: { categories: { select: { name: true } } },
      });

      courses.forEach((c) => {
        itemsList.push({
          id: c.id,
          slug: c.slug,
          title: c.title,
          itemType: 'COURSE',
          subType: c.courseType,
          startDate: c.startDate,
          endDate: c.endDate,
          location: 'Online',
          online: true,
          category: c.categories?.[0]?.name || 'Education',
        });
      });
    }

    // Sort chronologically by startDate (push null dates like self-paced courses to the end)
    const sortedItems = itemsList.sort((a, b) => {
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(a.startDate) - new Date(b.startDate);
    });

    return res.status(200).json({ items: sortedItems });

  } catch (error) {
    console.error('Fetch calendar items error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
