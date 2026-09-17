import supabase from './supabase';

/**
 * Fetch unified event/course calendar items using Supabase RPC
 * @param {object} params Search and filter parameters
 * @returns {Promise<object>} Unified calendar items list { items }
 */
export async function getCalendar(params = {}) {
  const { data, error } = await supabase.rpc('get_calendar_feed', {
    p_search: params.search || null,
    p_type: params.type || 'ALL',
    p_event_type: params.eventType || null,
    p_course_type: params.courseType || null,
    p_category: params.category || null,
    p_online: params.online !== undefined && params.online !== '' ? (params.online === 'true' || params.online === true) : null,
    p_start_date: params.startDate || null,
    p_end_date: params.endDate || null,
  });

  if (error) throw new Error(error.message);
  return data || { items: [] };
}
