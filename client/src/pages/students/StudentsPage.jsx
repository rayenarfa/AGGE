import SectionPage from '../../components/ui/SectionPage';
import { pageContent } from '../../data/mockContent';

export default function StudentsPage() {
  return (
    <SectionPage
      content={pageContent.students}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Students' }]}
    />
  );
}
