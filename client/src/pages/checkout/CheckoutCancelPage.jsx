import { useNavigate } from 'react-router-dom';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-8 shadow-xl animate-fadeIn">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-2xl font-bold">
          ✕
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Payment Cancelled</h2>
        <p className="mt-3 text-sm text-slate-300">
          The payment process was aborted, or card authorization was declined. No charges have been made.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/membership')}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition cursor-pointer"
          >
            Membership Plans
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-850 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
