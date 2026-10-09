import React, { useState } from 'react';
import { claimService } from '../services/api';
import { ShieldCheck, X, AlertCircle, CheckCircle } from 'lucide-react';

export const ClaimModal = ({ item, isOpen, onClose, onClaimSuccess }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 10) {
      setError('Please provide at least 10 characters describing proof of ownership.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await claimService.createClaim({
        itemId: item.id,
        message: message.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        onClaimSuccess();
        onClose();
        setSuccess(false);
        setMessage('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
            <h2 className="text-lg font-bold text-slate-900">Claim Item Verification</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Claim Submitted Successfully!</h3>
            <p className="text-sm text-slate-600">
              The reporter has been notified. Once approved, you will be able to view their contact information.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Item Context */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase text-indigo-600">Target Item</span>
                <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-500">{item.location} • {item.category}</p>
              </div>
              <span className="text-xs font-medium bg-white px-2.5 py-1 rounded-md border border-slate-200 text-slate-700">
                #{item.id}
              </span>
            </div>

            {/* Instruction Notice */}
            <div className="text-xs text-slate-600 bg-amber-50/80 border border-amber-200 p-3 rounded-xl leading-relaxed">
              <strong className="text-amber-800 block mb-1">Ownership Proof Guidelines:</strong>
              Describe distinctive marks, exact engravings, contents, wallpaper/passcodes, or purchase details only the true owner would know. 
              Contact details will remain confidential until the reporter approves your claim.
            </div>

            {/* Proof Input Field */}
            <div>
              <label htmlFor="claim-proof" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Proof of Ownership / Verification Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="claim-proof"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: The calculator has my initials etched under the battery lid, and contains a sticker of Spider-Man on the cover..."
                className="w-full text-sm rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
              />
              <span className="text-[11px] text-slate-400 block text-right mt-1">
                {message.length} characters (min 10)
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs shadow-indigo-300 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClaimModal;
