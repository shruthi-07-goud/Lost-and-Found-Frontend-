import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService, claimService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  LayoutDashboard,
  Package,
  Inbox,
  Send,
  Phone,
  Mail,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('items'); // 'items' | 'received' | 'sent'
  const [myItems, setMyItems] = useState([]);
  const [sentClaims, setSentClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [items, claimsData] = await Promise.all([
        itemService.getMyReportedItems(),
        claimService.getMyClaims(),
      ]);

      setMyItems(items);
      setSentClaims(claimsData.sentClaims || []);
      setReceivedClaims(claimsData.receivedClaims || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (claimId) => {
    if (!window.confirm('Approve this claim? Contact details will be unlocked for both parties.')) return;
    try {
      setActionLoading(true);
      await claimService.approveClaim(claimId);
      await fetchDashboardData();
    } catch (err) {
      alert('Error approving claim: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (claimId) => {
    if (!window.confirm('Reject this claim?')) return;
    try {
      setActionLoading(true);
      await claimService.rejectClaim(claimId);
      await fetchDashboardData();
    } catch (err) {
      alert('Error rejecting claim: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const pendingReceivedCount = receivedClaims.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* User Greeting Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your lost and found listings and review claims.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report New Item
            </Link>
            <button
              onClick={fetchDashboardData}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4">
          <button
            onClick={() => setActiveTab('items')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'items'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            My Reported Items ({myItems.length})
          </button>

          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'received'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            Claims Received ({receivedClaims.length})
            {pendingReceivedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingReceivedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sent')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sent'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            Claims I've Sent ({sentClaims.length})
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: My Reported Items */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {myItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Items Reported Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't reported any lost or found items yet.
                </p>
                <Link
                  to="/report"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Report an Item Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white ${
                            item.type === 'FOUND' ? 'bg-teal-600' : 'bg-rose-600'
                          }`}
                        >
                          {item.type}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mb-2">
                        {item.location} • {item.dateReported}
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-slate-400">
                        Category: {item.category}
                      </span>
                      <Link
                        to={`/items/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        View & Manage
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Claims Received on My Items */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedClaims.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Claims Received</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When other users claim items you found/reported, their verification messages will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/items/${claim.itemId}`}
                          className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                        >
                          Item: {claim.itemTitle}
                        </Link>
                        <span className="text-xs text-slate-400">
                          (Location: {claim.itemLocation})
                        </span>
                      </div>
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

                    {/* Claimant Verification Message */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <span className="text-slate-500 block mb-1">
                        Claimed by <strong>{claim.claimedBy?.name}</strong>:
                      </span>
                      {claim.message}
                    </div>

                    {/* Contact details revealed if approved */}
                    {claim.contactRevealed && (
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1 font-bold">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Mutual Contact Unlocked:
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {claim.claimedBy?.phoneNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          {claim.claimedBy?.email}
                        </span>
                      </div>
                    )}

                    {/* Actions if PENDING */}
                    {claim.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleReject(claim.id)}
                          disabled={actionLoading}
                          className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(claim.id)}
                          disabled={actionLoading}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve Claim
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Claims I've Made */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentClaims.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Send className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No Claims Submitted</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse found items and submit claims when you spot your lost belongings.
                </p>
                <Link
                  to="/"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                >
                  Browse Items
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sentClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/items/${claim.itemId}`}
                          className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors"
                        >
                          Claimed Item: {claim.itemTitle}
                        </Link>
                        <span className="text-xs text-slate-400">
                          (Location: {claim.itemLocation})
                        </span>
                      </div>
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

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 block mb-1">Your Submitted Proof:</strong>
                      {claim.message}
                    </div>

                    {/* If approved, show reporter's contact details */}
                    {claim.contactRevealed ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Claim Approved! Reporter Contact Information:
                        </div>
                        <div className="flex flex-wrap gap-4 pt-1">
                          <span><strong>Reporter Name:</strong> {claim.reporter?.name}</span>
                          <span><strong>Phone:</strong> {claim.reporter?.phoneNumber}</span>
                          <span><strong>Email:</strong> {claim.reporter?.email}</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 pt-1">
                          Please reach out to the reporter directly to arrange safe collection of your item.
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        Contact details will be visible here once the reporter approves your claim.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
