import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getPaymentSession, simulatedWebhook } from '../../services/payments';

export default function CheckoutGatewayPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Credit Card Form States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPaymentDetails() {
      if (!sessionId) {
        setErrorMsg('Invalid payment session ID.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg(null);
        const data = await getPaymentSession(sessionId);
        setPayment(data.payment);
      } catch (err) {
        setErrorMsg(err.response?.data?.error || 'Failed to retrieve payment details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPaymentDetails();
  }, [sessionId]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      alert('Please fill out all payment details.');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate Stripe webhook success callback
      await simulatedWebhook(sessionId, 'SUCCESS');
      navigate('/checkout/success');
    } catch (err) {
      console.error(err);
      alert('Simulated transaction processor failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!confirm('Are you sure you want to cancel this checkout session?')) return;
    try {
      await simulatedWebhook(sessionId, 'FAIL');
      navigate('/checkout/cancel');
    } catch (err) {
      console.error(err);
      navigate('/checkout/cancel');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500" />
        <p className="mt-4 text-sm text-slate-400">Connecting to secure gateway tunnels...</p>
      </div>
    );
  }

  if (errorMsg || !payment) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-6 text-red-400 text-sm">
          {errorMsg || 'Failed to load checkout details.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-bold tracking-tight text-white uppercase">AGGE Secure Gateway</h2>
        <p className="text-xs text-slate-500 mt-1">Simulated Sandbox Sandbox Mode</p>
      </div>

      <div className="grid gap-6">
        {/* Order Details Banner */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-5 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Order Summary</h3>
          <p className="mt-2 text-base font-bold text-white">{payment.description}</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
            <span className="text-sm text-slate-400">Total amount to pay</span>
            <span className="text-lg font-bold text-emerald-400">€{Number(payment.amount).toFixed(2)} EUR</span>
          </div>
        </div>

        {/* Credit Card Input Form */}
        <form onSubmit={handlePaymentSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-left">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800/50">
            Payment Details
          </h3>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Cardholder Name</label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-lg border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Card Number</label>
            <input
              type="text"
              required
              maxLength={16}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="4242 4242 4242 4242"
              className="w-full rounded-lg border border-slate-855 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">Expiration (MM/YY)</label>
              <input
                type="text"
                required
                maxLength={5}
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                placeholder="12/28"
                className="w-full rounded-lg border border-slate-855 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">CVC / CVV</label>
              <input
                type="password"
                required
                maxLength={3}
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                className="w-full rounded-lg border border-slate-855 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 py-3 text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer text-center"
            >
              {submitting ? 'Authorizing transaction...' : `Pay €${Number(payment.amount).toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={handleCancelPayment}
              className="w-full rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel Payment Intent
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-600 text-center">
          AGGE payment checkout security simulator. No funds will be processed or transferred.
        </p>
      </div>
    </div>
  );
}
