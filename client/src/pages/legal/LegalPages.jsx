import { useState, useEffect } from 'react';
import SectionPage from '../../components/ui/SectionPage';
import { getPageBySlug } from '../../services/cms';
import { pageContent as mockContent } from '../../data/mockContent';

export function DisclaimerPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await getPageBySlug('legal-disclaimer');
        setPageData(data.page);
      } catch (err) {
        console.error('Failed to load page blocks, falling back to mock.', err);
        const mock = mockContent['legal.disclaimer'];
        setPageData({
          title: mock.title,
          metaDescription: mock.subtitle,
          body: mock.sections.map(s => `## ${s.heading}\n\n${s.body}`).join('\n\n'),
        });
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  return (
    <SectionPage
      content={{
        title: pageData?.title || 'Legal Disclaimer',
        subtitle: pageData?.metaDescription || 'Warranties and limits of liability statements',
        sections: [],
      }}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Disclaimer' },
      ]}
    >
      {loading ? (
        <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
          Loading legal text blocks...
        </div>
      ) : (
        <div className="prose prose-invert max-w-4xl text-left text-slate-350 leading-relaxed text-sm whitespace-pre-wrap">
          {pageData?.body}
        </div>
      )}
    </SectionPage>
  );
}

export function CookiesPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await getPageBySlug('legal-cookies');
        setPageData(data.page);
      } catch (err) {
        console.error('Failed to load page blocks, falling back to mock.', err);
        const mock = mockContent['legal.cookies'];
        setPageData({
          title: mock.title,
          metaDescription: mock.subtitle,
          body: mock.sections.map(s => `## ${s.heading}\n\n${s.body}`).join('\n\n'),
        });
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  return (
    <SectionPage
      content={{
        title: pageData?.title || 'Cookies & Privacy Policy',
        subtitle: pageData?.metaDescription || 'User session cookies and data handling statements',
        sections: [],
      }}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Cookies' },
      ]}
    >
      {loading ? (
        <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
          Loading privacy statements...
        </div>
      ) : (
        <div className="prose prose-invert max-w-4xl text-left text-slate-350 leading-relaxed text-sm whitespace-pre-wrap">
          {pageData?.body}
        </div>
      )}
    </SectionPage>
  );
}
