import supabase from './supabase';

/**
 * Fetch all published events with optional query parameters
 * @param {object} params Query parameters (type, online, upcoming, category, search)
 * @returns {Promise<object>} Response data containing events list
 */
export async function getEvents(params = {}) {
  let query = supabase
    .from('Event')
    .select('*, categories:EventCategory!_EventToEventCategory(id, name, slug)')
    .eq('status', 'PUBLISHED')
    .order('startDate', { ascending: true });

  if (params.type && params.type !== 'ALL') {
    query = query.eq('eventType', params.type);
  }

  if (params.online !== undefined && params.online !== '') {
    query = query.eq('online', params.online === 'true' || params.online === true);
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }

  if (params.upcoming === 'true' || params.upcoming === true) {
    query = query.gte('endDate', new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let events = data || [];

  if (params.category) {
    events = events.filter((e) =>
      e.categories?.some((c) => c.slug === params.category)
    );
  }

  return { events };
}

/**
 * Fetch minimal event details for feeding the calendar
 * @returns {Promise<object>} Response data containing simple events list
 */
export async function getCalendarEvents() {
  const { data, error } = await supabase
    .from('Event')
    .select('id, slug, title, eventType, startDate, endDate, online, location')
    .eq('status', 'PUBLISHED')
    .order('startDate', { ascending: true });

  if (error) throw new Error(error.message);
  return { events: data || [] };
}

/**
 * Fetch details of a single event by slug
 * @param {string} slug Event url-friendly identifier
 * @returns {Promise<object>} Response data containing event and registration check flag
 */
export async function getEventBySlug(slug) {
  const { data: event, error } = await supabase
    .from('Event')
    .select('*, categories:EventCategory!_EventToEventCategory(id, name, slug)')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);

  let registered = false;
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) {
    const { data: reg } = await supabase
      .from('EventRegistration')
      .select('id')
      .eq('eventId', event.id)
      .eq('userId', session.user.id)
      .eq('status', 'REGISTERED')
      .maybeSingle();

    registered = !!reg;
  }

  return { event, registered };
}

/**
 * Enroll/register current logged in user to the event
 * @param {string} id Event ID
 * @returns {Promise<object>} Response details
 */
export async function registerForEvent(id) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Must be logged in to register for an event');

  const { data, error } = await supabase
    .from('EventRegistration')
    .insert({
      eventId: id,
      userId: session.user.id,
      status: 'REGISTERED',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { registration: data };
}

/**
 * Create a new event (restricted to authorized roles)
 * @param {object} eventData Event configuration parameters
 * @returns {Promise<object>} Response details
 */
export async function createEvent(eventData) {
  const { categories, ...fields } = eventData;

  const { data, error } = await supabase
    .from('Event')
    .insert(fields)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const joins = categories.map((catId) => ({ A: data.id, B: catId }));
    await supabase.from('_EventToEventCategory').insert(joins);
  }

  return { event: data };
}

/**
 * Edit/update event configuration details (restricted to authorized roles)
 * @param {string} id Event ID
 * @param {object} eventData Update parameters
 * @returns {Promise<object>} Response details
 */
export async function updateEvent(id, eventData) {
  const { categories, ...fields } = eventData;

  const { data, error } = await supabase
    .from('Event')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categories && Array.isArray(categories)) {
    await supabase.from('_EventToEventCategory').delete().eq('A', id);
    if (categories.length > 0) {
      const joins = categories.map((catId) => ({ A: id, B: catId }));
      await supabase.from('_EventToEventCategory').insert(joins);
    }
  }

  return { event: data };
}

/**
 * Delete event (restricted to authorized roles)
 * @param {string} id Event ID
 * @returns {Promise<object>} Response message
 */
export async function deleteEvent(id) {
  const { error } = await supabase.from('Event').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Event deleted successfully' };
}
