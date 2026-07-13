import { prisma } from '../prisma/client.js';

/**
 * Fetch all membership plans
 */
export async function getMembershipPlans(req, res) {
  try {
    const plans = await prisma.membershipPlan.findMany({
      orderBy: { price: 'asc' },
    });
    return res.status(200).json({ plans });
  } catch (error) {
    console.error('Fetch membership plans error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Initialize simulated checkout session intent
 */
export async function createCheckoutSession(req, res) {
  try {
    const userId = req.user.userId;
    const { type, targetId } = req.body;

    if (!['MEMBERSHIP', 'EVENT', 'COURSE'].includes(type) || !targetId) {
      return res.status(400).json({ error: 'Invalid checkout type or target' });
    }

    let amount = 0;
    let description = '';
    let membershipId = null;
    let eventRegistrationId = null;
    let courseEnrollmentId = null;

    if (type === 'MEMBERSHIP') {
      const plan = await prisma.membershipPlan.findUnique({
        where: { id: targetId },
      });
      if (!plan) {
        return res.status(404).json({ error: 'Membership plan not found' });
      }

      amount = Number(plan.price);
      description = `AGGE Membership - ${plan.name}`;

      // Calculate endDate
      const duration = plan.durationMonths || 12;
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + duration);

      // Create Pending Membership
      const membership = await prisma.membership.create({
        data: {
          userId,
          planId: plan.id,
          status: 'PENDING',
          endDate,
        },
      });
      membershipId = membership.id;

    } else if (type === 'EVENT') {
      const event = await prisma.event.findUnique({
        where: { id: targetId },
      });
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Check if already registered
      const existing = await prisma.eventRegistration.findFirst({
        where: { eventId: event.id, userId, status: 'REGISTERED' },
      });
      if (existing) {
        return res.status(400).json({ error: 'You are already registered for this event' });
      }

      // Determine price based on active membership status
      const activeMembership = await prisma.membership.findFirst({
        where: { userId, status: 'ACTIVE' },
      });

      amount = activeMembership ? Number(event.priceMember) : Number(event.priceNonMember);
      description = `Registration for Event: ${event.title}`;

      // Create Pending Event Registration
      const registration = await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          userId,
          status: 'PENDING_PAYMENT',
        },
      });
      eventRegistrationId = registration.id;

    } else if (type === 'COURSE') {
      const course = await prisma.course.findUnique({
        where: { id: targetId },
      });
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      amount = Number(course.price || 0);
      description = `Enrollment in Course: ${course.title}`;

      // Create Pending Course Enrollment
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          courseId: course.id,
          userId,
          status: 'PENDING_PAYMENT',
        },
      });
      courseEnrollmentId = enrollment.id;
    }

    // Auto-complete if price is free (0)
    if (amount === 0) {
      if (type === 'MEMBERSHIP') {
        await prisma.membership.update({
          where: { id: membershipId },
          data: { status: 'ACTIVE' },
        });
      } else if (type === 'EVENT') {
        await prisma.eventRegistration.update({
          where: { id: eventRegistrationId },
          data: { status: 'REGISTERED' },
        });
      } else if (type === 'COURSE') {
        await prisma.courseEnrollment.update({
          where: { id: courseEnrollmentId },
          data: { status: 'ENROLLED' },
        });
      }

      // Create Completed Payment Record
      const completedPayment = await prisma.payment.create({
        data: {
          membershipId,
          eventRegistrationId,
          courseEnrollmentId,
          amount,
          status: 'COMPLETED',
          provider: 'Free tier / Auto',
        },
      });

      return res.status(200).json({
        free: true,
        message: 'Registration completed successfully without payment details.',
        paymentId: completedPayment.id,
      });
    }

    // Create Pending Payment Session Record
    const payment = await prisma.payment.create({
      data: {
        membershipId,
        eventRegistrationId,
        courseEnrollmentId,
        amount,
        status: 'PENDING',
        provider: 'Stripe',
      },
    });

    // Populate checkout token session
    await prisma.payment.update({
      where: { id: payment.id },
      data: { providerPaymentId: `session_${payment.id}` },
    });

    return res.status(200).json({
      free: false,
      sessionId: payment.id,
      amount,
      description,
      checkoutUrl: `/checkout/gateway?sessionId=${payment.id}`,
    });

  } catch (error) {
    console.error('Create checkout session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle simulated checkout completed webhook
 */
export async function simulatedWebhook(req, res) {
  try {
    const { sessionId, status } = req.body;

    if (!sessionId || !['SUCCESS', 'FAIL'].includes(status)) {
      return res.status(400).json({ error: 'Invalid webhook event format' });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: sessionId },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    if (payment.status !== 'PENDING') {
      return res.status(400).json({ error: 'Payment has already been processed' });
    }

    const targetStatus = status === 'SUCCESS' ? 'COMPLETED' : 'FAILED';

    // Update payment record status
    const updatedPayment = await prisma.payment.update({
      where: { id: sessionId },
      data: { status: targetStatus },
    });

    // Process associated dependencies lifecycles
    if (payment.membershipId) {
      await prisma.membership.update({
        where: { id: payment.membershipId },
        data: { status: status === 'SUCCESS' ? 'ACTIVE' : 'CANCELLED' },
      });
    } else if (payment.eventRegistrationId) {
      await prisma.eventRegistration.update({
        where: { id: payment.eventRegistrationId },
        data: { status: status === 'SUCCESS' ? 'REGISTERED' : 'CANCELLED' },
      });
    } else if (payment.courseEnrollmentId) {
      await prisma.courseEnrollment.update({
        where: { id: payment.courseEnrollmentId },
        data: { status: status === 'SUCCESS' ? 'ENROLLED' : 'CANCELLED' },
      });
    }

    // Create Audit Log
    const targetRefId = payment.membershipId || payment.eventRegistrationId || payment.courseEnrollmentId;
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_WEBHOOK_PROCESSED',
        entityType: 'Payment',
        entityId: payment.id,
        details: `Simulated webhook updated transaction status of ${payment.amount} EUR to ${targetStatus} (Target: ${targetRefId})`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({
      message: 'Webhook processed successfully',
      payment: updatedPayment,
    });

  } catch (error) {
    console.error('Process webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Fetch all payments transactions (Admin only)
 */
export async function getAdminPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        membership: {
          include: {
            user: {
              select: { email: true, firstName: true, lastName: true },
            },
            plan: { select: { name: true } },
          },
        },
        eventRegistration: {
          include: {
            user: {
              select: { email: true, firstName: true, lastName: true },
            },
            event: { select: { title: true } },
          },
        },
        courseEnrollment: {
          include: {
            user: {
              select: { email: true, firstName: true, lastName: true },
            },
            course: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ payments });
  } catch (error) {
    console.error('Fetch admin payments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update membership plan properties (Admin only)
 */
export async function updateMembershipPlan(req, res) {
  try {
    const { id } = req.params;
    const { price, description } = req.body;

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        price: Number(price),
        description,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'UPDATE_MEMBERSHIP_PLAN',
        entityType: 'MembershipPlan',
        entityId: id,
        details: `Updated membership plan: ${updated.name} (price: ${price} EUR)`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({
      message: 'Membership plan updated successfully',
      plan: updated,
    });
  } catch (error) {
    console.error('Update membership plan error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Fetch specific payment session details (Publicly accessible for Checkout page)
 */
export async function getPaymentSession(req, res) {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        membership: {
          include: { plan: { select: { name: true } } },
        },
        eventRegistration: {
          include: { event: { select: { title: true } } },
        },
        courseEnrollment: {
          include: { course: { select: { title: true } } },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment session not found' });
    }

    let description = 'AGGE Purchase';
    if (payment.membership) {
      description = `AGGE Membership - ${payment.membership.plan?.name}`;
    } else if (payment.eventRegistration) {
      description = `Registration for Event: ${payment.eventRegistration.event?.title}`;
    } else if (payment.courseEnrollment) {
      description = `Enrollment in Course: ${payment.courseEnrollment.course?.title}`;
    }

    return res.status(200).json({
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        description,
      },
    });
  } catch (error) {
    console.error('Fetch payment session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
