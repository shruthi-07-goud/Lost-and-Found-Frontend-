import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemService, matchingService, claimService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import SmartMatchSection from '../components/SmartMatchSection';
import ClaimModal from '../components/ClaimModal';
import {
  MapPin,
  Calendar,
  Tag,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Trash2,
  Check,
  X,
  AlertCircle,
  Share2,
} from 'lucide-react';

export const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItemData = async () => {
    try {
      setLoading(true);
      setError('');
      const itemData = await itemService.getItemById(id);
      setItem(itemData);

      // Fetch smart matches
      try {
        const matchesData = await matchingService.getMatches(id);
        setMatches(matchesData);
      } catch (matchErr) {
        console.warn('Could not fetch matches:', matchErr.message);
      }

      // If current user is reporter, fetch claims on this item
      if (itemData.canEdit && isAuthenticated) {
        try {
          const claimsData = await claimService.getClaimsForItem(id);
          setClaims(claimsData);
        } catch (claimErr) {
          console.warn('Could not fetch claims for item:', claimErr.message);
        }
      }
    } catch (err) {
      setError(err.message || 'Item not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemData();
  }, [id, isAuthenticated]);

  const handleApproveClaim = async (claimId) => {
    if (!window.confirm('Approve this claim? This will mark your item as CLAIMED and reveal contact details to both parties.')) {
      return;
    }
    try {
      setActionLoading(true);
      await claimService.approveClaim(claimId);
      await fetchItemData();
    } catch (err) {
      alert('Error approving claim: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClaim = async (claimId) => {
    if (!window.confirm('Reject this claim?')) return;
    try {
      setActionLoading(true);
      await claimService.rejectClaim(claimId);
      await fetchItemData();
    } catch (err) {
      alert('Error rejecting claim: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This cannot be undone.')) return;
    try {
      setActionLoading(true);
      await itemService.deleteItem(id);
      navigate('/');
    } catch (err) {
      alert('Error deleting item: ' + err.message);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Item Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'The requested item report does not exist.'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Link>
      </div>
    );
  }

  const isFound = item.type === 'FOUND';
  const defaultImage = isFound
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80';

  const hasContactDetails = item.reportedBy?.email || item.reportedBy?.phoneNumber;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Items
          </Link>
        </div>

        {/* Main Item Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Photo Column */}
          <div className="lg:col-span-5 bg-slate-100 relative min-h-[320px] max-h-[480px]">
            <img
              src={item.photoUrl || defaultImage}
              alt={item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex gap-2">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-md ${
                  isFound ? 'bg-teal-600' : 'bg-rose-600'
                }`}
              >
                {item.type}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, Date, Location pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                  <Tag className="w-3.5 h-3.5" />
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  Reported on {item.dateReported}
                </span>
                <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {item.location}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {item.title}
              </h1>

              {/* Description */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Detailed Description
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {item.description}
                </p>
              </div>

              {/* Privacy & Contact Box */}
              <div className="pt-2">
                {hasContactDetails ? (
                  /* Unlocked Contact Box */
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Contact Details Unlocked (Approved Claim)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-1">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>{item.reportedBy?.phoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Mail className="w-4 h-4 text-emerald-600" />
                        <span>{item.reportedBy?.email}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Protected Contact Notice */
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Confidentiality & Anti-Fraud Protection
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reported by <strong>{item.reportedBy?.name}</strong>. Phone and email remain hidden until a claim is reviewed and approved by the reporter.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              {/* If owner: show Delete / Status */}
              {item.canEdit ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200">
                    You reported this item
                  </span>
                  <button
                    onClick={handleDeleteItem}
                    disabled={actionLoading}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-auto"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* If visitor: show Claim button */
                <div className="w-full sm:w-auto">
                  {item.canClaim ? (
                    <button
                      onClick={() => setIsClaimModalOpen(true)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isFound ? "This Is Mine (Submit Claim)" : "I Found This (Contact Reporter)"}
                    </button>
                  ) : item.status === 'CLAIMED' ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                      This item has been claimed
                    </span>
                  ) : !isAuthenticated ? (
                    <Link
                      to="/login"
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Sign in to raise a claim on this item
                    </Link>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reporter's Pending Claims Management Panel */}
        {item.canEdit && claims.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Claims Received on This Item ({claims.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Review the claimant's proof. Approving unlocks mutual contact info and marks item as Claimed.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-500">Claimant:</span>
                      <strong className="text-sm text-slate-800 ml-1.5">{claim.claimedBy?.name}</strong>
                      <span className="text-xs text-slate-400 ml-2">({claim.createdAt?.substring(0, 10)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          claim.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>

                  {/* Proof message */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">Claimant's Verification Proof:</strong>
                    {claim.message}
                  </div>

                  {/* Unlocked contact details if approved */}
                  {claim.contactRevealed && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex flex-wrap gap-4">
                      <span><strong>Phone:</strong> {claim.claimedBy?.phoneNumber}</span>
                      <span><strong>Email:</strong> {claim.claimedBy?.email}</span>
                    </div>
                  )}

                  {/* Approve / Reject actions for pending claims */}
                  {claim.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => handleRejectClaim(claim.id)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject Claim
                      </button>
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Reveal Contact
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Matches Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <SmartMatchSection matches={matches} targetType={item.type} />
        </div>
      </div>

      {/* Claim Submission Modal */}
      <ClaimModal
        item={item}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onClaimSuccess={fetchItemData}
      />
    </div>
  );
};

export default ItemDetailPage;
