import supabase from './supabase';

/**
 * Log in a user using Supabase Auth
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} { user, session }
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Fetch full profile (first name, last name, role)
  let userProfile = null;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    userProfile = profile;
  } catch (profileErr) {
    console.warn('Profile fetch warning:', profileErr);
  }

  const mergedUser = {
    id: data.user.id,
    email: data.user.email,
    firstName: userProfile?.firstName || data.user.user_metadata?.firstName || '',
    lastName: userProfile?.lastName || data.user.user_metadata?.lastName || '',
    role: userProfile?.role || 'MEMBER',
    ...userProfile,
  };

  return {
    user: mergedUser,
    session: data.session,
  };
}

/**
 * Register a new user with Supabase Auth
 * @param {object} userData
 * @param {string} userData.firstName
 * @param {string} userData.lastName
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<object>} { user, session }
 */
export async function register(userData) {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const registeredUser = {
    id: data.user?.id,
    email: data.user?.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: 'MEMBER',
  };

  return {
    user: registeredUser,
    session: data.session,
  };
}

/**
 * Log out current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase logout error:', error);
    throw new Error(error.message);
  }
  return { message: 'Logged out successfully' };
}

/**
 * Get current authenticated user profile
 */
export async function getMe() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session || !session.user) {
    return { user: null };
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.warn('Profile fetch warning:', profileError);
    }

    const mergedUser = {
      id: session.user.id,
      email: session.user.email,
      firstName: profile?.firstName || session.user.user_metadata?.firstName || '',
      lastName: profile?.lastName || session.user.user_metadata?.lastName || '',
      role: profile?.role || 'MEMBER',
      ...profile,
    };

    return { user: mergedUser };
  } catch (err) {
    console.warn('getMe error:', err);
    return { user: null };
  }
}

/**
 * Refresh current session
 */
export async function refresh() {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw new Error(error.message);
  return data;
}
