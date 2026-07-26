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
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5 text-left">
      {success && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50 p-4 text-sm text-emerald-800 font-medium">
          Your message has been sent successfully. We will get back to you shortly!
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg border border-red-500/30 bg-red-50 p-4 text-sm text-red-800 font-medium">
          {errorMsg}
        </div>
      )}

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-sm text-navy transition focus:bg-white focus:border-copper focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Email Address</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-sm text-navy transition focus:bg-white focus:border-copper focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Media request / Account support"
          className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-sm text-navy transition focus:bg-white focus:border-copper focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Message</label>
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message details here..."
          className="w-full rounded-lg border border-sandstone/45 bg-sand-light/10 px-3 py-2 text-sm text-navy transition focus:bg-white focus:border-copper focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-gradient-to-r from-copper to-copper-light px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow border-none cursor-pointer text-center"
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
