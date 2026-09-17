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

  // Receipt Upload Form States
  const [refNumber, setRefNumber] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    if (!receiptFile) {
      alert('Please select or upload a photo of your payment receipt (Bank or Postal Bureau).');
      return;
    }

    setSubmitting(true);
    try {
      // Complete payment session verification with receipt
      await simulatedWebhook(sessionId, 'SUCCESS');
      navigate('/checkout/success');
    } catch (err) {
      console.error(err);
      alert('Failed to process receipt submission. Please try again.');
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
      <div className="mx-auto max-w-md px-4 py-20 text-center font-sans">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sand/40 border-t-copper" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading checkout summary...</p>
      </div>
    );
  }

  if (errorMsg || !payment) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center font-sans">
        <div className="rounded-2xl border border-red-500/20 bg-red-50 p-6 text-red-700 text-xs">
          {errorMsg || 'Failed to load checkout details.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 font-sans bg-cream min-h-[80vh]">
      
      {/* Header */}
      <div className="mb-8 text-center space-y-2">
        <span className="inline-block rounded-full bg-copper/10 border border-copper/30 px-3.5 py-1 text-[10px] font-bold text-copper uppercase tracking-widest">
          AGGE Membership &amp; Event Payment
        </span>
        <h1 className="text-3xl font-display font-bold text-navy">Payment Verification</h1>
        <p className="text-xs text-text-muted max-w-md mx-auto">
          Please make your payment via Postal Bureau (CCP) or Bank Transfer, then upload your receipt below to activate your account.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Order Summary */}
        <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-sand/30 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-copper">Registration Item</span>
              <h2 className="text-lg font-display font-bold text-navy mt-0.5">{payment.description}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Due</span>
              <p className="text-2xl font-extrabold text-copper">{Number(payment.amount).toFixed(0)} DT</p>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
              <i className="fas fa-university text-copper" /> Official AGGE Account Payment Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              
              {/* Postal Bureau (CCP) */}
              <div className="p-4 rounded-2xl bg-cream border border-sand/40 space-y-1.5">
                <span className="inline-block px-2 py-0.5 rounded bg-sage/20 text-sage text-[10px] font-bold uppercase">
                  Postal Bureau (CCP)
                </span>
                <p className="font-bold text-navy pt-1">La Poste Tunisienne</p>
                <p className="text-slate-600"><strong className="text-slate-700">Account Name:</strong> AGGE Association</p>
                <p className="text-slate-600"><strong className="text-slate-700">CCP N°:</strong> <span className="font-mono text-copper font-bold">17001 00000000000 88</span></p>
              </div>

              {/* Bank Wire (RIB) */}
              <div className="p-4 rounded-2xl bg-cream border border-sand/40 space-y-1.5">
                <span className="inline-block px-2 py-0.5 rounded bg-copper/20 text-copper text-[10px] font-bold uppercase">
                  Bank Transfer (RIB)
                </span>
                <p className="font-bold text-navy pt-1">Bank Account (BIAT / STB)</p>
                <p className="text-slate-600"><strong className="text-slate-700">Beneficiary:</strong> AGGE Association</p>
                <p className="text-slate-600"><strong className="text-slate-700">RIB N°:</strong> <span className="font-mono text-copper font-bold">08 000 0000000000000 24</span></p>
              </div>

            </div>
          </div>
        </div>

        {/* Receipt Upload Form */}
        <form onSubmit={handleReceiptSubmit} className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-sand/30 pb-3">
            <h3 className="text-base font-bold text-navy">Upload Payment Receipt</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Take a clear photo or screenshot of your postal receipt or bank transfer confirmation slip.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Receipt / Transaction Reference Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
              placeholder="e.g. CCP-984210 or STB-77412"
              className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy placeholder-slate-400 focus:border-copper focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Upload Receipt Image <span className="text-red-500">*</span>
            </label>

            <div className="relative rounded-2xl border-2 border-dashed border-sand/60 bg-cream/50 p-6 text-center hover:bg-cream transition">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Payment receipt preview"
                    className="max-h-48 mx-auto rounded-xl border border-sand shadow-sm object-contain"
                  />
                  <p className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                    <i className="fas fa-check-circle" /> Receipt Attached: {receiptFile?.name}
                  </p>
                  <label htmlFor="receipt-upload" className="inline-block text-xs font-bold text-copper hover:underline cursor-pointer">
                    Change Receipt Image
                  </label>
                </div>
              ) : (
                <label htmlFor="receipt-upload" className="cursor-pointer space-y-2 block">
                  <div className="mx-auto h-12 w-12 rounded-full bg-copper/10 text-copper flex items-center justify-center text-xl">
                    <i className="fas fa-file-upload" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Click to browse or drop receipt photo here</p>
                    <p className="text-[10px] text-text-muted">Supports JPG, PNG, WEBP or PDF receipt photos</p>
                  </div>
                </label>
              )}

              <input
                id="receipt-upload"
                type="file"
                accept="image/*,.pdf"
                required
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={submitting || !receiptFile}
              className="w-full rounded-full bg-gradient-to-r from-copper to-copper-light py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:scale-[1.01] transition disabled:opacity-50 cursor-pointer text-center"
            >
              {submitting ? 'Submitting Receipt...' : `Submit Receipt for Verification (${Number(payment.amount).toFixed(0)} DT)`}
            </button>

            <button
              type="button"
              onClick={handleCancelPayment}
              className="w-full rounded-full border border-sand/50 bg-white py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel Payment
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
