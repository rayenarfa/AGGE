import supabase from './supabase';

/**
 * Update current user profile details
 * @param {object} profileData
 * @param {string} [profileData.firstName]
 * @param {string} [profileData.lastName]
 * @param {string} [profileData.email]
 * @returns {Promise<object>} Response data
 */
export async function updateProfile(profileData) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const updates = {};
  if (profileData.firstName !== undefined) updates.firstName = profileData.firstName;
  if (profileData.lastName !== undefined) updates.lastName = profileData.lastName;

  // Update in profiles table
  const { data: updatedProfile, error: profileError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .single();

  if (profileError) throw new Error(profileError.message);

  // If email is requested to change, update in Supabase Auth as well
  if (profileData.email && profileData.email !== session.user.email) {
    const { error: authError } = await supabase.auth.updateUser({
      email: profileData.email,
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      },
    });
    if (authError) throw new Error(authError.message);
  }

  return {
    message: 'Profile updated successfully',
    user: updatedProfile,
  };
}

/**
 * Update current user password securely via Supabase Auth
 * @param {object} passwordData
 * @param {string} passwordData.newPassword
 * @returns {Promise<object>} Response data
 */
export async function updatePassword(passwordData) {
  const { error } = await supabase.auth.updateUser({
    password: passwordData.newPassword,
  });

  if (error) throw new Error(error.message);
  return { message: 'Password updated successfully' };
}

/**
 * Get aggregated dashboard data for the authenticated member using Supabase RPC
 * @returns {Promise<object>} Response data containing membership, payments, events, courses
 */
export async function getDashboard() {
  const { data, error } = await supabase.rpc('get_user_dashboard');
  if (error) throw new Error(error.message);
  return data;
}
