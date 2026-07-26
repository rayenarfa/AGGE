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
      <div className="rounded-lg border border-red-500/30 bg-red-50 p-4 text-sm text-red-800 font-medium">
        {errorMsg}
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-50 p-6 text-center animate-fadeIn shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xl font-bold">
          ✓
        </div>
        <h4 className="text-lg font-bold text-emerald-900">Application Received!</h4>
        <p className="mt-2 text-sm text-emerald-800 max-w-md mx-auto">
          Your details have been submitted and saved in our database. 
          Administrative staff will review your application status shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-50 p-4 text-sm text-red-800 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5 text-left">
        <div>
          <h4 className="text-base font-bold text-navy font-display">{formDefinition.title}</h4>
          {formDefinition.description && (
            <p className="text-xs text-text-muted mt-1 font-sans">{formDefinition.description}</p>
          )}
        </div>

        {/* Guest Email Field */}
        {!user && (
          <div className="pb-3 border-b border-sandstone/25">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-sm text-navy transition focus:bg-white focus:border-copper focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-text-muted">Provide your contact email to track application progress.</p>
          </div>
        )}

        {/* Dynamic Fields */}
        {formDefinition.fields.map((field) => {
          const isErr = !!fieldErrors[field.name];
          const inputClass = `w-full rounded-lg border bg-sand-light/10 px-3 py-2 text-sm text-navy transition focus:bg-white focus:outline-none ${
            isErr ? 'border-red-500/50 focus:border-red-500' : 'border-sandstone/45 focus:border-copper'
          }`;
          
          return (
            <div key={field.name} className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted">
                {field.label || field.name} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  className={inputClass}
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
                  className={inputClass}
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
                  className={inputClass}
                />
              )}

              {/* Field specific error output */}
              {isErr && (
                <p className="mt-1 text-xs font-semibold text-red-500">{fieldErrors[field.name]}</p>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-copper to-copper-light px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow border-none cursor-pointer"
        >
          {submitting && <Spinner className="h-4 w-4 text-white" />}
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
