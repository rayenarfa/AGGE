import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createCheckoutSession } from '../../services/payments';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function initCheckout() {
      if (!type || !id) {
        setErrorMsg('Invalid checkout parameters.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMsg(null);
        
        const data = await createCheckoutSession(type, id);
        
        if (data.free) {
          // Free item - instantly registered
          navigate('/checkout/success?free=true');
        } else {
          // Redirect to simulated credit card payment gateway page
          navigate(data.checkoutUrl);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to initialize checkout session. Please make sure you are logged in.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
  }, [type, id, navigate]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      {loading ? (
        <div className="space-y-4">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500" />
          <h3 className="text-lg font-semibold text-white">Preparing checkout session...</h3>
          <p className="text-sm text-slate-400">Verifying pricing tiers and initializing secure token portals.</p>
        </div>
      ) : errorMsg ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-xl font-bold">
            !
          </div>
          <h4 className="text-lg font-bold text-white">Checkout Error</h4>
          <p className="mt-2 text-sm text-slate-300">
            {errorMsg}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
          >
            ← Go Back
          </button>
        </div>
      ) : null}
    </div>
  );
}
