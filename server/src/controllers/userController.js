import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import { updateProfileSchema, updatePasswordSchema } from '../validators/userValidators.js';

/**
 * Update user profile details (first name, last name, email)
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;

    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const { firstName, lastName, email } = validation.data;

    // If email is changing, verify it's not already taken
    if (email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (emailTaken) {
        return res.status(400).json({ error: 'Email is already in use by another account' });
      }
    }

    // Update details in DB
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update user password securely
 */
export async function updatePassword(req, res) {
  try {
    const userId = req.user.userId;

    const validation = updatePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user password hash
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare current password
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Save in DB
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get aggregated dashboard data for the authenticated member
 */
export async function getDashboardData(req, res) {
  try {
    const userId = req.user.userId;

    // 1. Fetch latest membership details
    const membership = await prisma.membership.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
    });

    // 2. Fetch all transaction logs
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { membership: { userId } },
          { eventRegistration: { userId } },
          { courseEnrollment: { userId } },
        ],
      },
      include: {
        membership: { include: { plan: true } },
        eventRegistration: { include: { event: true } },
        courseEnrollment: { include: { course: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedPayments = payments.map((p) => {
      let description = 'General Payment';
      if (p.membership) {
        description = `Membership Plan: ${p.membership.plan.name}`;
      } else if (p.eventRegistration) {
        description = `Event Registration: ${p.eventRegistration.event.title}`;
      } else if (p.courseEnrollment) {
        description = `Course Enrollment: ${p.courseEnrollment.course.title}`;
      }
      return {
        id: p.id,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        createdAt: p.createdAt,
        description,
      };
    });

    // 3. Fetch registered events
    const eventRegistrations = await prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            location: true,
            online: true,
            eventType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedEvents = eventRegistrations.map((reg) => ({
      registrationId: reg.id,
      status: reg.status,
      registeredAt: reg.createdAt,
      ...reg.event,
    }));

    // 4. Fetch enrolled courses
    const courseEnrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            instructor: true,
            courseType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedCourses = courseEnrollments.map((enr) => ({
      enrollmentId: enr.id,
      status: enr.status,
      enrolledAt: enr.createdAt,
      ...enr.course,
    }));

    return res.status(200).json({
      membership,
      payments: formattedPayments,
      events: formattedEvents,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error('Fetch dashboard details error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
