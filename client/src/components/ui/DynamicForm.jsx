import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner, FormSkeleton } from './Loader';
import { getFormDefinition, submitForm } from '../../services/forms';

export default function DynamicForm({ formKey }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('planId');

  const [formDefinition, setFormDefinition] = useState(null);
  const [formData, setFormData] = useState({});
  const [guestEmail, setGuestEmail] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Field-specific validation messages
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    async function loadForm() {
      try {
        setLoading(true);
        setErrorMsg(null);
        setSuccess(false);
        setFormData({});
        setFieldErrors({});

        const data = await getFormDefinition(formKey);
        setFormDefinition(data.formDefinition);

        // Prepopulate input fields
        const initialData = {};
        data.formDefinition.fields.forEach((field) => {
          initialData[field.name] = field.type === 'select' ? (field.options?.[0] || '') : '';
        });
        setFormData(initialData);
      } catch (err) {
        setErrorMsg('Failed to load form configuration.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [formKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setFieldErrors({});
    try {
      await submitForm(formKey, user ? undefined : guestEmail, formData);
      if (formKey === 'membership-join' && planId) {
        navigate(`/checkout?type=MEMBERSHIP&id=${planId}`);
        return;
      }
      setSuccess(true);
    } catch (err) {
      if (err.response?.data?.details) {
        // Map dynamic field-specific errors
        const errors = {};
        err.response.data.details.forEach((item) => {
          errors[item.field] = item.message;
        });
        setFieldErrors(errors);
      } else {
        setErrorMsg(err.response?.data?.error || 'Failed to submit form data.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <FormSkeleton fieldsCount={5} />
    );
  }

  if (errorMsg && !formDefinition) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
        {errorMsg}
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-6 text-center animate-fadeIn">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xl font-bold">
          ✓
        </div>
        <h4 className="text-lg font-bold text-white">Application Received!</h4>
        <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto">
          Your details have been submitted and saved in our database. 
          Administrative staff will review your application status shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-850 bg-slate-900/40 p-6 text-left">
        <div>
          <h4 className="text-base font-bold text-white">{formDefinition.title}</h4>
          {formDefinition.description && (
            <p className="text-xs text-slate-400 mt-1">{formDefinition.description}</p>
          )}
        </div>

        {/* Guest Email Field */}
        {!user && (
          <div className="pb-3 border-b border-slate-800/50">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">Provide your contact email to track application progress.</p>
          </div>
        )}

        {/* Dynamic Fields */}
        {formDefinition.fields.map((field) => {
          const isErr = !!fieldErrors[field.name];
          
          return (
            <div key={field.name}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                {field.label || field.name} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className={`w-full rounded-lg border bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none ${
                    isErr ? 'border-red-500/50' : 'border-slate-700'
                  }`}
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  required={field.required}
                  rows={3}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className={`w-full rounded-lg border bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none ${
                    isErr ? 'border-red-500/50' : 'border-slate-700'
                  }`}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                  required={field.required}
                  value={formData[field.name] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.name]: field.type === 'number' ? Number(e.target.value) || '' : e.target.value,
                    })
                  }
                  className={`w-full rounded-lg border bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none ${
                    isErr ? 'border-red-500/50' : 'border-slate-700'
                  }`}
                />
              )}

              {/* Field specific error output */}
              {isErr && (
                <p className="mt-1 text-xs font-semibold text-red-400">{fieldErrors[field.name]}</p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
        >
          {submitting && <Spinner className="h-4 w-4 text-white" />}
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
