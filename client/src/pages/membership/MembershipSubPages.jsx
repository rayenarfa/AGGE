import SectionPage from '../../components/ui/SectionPage';
import DynamicForm from '../../components/ui/DynamicForm';
import { pageContent } from '../../data/mockContent';
import { membershipSubNav } from '../../data/navigation';

function MembershipFormPage({ pageKey, breadcrumbLabel }) {
  const formKey = pageKey === 'membership.join' ? 'membership-join' : 'membership-join';

  return (
    <SectionPage
      content={pageContent[pageKey]}
      subNav={membershipSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Membership', to: '/membership' },
        { label: breadcrumbLabel },
      ]}
    >
      <DynamicForm formKey={formKey} />
    </SectionPage>
  );
}

export function JoinPage() {
  return <MembershipFormPage pageKey="membership.join" breadcrumbLabel="Join" />;
}

export function RenewPage() {
  return <MembershipFormPage pageKey="membership.renew" breadcrumbLabel="Renew" />;
}

export function BenefitsPage() {
  return (
    <SectionPage
      content={pageContent['membership.benefits']}
      subNav={membershipSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Membership', to: '/membership' },
        { label: 'Benefits' },
      ]}
    />
  );
}

export function TypesPage() {
  return (
    <SectionPage
      content={pageContent['membership.types']}
      subNav={membershipSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Membership', to: '/membership' },
        { label: 'Types' },
      ]}
    />
  );
}
