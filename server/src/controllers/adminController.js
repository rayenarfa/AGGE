import { prisma } from '../prisma/client.js';

/**
 * Get system stats for the Admin overview
 */
export async function getStats(req, res) {
  try {
    const totalUsers = await prisma.user.count();
    
    const activeMembers = await prisma.membership.count({
      where: { status: 'ACTIVE' },
    });

    const pendingSubmissions = await prisma.formSubmission.count({
      where: { status: 'PENDING' },
    });

    const paymentSummary = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: {
        amount: true,
      },
    });

    return res.status(200).json({
      stats: {
        totalUsers,
        activeMembers,
        pendingSubmissions,
        revenueTotal: Number(paymentSummary._sum.amount) || 0.0,
      },
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all users list with search & filter by role
 */
export async function getUsers(req, res) {
  try {
    const { search, role } = req.query;

    const whereClause = {
      AND: [
        role ? { role } : {},
        search
          ? {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error('Fetch users list error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update a user's role (restricted to Admins / Super Admins)
 */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const requesterId = req.user.userId;

    // Prevent self role demotion/change
    if (requesterId === id) {
      return res.status(400).json({ error: 'You cannot change your own user role' });
    }

    // Validate role is defined in enum
    const validRoles = ['MEMBER', 'STUDENT_MEMBER', 'EDITOR', 'EVENT_MANAGER', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid user role specified' });
    }

    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update in DB
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: requesterId,
        action: 'UPDATE_USER_ROLE',
        entityType: 'User',
        entityId: id,
        details: `Updated role of ${userToUpdate.email} from ${userToUpdate.role} to ${role}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({
      message: 'User role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get system audit logs
 */
export async function getAuditLogs(req, res) {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to 100 recent actions
    });

    return res.status(200).json({ auditLogs });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get all events (including drafts and archived) for admin management
 */
export async function getAdminEvents(req, res) {
  try {
    const events = await prisma.event.findMany({
      include: {
        categories: true,
      },
      orderBy: { startDate: 'desc' },
    });

    return res.status(200).json({ events });
  } catch (error) {
    console.error('Fetch admin events error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
