import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { MapPin, Calendar, Tag, ArrowRight } from 'lucide-react';

export const ItemCard = ({ item }) => {
  const isFound = item.type === 'FOUND';

  const defaultImage = isFound
    ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col">
      {/* Card Header & Photo */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={item.photoUrl || defaultImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide shadow-xs ${
              isFound
                ? 'bg-teal-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            {item.type}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 shadow-xs">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3" />
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {item.dateReported}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
            {item.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          {/* Description snippet */}
          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Card Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Reported by <strong className="text-slate-700">{item.reportedBy?.name || 'Anonymous'}</strong>
          </span>
          <Link
            to={`/items/${item.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
