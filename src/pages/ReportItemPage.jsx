import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Upload, Image, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export const ReportItemPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [type, setType] = useState('FOUND'); // 'LOST' or 'FOUND'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [location, setLocation] = useState('');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const categories = [
    'Electronics',
    'Keys',
    'Wallets & Purses',
    'Bags & Backpacks',
    'Clothing',
    'Books & Documents',
    'Accessories',
    'Other',
  ];

  const validateForm = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!location.trim()) errs.location = 'Location is required (e.g. Library 2nd floor, Hostel B)';
    if (!description.trim()) errs.description = 'Detailed description is required';
    else if (description.trim().length < 15) errs.description = 'Please write at least 15 characters to help identify matches';
    if (!dateReported) errs.dateReported = 'Date is required';
    if (category === 'Other' && !customCategory.trim()) errs.customCategory = 'Please specify category';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'File size exceeds 10MB limit' }));
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: null }));

    // Automatically upload to server
    try {
      setUploadingImage(true);
      const res = await itemService.uploadImage(file);
      setPhotoUrl(res.url);
    } catch (err) {
      setErrors((prev) => ({ ...prev, image: 'Upload failed: ' + err.message }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setServerError('');

      const payload = {
        type,
        title: title.trim(),
        category: category === 'Other' ? customCategory.trim() : category,
        location: location.trim(),
        dateReported,
        description: description.trim(),
        photoUrl: photoUrl.trim() || null,
      };

      const newItem = await itemService.createItem(payload);
      navigate(`/items/${newItem.id}`);
    } catch (err) {
      setServerError(err.message || 'Failed to create report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Report an Item
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Post details of a lost possession or an item you found on campus.
            </p>
          </div>

          {/* Type Toggle (LOST vs FOUND) */}
          <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center">
            <button
              type="button"
              onClick={() => setType('FOUND')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                type === 'FOUND'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              I Found an Item
            </button>
            <button
              type="button"
              onClick={() => setType('LOST')}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                type === 'LOST'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              I Lost an Item
            </button>
          </div>

          {serverError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder={type === 'FOUND' ? 'e.g. Found Casio Scientific Calculator' : 'e.g. Lost HP Spectre Laptop'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-sm rounded-xl border px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  errors.title ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
            </div>

            {/* Category & Date Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-sm rounded-xl border border-slate-300 px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {category === 'Other' && (
                  <input
                    type="text"
                    placeholder="Specify Category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full mt-2 text-sm rounded-xl border border-slate-300 px-4 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                )}
                {errors.customCategory && <p className="text-xs text-rose-600 mt-1">{errors.customCategory}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date {type === 'FOUND' ? 'Found' : 'Lost'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={dateReported}
                  onChange={(e) => setDateReported(e.target.value)}
                  className={`w-full text-sm rounded-xl border px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white ${
                    errors.dateReported ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {errors.dateReported && <p className="text-xs text-rose-600 mt-1">{errors.dateReported}</p>}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location on Campus <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Central Library 2nd Floor table 14, Hostel Block B Mess, Badminton Court 1"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full text-sm rounded-xl border px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  errors.location ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Mention color, brand, distinct scratches, keychains, stickers, or distinguishing marks to assist the matching algorithm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full text-sm rounded-xl border px-4 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                  errors.description ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                }`}
              />
              {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Keywords used here power our automatic cross-matching with opposite reports!
              </p>
            </div>

            {/* Photo Upload & Preview */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Photo (Optional)
              </label>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-4 text-center transition-colors">
                <input
                  type="file"
                  id="item-photo-file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="item-photo-file"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-600 hover:underline">
                    {uploadingImage ? 'Uploading image...' : 'Click to browse and upload image'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, WEBP (Max 10MB)</span>
                </label>
              </div>
              {errors.image && <p className="text-xs text-rose-600">{errors.image}</p>}

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative aspect-video max-h-48 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview('');
                      setPhotoUrl('');
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Or Direct Image URL fallback */}
              {!imagePreview && (
                <div className="pt-1">
                  <input
                    type="url"
                    placeholder="Or paste an image web URL..."
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2 placeholder:text-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                {submitting ? 'Publishing Report...' : `Publish ${type} Report`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportItemPage;
