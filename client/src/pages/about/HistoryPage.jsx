import SectionPage from '../../components/ui/SectionPage';
import { pageContent } from '../../data/mockContent';
import { aboutSubNav } from '../../data/navigation';

export default function HistoryPage() {
  return (
    <SectionPage
      content={pageContent['about.history']}
      subNav={aboutSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'History' },
      ]}
    />
  );
}
