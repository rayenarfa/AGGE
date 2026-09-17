import supabase from './supabase';

/**
 * Fetch dynamic form configuration fields
 * @param {string} key Unique form descriptor (e.g. membership-join)
 * @returns {Promise<object>} Response data containing formDefinition
 */
export async function getFormDefinition(key) {
  const { data: formDefinition, error } = await supabase
    .from('FormDefinition')
    .select('*')
    .eq('key', key)
    .single();

  if (error) throw new Error(error.message);
  return { formDefinition };
}

/**
 * Submit dynamic form data fields values
 * @param {string} key Unique form descriptor
 * @param {string} [email] Guest email parameter if guest
 * @param {object} data Key-value pair collection of input fields
 * @returns {Promise<object>} Submission details
 */
export async function submitForm(key, email, data) {
  // 1. Fetch form definition to validate existence & retrieve ID
  const { data: formDef, error: defError } = await supabase
    .from('FormDefinition')
    .select('id, fields')
    .eq('key', key)
    .single();

  if (defError || !formDef) throw new Error('Form definition not found');

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || null;
  const submissionEmail = email || session?.user?.email || null;

  const { data: submission, error: submitError } = await supabase
    .from('FormSubmission')
    .insert({
      formDefinitionId: formDef.id,
      userId,
      email: submissionEmail,
      data,
      status: 'PENDING',
    })
    .select()
    .single();

  if (submitError) throw new Error(submitError.message);
  return { submission };
}

/**
 * Submit general support / query message
 * @param {object} payload Message attributes (name, email, subject, message, type)
 * @returns {Promise<object>} Response details
 */
export async function submitContactMessage(payload) {
  const { data: message, error } = await supabase
    .from('ContactMessage')
    .insert({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      type: payload.type || 'GENERAL',
      status: 'UNREAD',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { message };
}

/**
 * Fetch all form submissions (restricted to Admins)
 * @returns {Promise<object>} Submissions list array
 */
export async function getSubmissions() {
  const { data, error } = await supabase
    .from('FormSubmission')
    .select('*, formDefinition:FormDefinition(key, title), user:profiles(firstName, lastName, email)')
    .order('createdAt', { ascending: false });

  if (error) throw new Error(error.message);
  return { submissions: data || [] };
}

/**
 * Toggle status of a form submission (restricted to Admins)
 * @param {string} id Submission ID
 * @param {string} status Queue status flag (PENDING, REVIEWED, APPROVED, REJECTED)
 * @returns {Promise<object>} Updated record details
 */
export async function updateSubmissionStatus(id, status) {
  const { data, error } = await supabase
    .from('FormSubmission')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { submission: data };
}

/**
 * Fetch all logged contact support messages (restricted to Admins)
 * @returns {Promise<object>} Messages list array
 */
export async function getContactMessages() {
  const { data, error } = await supabase
    .from('ContactMessage')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) throw new Error(error.message);
  return { messages: data || [] };
}

/**
 * Toggle status of contact support message (restricted to Admins)
 * @param {string} id Message ID
 * @param {string} status Message status flag (UNREAD, READ, REPLIED)
 * @returns {Promise<object>} Updated record details
 */
export async function updateContactMessageStatus(id, status) {
  const { data, error } = await supabase
    .from('ContactMessage')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { message: data };
}
