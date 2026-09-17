import supabase from './supabase';

/**
 * Fetch all available membership plans
 * @returns {Promise<object>} List of plans
 */
export async function getMembershipPlans() {
  const { data, error } = await supabase
    .from('MembershipPlan')
    .select('*')
    .eq('isActive', true)
    .order('price', { ascending: true });

  if (error) throw new Error(error.message);
  return { plans: data || [] };
}

/**
 * Initialize checkout session using Supabase RPC
 * @param {string} type Target checkout type (MEMBERSHIP, EVENT, COURSE)
 * @param {string} targetId Database ID of the target plan/event/course
 * @returns {Promise<object>} Checkout details
 */
export async function createCheckoutSession(type, targetId) {
  const { data, error } = await supabase.rpc('create_checkout_session', {
    p_type: type,
    p_target_id: targetId,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Send simulated webhook notification to Supabase RPC
 * @param {string} sessionId Checkout Payment ID
 * @param {string} status Transaction outcome status (SUCCESS, FAIL)
 * @returns {Promise<object>} Status result
 */
export async function simulatedWebhook(sessionId, status) {
  const { data, error } = await supabase.rpc('process_simulated_webhook', {
    p_session_id: sessionId,
    p_status: status,
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch specific payment session details
 * @param {string} id Payment ID
 * @returns {Promise<object>} Session details
 */
export async function getPaymentSession(id) {
  const { data, error } = await supabase
    .from('Payment')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return { session: data };
}

/**
 * Fetch all payment histories (restricted to Admins)
 * @returns {Promise<object>} Transactions array
 */
export async function getAdminPayments() {
  const { data, error } = await supabase
    .from('Payment')
    .select(`
      *,
      membership:Membership(
        *,
        user:profiles!Membership_userId_fkey(email, firstName, lastName),
        plan:MembershipPlan(name)
      ),
      eventRegistration:EventRegistration(
        *,
        user:profiles!EventRegistration_userId_fkey(email, firstName, lastName),
        event:Event(title)
      ),
      courseEnrollment:CourseEnrollment(
        *,
        user:profiles!CourseEnrollment_userId_fkey(email, firstName, lastName),
        course:Course(title)
      )
    `)
    .order('createdAt', { ascending: false });

  if (error) throw new Error(error.message);
  return { payments: data || [] };
}

/**
 * Update pricing/descriptions of a membership plan (restricted to Admins)
 * @param {string} id Plan ID
 * @param {number} price Price tag
 * @param {string} description Plan description
 * @returns {Promise<object>} Updated record details
 */
export async function updateMembershipPlan(id, price, description) {
  const { data, error } = await supabase
    .from('MembershipPlan')
    .update({ price, description })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { plan: data };
}
