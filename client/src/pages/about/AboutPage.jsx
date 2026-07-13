import SectionPage from '../../components/ui/SectionPage';
import { pageContent } from '../../data/mockContent';
import { aboutSubNav } from '../../data/navigation';

export default function AboutPage() {
  return (
    <SectionPage
      content={pageContent.about}
      subNav={aboutSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
    />
  );
}
