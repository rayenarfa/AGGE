import SectionPage from '../../components/ui/SectionPage';
import { pageContent } from '../../data/mockContent';
import { aboutSubNav } from '../../data/navigation';

export default function GovernancePage() {
  return (
    <SectionPage
      content={pageContent['about.governance']}
      subNav={aboutSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'About', to: '/about' },
        { label: 'Governance' },
      ]}
    />
  );
}
