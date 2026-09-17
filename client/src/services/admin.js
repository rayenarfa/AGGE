import supabase from './supabase';

/**
 * Get administrator statistics dashboard details using Supabase RPC
 * @returns {Promise<object>} Response data containing stats object
 */
export async function getStats() {
  const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Get list of all registered users on the system
 * @param {object} params Query parameters
 * @param {string} [params.search] Search query matching names/emails
 * @param {string} [params.role] Specific role filter
 * @returns {Promise<object>} Response data containing users array
 */
export async function getUsers(params = {}) {
  let query = supabase
    .from('profiles')
    .select('id, email, firstName, lastName, role, createdAt')
    .order('createdAt', { ascending: false });

  if (params.role) {
    query = query.eq('role', params.role);
  }

  if (params.search) {
    query = query.or(
      `email.ilike.%${params.search}%,firstName.ilike.%${params.search}%,lastName.ilike.%${params.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return { users: data || [] };
}

/**
 * Update user role privileges
 * @param {string} id User ID
 * @param {string} role User role value (MEMBER, STUDENT_MEMBER, EDITOR, EVENT_MANAGER, ADMIN, SUPER_ADMIN)
 * @returns {Promise<object>} Response data
 */
export async function updateUserRole(id, role) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id === id) {
    throw new Error('You cannot change your own user role');
  }

  const { data: updatedUser, error: updateError } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select('id, email, firstName, lastName, role')
    .single();

  if (updateError) throw new Error(updateError.message);

  // Log in AuditLog
  await supabase.from('AuditLog').insert({
    userId: session?.user?.id || null,
    action: 'UPDATE_USER_ROLE',
    entityType: 'User',
    entityId: id,
    details: `Updated role of user ${updatedUser.email} to ${role}`,
  });

  return {
    message: 'User role updated successfully',
    user: updatedUser,
  };
}

/**
 * Fetch system audit logs details
 * @returns {Promise<object>} Response data containing auditLogs array
 */
export async function getAuditLogs() {
  const { data, error } = await supabase
    .from('AuditLog')
    .select('*, user:profiles(email, firstName, lastName)')
    .order('createdAt', { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return { auditLogs: data || [] };
}

/**
 * Fetch all events (including drafts) for admin panel management
 * @returns {Promise<object>} Response data containing events array
 */
export async function getAdminEvents() {
  const { data, error } = await supabase
    .from('Event')
    .select('*, categories:EventCategory!_EventToEventCategory(*)')
    .order('startDate', { ascending: false });

  if (error) throw new Error(error.message);
  return { events: data || [] };
}
