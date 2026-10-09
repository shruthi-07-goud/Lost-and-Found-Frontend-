import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Tag, ArrowRight, ShieldAlert } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const SmartMatchSection = ({ matches = [], targetType }) => {
  const oppositeType = targetType === 'LOST' ? 'FOUND' : 'LOST';

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center">
        <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">No Automated Matches Found Yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
          Our smart matching algorithm monitors newly reported {oppositeType.toLowerCase()} items matching category, location, and keywords. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Smart Suggested Matches ({matches.length})
            </h3>
            <p className="text-xs text-slate-500">
              Ranked by category compatibility, location proximity, and keyword matching.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map(({ item, score, matchReasons }) => (
          <div
            key={item.id}
            className="bg-white border-2 border-purple-100 hover:border-purple-300 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header: Score badge and item type */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide text-white ${
                      item.type === 'FOUND' ? 'bg-teal-600' : 'bg-rose-600'
                    }`}
                  >
                    {item.type}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                
                {/* Score Pill */}
                <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Score: {score} pts
                </div>
              </div>

              {/* Title & snippet */}
              <h4 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">
                {item.title}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                {item.description}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {item.dateReported}
                </span>
              </div>

              {/* Match reasons pills */}
              <div className="space-y-1 mb-4">
                <span className="text-[11px] font-semibold text-purple-900 block uppercase tracking-wider">
                  Why it matched:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchReasons.map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* View item link */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Link
                to={`/items/${item.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Inspect This Item
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartMatchSection;
