import SectionPage from '../../components/ui/SectionPage';
import { pageContent } from '../../data/mockContent';
import { servicesSubNav } from '../../data/navigation';

export default function ServicesPage() {
  return (
    <SectionPage
      content={pageContent.services}
      subNav={servicesSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
    />
  );
}

export function TrainingPage() {
  return (
    <SectionPage
      content={pageContent['services.training']}
      subNav={servicesSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Services', to: '/services' },
        { label: 'Training' },
      ]}
    />
  );
}

export function ConsultingPage() {
  return (
    <SectionPage
      content={pageContent['services.consulting']}
      subNav={servicesSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Services', to: '/services' },
        { label: 'Consulting' },
      ]}
    />
  );
}
