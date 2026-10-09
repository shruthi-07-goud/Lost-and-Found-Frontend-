import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'OPEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MATCHED':
        return 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse';
      case 'CLAIMED':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'RESOLVED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'OPEN':
        return 'Active';
      case 'MATCHED':
        return 'Match Suggested';
      case 'CLAIMED':
        return 'Claimed';
      case 'RESOLVED':
        return 'Resolved';
      default:
        return status;
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
