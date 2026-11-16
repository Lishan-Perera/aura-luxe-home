'use client';

import { useState, useEffect } from 'react';
import { Layers, Plus, Check, X, Edit2, Sparkles, FolderTree, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface SubCategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

interface CategoryItem {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  subcategories?: SubCategory[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCatId, setActiveCatId] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // New subcategory modal/form state
  const [newSubName, setNewSubName] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [addingToCatId, setAddingToCatId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !activeCatId) {
          setActiveCatId(data.categories[0]._id || data.categories[0].id || '');
        }
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubcategory = async (catId: string, subId: string, currentActive: boolean) => {
    try {
      setStatusMessage('');
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_subcategory',
          categoryId: catId,
          subcategoryId: subId,
          isActive: !currentActive,
        }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((cat) => {
            if ((cat._id || cat.id) === catId) {
              return {
                ...cat,
                subcategories: (cat.subcategories || []).map((sub) =>
                  sub._id === subId ? { ...sub, isActive: !currentActive } : sub
                ),
              };
            }
            return cat;
          })
        );
        setStatusMessage('✨ Subcategory status updated successfully.');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle subcategory:', err);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent, catId: string) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    try {
      const generatedSlug = newSubSlug.trim() || newSubName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_subcategory',
          categoryId: catId,
          subcategory: {
            name: newSubName.trim(),
            slug: generatedSlug,
            description: newSubDesc.trim(),
            isActive: true,
            displayOrder: 10,
          },
        }),
      });

      if (res.ok) {
        setNewSubName('');
        setNewSubSlug('');
        setNewSubDesc('');
        setAddingToCatId(null);
        setStatusMessage('✨ Subcategory added successfully to category.');
        await fetchCategories();
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (err) {
      console.error('Failed to add subcategory:', err);
    }
  };

  const selectedCategory = categories.find((c) => (c._id || c.id) === activeCatId) || categories[0];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cream-300">
        <div>
          <h1 className="font-serif text-2xl font-bold text-forest-900 flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-gold-500" />
            Category &amp; Subcategory Architecture
          </h1>
          <p className="text-xs text-forest-600 mt-0.5">
            Manage your 6 core luxury collections and their curated subcategories. Control visibility, ordering, and atelier links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-forest-700 bg-cream-100 px-3 py-1.5 rounded border border-cream-300 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            MongoDB Idempotent Architecture
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 animate-fadeIn">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-forest-600 animate-pulse bg-white rounded-xl border border-cream-300">
          Loading category taxonomy from database...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 6 Categories Selection */}
          <div className="lg:col-span-4 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-forest-800 px-1 mb-2">
              Primary Categories ({categories.length})
            </h2>

            <div className="space-y-1.5">
              {categories.map((cat) => {
                const isSelected = (cat._id || cat.id) === activeCatId;
                const subCount = cat.subcategories?.length || 0;
                return (
                  <button
                    key={cat._id || cat.id}
                    type="button"
                    onClick={() => setActiveCatId(cat._id || cat.id || '')}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-forest-900 text-cream-50 border-gold-400/50 shadow-md'
                        : 'bg-white hover:bg-cream-100 text-forest-900 border-cream-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-serif">{cat.name}</span>
                        {cat.isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-gold-400' : 'bg-emerald-500'}`} />
                        )}
                      </div>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-cream-300' : 'text-forest-600'}`}>
                        slug: /{cat.slug} • {subCount} subcategories
                      </span>
                    </div>
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-gold-300' : 'text-forest-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Subcategories Management for Selected Category */}
          <div className="lg:col-span-8 space-y-4">
            {selectedCategory ? (
              <div className="bg-white rounded-xl border border-cream-300 p-6 shadow-sm space-y-6">
                {/* Category Header Card */}
                <div className="bg-cream-50 p-4 rounded-lg border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-forest-900">
                        {selectedCategory.name}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-forest-100 text-forest-800 px-2 py-0.5 rounded border border-forest-200">
                        /{selectedCategory.slug}
                      </span>
                    </div>
                    <p className="text-xs text-forest-600/90 mt-1 max-w-xl">
                      {selectedCategory.description || 'No description provided.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAddingToCatId(selectedCategory._id || selectedCategory.id || '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-forest-900 hover:bg-forest-950 text-cream-50 text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-2xs border border-gold-400/30"
                  >
                    <Plus className="w-3.5 h-3.5 text-gold-300" />
                    <span>Add Subcategory</span>
                  </button>
                </div>

                {/* Subcategories List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest-800">
                      Configured Subcategories ({selectedCategory.subcategories?.length || 0})
                    </h4>
                    <span className="text-[11px] text-forest-500">
                      Live sync with Header mega dropdowns &amp; Shop filters
                    </span>
                  </div>

                  <div className="border border-cream-300 rounded-lg overflow-hidden divide-y divide-cream-200">
                    {(selectedCategory.subcategories && selectedCategory.subcategories.length > 0) ? (
                      selectedCategory.subcategories.map((sub, idx) => (
                        <div
                          key={sub._id || sub.slug || idx}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cream-50/70 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-sm text-forest-900">
                                {sub.name}
                              </span>
                              <span className="text-[10px] font-mono text-forest-500 bg-cream-100 px-1.5 py-0.5 rounded border border-cream-200">
                                ?subcategory={sub.slug}
                              </span>
                              {sub.isActive ? (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Active in Menu
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                                  Inactive
                                </span>
                              )}
                            </div>
                            {sub.description && (
                              <p className="text-xs text-forest-600/80">
                                {sub.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={`/shop?category=${selectedCategory.slug}&subcategory=${sub.slug}`}
                              target="_blank"
                              className="text-[11px] text-forest-700 hover:text-gold-600 px-2 py-1 rounded hover:bg-cream-200 transition-colors font-medium underline"
                            >
                              Preview Link
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSubcategory(
                                  selectedCategory._id || selectedCategory.id || '',
                                  sub._id || sub.slug,
                                  sub.isActive
                                )
                              }
                              className={`px-3 py-1 text-xs rounded font-medium transition-colors border ${
                                sub.isActive
                                  ? 'bg-cream-100 text-forest-800 border-cream-300 hover:bg-cream-200'
                                  : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                              }`}
                            >
                              {sub.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-forest-600">
                        No subcategories defined for this category yet. Click &quot;Add Subcategory&quot; to create one.
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Subcategory Modal / Inline Form */}
                {addingToCatId && (
                  <form
                    onSubmit={(e) => handleAddSubcategory(e, addingToCatId)}
                    className="p-4 bg-cream-100/70 border border-gold-300/80 rounded-lg space-y-3 animate-fadeIn"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-cream-300">
                      <span className="font-serif font-bold text-xs uppercase tracking-wider text-forest-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                        Add New Subcategory to {selectedCategory.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAddingToCatId(null)}
                        className="text-forest-600 hover:text-forest-900 p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-forest-700 mb-1">
                          Subcategory Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          placeholder="e.g. Lounge Chaise Lounges"
                          className="w-full text-xs px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-forest-700 mb-1">
                          Slug (URL Identifier)
                        </label>
                        <input
                          type="text"
                          value={newSubSlug}
                          onChange={(e) => setNewSubSlug(e.target.value)}
                          placeholder="Auto-generated if left blank"
                          className="w-full text-xs px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900 font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-forest-700 mb-1">
                          Subtitle / Brief Description
                        </label>
                        <input
                          type="text"
                          value={newSubDesc}
                          onChange={(e) => setNewSubDesc(e.target.value)}
                          placeholder="e.g. Sculptural daybeds and artisanal chaise seating"
                          className="w-full text-xs px-3 py-2 bg-white border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setAddingToCatId(null)}
                        className="px-3 py-1.5 text-xs text-forest-700 hover:bg-cream-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-forest-900 text-cream-50 text-xs font-semibold rounded hover:bg-forest-950 uppercase tracking-wider"
                      >
                        Save Subcategory
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
