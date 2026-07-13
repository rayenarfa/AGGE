import { useState } from 'react';
import SectionPage from '../../components/ui/SectionPage';
import { submitContactMessage } from '../../services/forms';
import { pageContent } from '../../data/mockContent';
import { contactSubNav } from '../../data/navigation';

function ContactForm({ type = 'GENERAL' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(false);
    setErrorMsg(null);
    setSuccess(false);

    if (!name || !email || !subject || !message) {
      setErrorMsg('All fields are required.');
      return;
    }

    setSubmitting(true);
    try {
      await submitContactMessage({
        name,
        email,
        subject,
        message,
        type,
      });
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send your message. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-left">
      {success && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          Your message has been sent successfully. We will get back to you shortly!
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-slate-750 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-slate-750 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Media request / Account support"
          className="w-full rounded-lg border border-slate-750 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Message</label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message details here..."
          className="w-full rounded-lg border border-slate-750 bg-slate-950/50 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer animate-pulse"
      >
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

export default function ContactPage() {
  return (
    <SectionPage
      content={pageContent.contact}
      subNav={contactSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
    >
      <ContactForm type="GENERAL" />
    </SectionPage>
  );
}

export function MediaInquiriesPage() {
  return (
    <SectionPage
      content={pageContent['contact.media']}
      subNav={contactSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Contact', to: '/contact' },
        { label: 'Media Inquiries' },
      ]}
    >
      <ContactForm type="MEDIA" />
    </SectionPage>
  );
}

export function SupportPage() {
  return (
    <SectionPage
      content={pageContent['contact.support']}
      subNav={contactSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Contact', to: '/contact' },
        { label: 'Support' },
      ]}
    >
      <ContactForm type="SUPPORT" />
    </SectionPage>
  );
}
