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
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans);
        } else {
          throw new Error('No DB plans found');
        }
      } catch (err) {
        console.error('Using official client membership plans.', err);
        const mappedMock = membershipPlans.map((p, idx) => ({
          id: idx === 0 ? 'mock-student' : 'mock-prof',
          name: p.name,
          priceText: p.price,
          features: p.features,
          popular: p.popular,
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
          Loading membership plans...
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-copper">Official Membership Tiers</span>
            <h2 className="text-2xl font-display font-bold text-navy">Join the AGGE Community</h2>
            <p className="text-xs text-text-muted">
              Anyone studying, researching, teaching, or working in geophysics, geosciences, or environmental sciences is welcome to join.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id || plan.name}
                className={`relative flex flex-col justify-between rounded-3xl p-8 border transition-all ${
                  plan.popular
                    ? 'bg-navy text-white border-copper shadow-2xl scale-105 z-10'
                    : 'bg-white text-navy border-sand/40 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-copper px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-md">
                    Recommended For Professionals
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className={`text-xl font-display font-bold ${plan.popular ? 'text-cream' : 'text-navy'}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-2xl font-extrabold mt-2 ${plan.popular ? 'text-sand' : 'text-copper'}`}>
                      {plan.priceText || `${plan.price} TND / year`}
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs border-t border-sand/30 pt-4">
                    {(plan.features || plan.description?.split(' · ') || []).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <i className={`fas fa-check-circle mt-0.5 ${plan.popular ? 'text-sand' : 'text-copper'}`} />
                        <span className={plan.popular ? 'text-slate-200' : 'text-slate-600'}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    type="button"
                    onClick={() => handleJoinClick(plan.id)}
                    className={`w-full rounded-full py-3.5 text-xs font-bold uppercase tracking-wider transition ${
                      plan.popular
                        ? 'bg-gradient-to-r from-copper to-copper-light text-white hover:scale-105 shadow-xl'
                        : 'bg-navy text-white hover:bg-navy-mid'
                    }`}
                  >
                    {user ? `Select ${plan.name}` : 'Log In & Subscribe'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionPage>
  );
}
