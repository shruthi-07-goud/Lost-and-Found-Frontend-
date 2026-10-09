import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';
import { Search, Filter, PlusCircle, Sparkles, RefreshCw, XCircle } from 'lucide-react';

export const HomePage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [selectedType, setSelectedType] = useState(''); // '' | 'LOST' | 'FOUND'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const categories = [
    'Electronics',
    'Keys',
    'Wallets & Purses',
    'Bags & Backpacks',
    'Clothing',
    'Books & Documents',
    'Accessories',
    'Others',
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedType) params.type = selectedType;
      if (selectedCategory) params.category = selectedCategory;
      if (locationQuery) params.location = locationQuery;
      if (selectedStatus) params.status = selectedStatus;
      if (searchQuery) params.search = searchQuery;

      const data = await itemService.getItems(params);
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setLocationQuery('');
    setSearchQuery('');
    setSelectedStatus('');
  };

  const hasActiveFilters = selectedType || selectedCategory || locationQuery || searchQuery || selectedStatus;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-indigo-900 via-indigo-800 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            Deterministic Smart Item Matching Engine
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Lost Something on Campus? <br />
            <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-teal-200 bg-clip-text text-transparent">
              We Help You Reunite Fast.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-indigo-200/90 max-w-2xl mx-auto">
            Report lost possessions or found valuables in hostel blocks, libraries, and campus grounds. 
            Automated scoring connects reports while protecting your contact privacy.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/report"
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost or Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Search & Filter Control Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg space-y-4">
          {/* Top Row: Search input and Type toggle buttons */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Type Filter Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full md:w-auto">
              <button
                onClick={() => setSelectedType('')}
                className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedType === ''
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => setSelectedType('LOST')}
                className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedType === 'LOST'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lost Items
              </button>
              <button
                onClick={() => setSelectedType('FOUND')}
                className={`flex-1 md:flex-initial px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedType === 'FOUND'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Found Items
              </button>
            </div>

            {/* Keyword Search Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, brand, description (e.g. Casio, calculator, keys)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
              >
                Search
              </button>
            </form>
          </div>

          {/* Bottom Row: Category, Location, Status, and Reset */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            {/* Category Select */}
            <div className="flex-1 min-w-[150px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location input filter */}
            <div className="flex-1 min-w-[150px]">
              <input
                type="text"
                placeholder="Filter by location (e.g. Library, Block B)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onBlur={fetchItems}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status Select */}
            <div className="flex-1 min-w-[130px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Active / Open</option>
                <option value="MATCHED">Match Suggested</option>
                <option value="CLAIMED">Claimed</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Reset Filters button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mt-8 mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            {selectedType ? `${selectedType} Items` : 'All Item Reports'}{' '}
            <span className="text-slate-400 font-normal text-sm">
              ({items.length} found)
            </span>
          </h2>
          <button
            onClick={fetchItems}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-sm text-slate-500 font-medium">Loading items...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-2">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchItems}
              className="text-xs text-rose-600 underline font-medium"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No Matching Items Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reports match your selected criteria. Try removing some filters or post a new lost/found report.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
