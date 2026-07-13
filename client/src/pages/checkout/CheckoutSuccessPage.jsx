import { useNavigate } from 'react-router-dom';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-8 shadow-xl animate-fadeIn">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl font-bold">
          ✓
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Payment Successful!</h2>
        <p className="mt-3 text-sm text-slate-300">
          Thank you for your payment. Your transaction has been authorized and the corresponding memberships or registrations are active.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition cursor-pointer"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/events')}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            Browse Events
          </button>
        </div>
      </div>
    </div>
  );
}
