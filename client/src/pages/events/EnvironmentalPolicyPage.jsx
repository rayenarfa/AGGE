import SectionPage from '../../components/ui/SectionPage';
import { pageContent } from '../../data/mockContent';
import { eventsSubNav } from '../../data/navigation';

export default function EnvironmentalPolicyPage() {
  return (
    <SectionPage
      content={pageContent['events.environmental-policy']}
      subNav={eventsSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Events', to: '/events' },
        { label: 'Environmental Policy' },
      ]}
    />
  );
}
