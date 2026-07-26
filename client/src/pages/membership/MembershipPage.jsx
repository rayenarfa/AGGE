import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getMembershipPlans } from '../../services/payments';
import SectionPage from '../../components/ui/SectionPage';
import { pageContent, membershipPlans } from '../../data/mockContent';
import { membershipSubNav } from '../../data/navigation';

export default function MembershipPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const data = await getMembershipPlans();
        setPlans(data.plans);
      } catch (err) {
        console.error('Failed to fetch DB plans, falling back to mock.', err);
        const mappedMock = membershipPlans.map((p, idx) => ({
          id: idx === 0 ? 'mock-prof' : idx === 1 ? 'mock-stud' : 'mock-corp',
          name: p.name,
          price: idx === 0 ? 120.00 : idx === 1 ? 30.00 : 500.00,
          description: p.features.join(' · '),
        }));
        setPlans(mappedMock);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  const handleJoinClick = (planId) => {
    if (!user) {
      navigate('/login?redirect=/membership');
      return;
    }
    navigate(`/membership/join?planId=${planId}`);
  };

  return (
    <SectionPage
      content={pageContent.membership}
      subNav={membershipSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Membership' }]}
    >
      {loading ? (
        <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
          Loading plans list...
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="flex flex-col justify-between rounded-xl border border-sandstone/30 bg-white p-5 shadow-sm transition hover:border-copper/45 hover:-translate-y-0.5">
              <div>
                <h3 className="font-semibold text-navy text-base">{plan.name}</h3>
                <p className="mt-2 text-lg font-bold text-copper">
                  {Number(plan.price) === 0 ? 'Free' : `€${Number(plan.price).toFixed(2)}`}
                  <span className="text-xs text-text-muted font-normal"> / year</span>
                </p>
                <p className="mt-3 text-xs text-text-muted leading-relaxed border-t border-sandstone/25 pt-3 font-sans">
                  {plan.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleJoinClick(plan.id)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-copper to-copper-light py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.02] transition shadow border-none cursor-pointer text-center"
              >
                {user ? 'Select Plan' : 'Login to Join'}
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionPage>
  );
}
