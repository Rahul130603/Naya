import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Package,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingBag,
  Stethoscope,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  DEFAULT_STORE_GROUPS,
  addStoreProduct,
  compressProductImage,
  deleteStoreProduct,
  resetStoreCatalog,
  updateStoreProduct,
} from '../lib/storeCatalog';

const EMPTY_FORM = {
  title: '',
  group: DEFAULT_STORE_GROUPS[0],
  customGroup: '',
  price: '',
  originalPrice: '',
  packageInfo: '',
  desc: '',
  image: '',
  consult: false,
  discreetPack: true,
};

const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export default function AdminStoreCatalogSection({ products, onNotify }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    const isPresetGroup = DEFAULT_STORE_GROUPS.includes(product.group);
    setEditingId(product.id);
    setForm({
      title: product.title || '',
      group: isPresetGroup ? product.group : '__custom__',
      customGroup: isPresetGroup ? '' : product.group || '',
      price: String(product.price || ''),
      originalPrice: String(product.originalPrice || ''),
      packageInfo: product.packageInfo || product.size || '',
      desc: product.desc || product.copy || '',
      image: product.image || '',
      consult: Boolean(product.consult),
      discreetPack: product.discreetPack !== false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError('');
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFormError('');
    setImageLoading(true);
    try {
      const compressed = await compressProductImage(file);
      setForm((prev) => ({ ...prev, image: compressed }));
    } catch (error) {
      setFormError(error?.message || 'Failed to load image.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError('');

    const title = form.title.trim();
    const resolvedGroup =
      form.group === '__custom__' ? form.customGroup.trim() : form.group;
    const price = Number(form.price);
    const originalPrice = form.originalPrice ? Number(form.originalPrice) : price;

    if (!title) {
      setFormError('Please enter a product name.');
      return;
    }
    if (!resolvedGroup) {
      setFormError('Please enter a category name.');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setFormError('Selling price must be greater than ₹0.');
      return;
    }
    if (!Number.isFinite(originalPrice) || originalPrice < price) {
      setFormError('Original MRP must be equal to or higher than the selling price.');
      return;
    }
    if (!form.packageInfo.trim()) {
      setFormError('Please enter pack / quantity details (e.g., 60 Capsules • 100% Herbal).');
      return;
    }
    if (!form.desc.trim()) {
      setFormError('Please enter a product description.');
      return;
    }

    const payload = {
      title,
      name: title,
      group: resolvedGroup,
      category: resolvedGroup,
      price,
      originalPrice,
      packageInfo: form.packageInfo.trim(),
      size: form.packageInfo.trim(),
      desc: form.desc.trim(),
      copy: form.desc.trim(),
      image: form.image.trim(),
      consult: form.consult,
      discreetPack: form.discreetPack,
    };

    try {
      if (editingId) {
        updateStoreProduct(editingId, payload);
        onNotify?.(`Updated "${title}" in Wellness Store.`);
      } else {
        addStoreProduct(payload);
        onNotify?.(`Added "${title}" to Wellness Store!`);
      }
      closeModal();
    } catch (error) {
      setFormError(error?.message || 'Could not save product.');
    }
  };

  const handleDelete = (product) => {
    try {
      deleteStoreProduct(product.id);
      onNotify?.(`Removed "${product.title}" from Wellness Store.`);
    } catch (error) {
      onNotify?.(error?.message || 'Could not remove product.');
    }
  };

  const handleResetDefaults = () => {
    try {
      resetStoreCatalog();
      onNotify?.('Wellness Store catalog restored to default products.');
    } catch (error) {
      onNotify?.(error?.message || 'Could not reset catalog.');
    }
  };

  const sellingNum = Number(form.price) || 0;
  const mrpNum = Number(form.originalPrice) || sellingNum;
  const previewDiscount =
    mrpNum > sellingNum && sellingNum > 0
      ? Math.round((1 - sellingNum / mrpNum) * 100)
      : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-[#0B3B82]">
            Wellness Store Product Catalog
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Add new products with images and details. Changes appear immediately on the Wellness Storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/wellness-store"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#DCE7F6] bg-[#F8FBFF] px-3.5 py-2 text-xs font-bold text-[#0B3B82] hover:bg-[#EDF3FC] transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live Store ({products.length})
          </Link>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] px-4 py-2 text-xs font-bold text-white shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      {products.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {products.map((product) => {
            const discountPct =
              product.originalPrice > product.price
                ? Math.round((1 - product.price / product.originalPrice) * 100)
                : 0;

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-white border border-[#DCE7F6] shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <ShoppingBag className="h-8 w-8 mb-1" />
                        <span className="text-[11px] font-semibold">No image</span>
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-white border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-[#15803D]">
                      {product.consult
                        ? 'Doctor-guided'
                        : discountPct > 0
                          ? `${discountPct}% OFF`
                          : 'OTC Ready'}
                    </span>

                    {product.discreetPack && (
                      <span className="absolute right-3 top-3 rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        Plain Box
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#16A34A]">
                      {product.group}
                    </p>
                    <h4 className="text-sm font-extrabold text-[#0B3B82] line-clamp-2">
                      {product.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {product.packageInfo || product.size}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {product.desc || product.copy}
                    </p>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-[#0B3B82]">
                        {money(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          {money(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE7F6] bg-white px-3 py-1.5 text-xs font-bold text-[#0B3B82] hover:bg-[#F0F6FF] transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <ShoppingBag className="mx-auto h-9 w-9 text-slate-300 mb-3" />
          <p className="text-sm font-bold text-[#0B3B82]">No products in store</p>
          <p className="text-xs text-slate-500 mt-1">
            Add a product or restore the default catalog.
          </p>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-[#0B3B82]">
                  {editingId ? 'Edit Store Product' : 'Add New Wellness Store Product'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a product image or paste an image URL, then fill in pricing and clinical details.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={closeModal}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-bold text-red-700">
                  {formError}
                </div>
              )}

              {/* Image Upload + URL Section */}
              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-4 items-start rounded-2xl border border-[#DCE7F6] bg-[#F8FBFF] p-4">
                <div className="h-36 w-full rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden p-2">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImagePlus className="h-7 w-7 mx-auto mb-1" />
                      <span className="text-[11px] font-semibold">Image Preview</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="font-bold text-[#0B3B82] mb-1.5">Product Image</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0B3B82] hover:bg-[#082B5E] px-3.5 py-2 text-xs font-bold text-white transition">
                        <Upload className="h-3.5 w-3.5" />
                        <span>{imageLoading ? 'Processing…' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                        />
                      </label>

                      {form.image && (
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Or paste Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/product.jpg"
                      value={form.image.startsWith('data:') ? '' : form.image}
                      onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                    {form.image.startsWith('data:') && (
                      <p className="mt-1 text-[11px] font-semibold text-[#16A34A] flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded image ready
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#0B3B82] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Nayacura Vitality Zinc & Ginseng Complex"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B3B82] mb-1">
                    Category *
                  </label>
                  <select
                    value={form.group}
                    onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  >
                    {DEFAULT_STORE_GROUPS.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom category…</option>
                  </select>
                </div>

                {form.group === '__custom__' ? (
                  <div>
                    <label className="block font-bold text-[#0B3B82] mb-1">
                      Custom Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Couple Wellness"
                      value={form.customGroup}
                      onChange={(e) => setForm((prev) => ({ ...prev, customGroup: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-[#0B3B82] mb-1">
                      Pack / Quantity Info *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 60 Veg Capsules • 100% Herbal"
                      value={form.packageInfo}
                      onChange={(e) => setForm((prev) => ({ ...prev, packageInfo: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                )}

                {form.group === '__custom__' && (
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-[#0B3B82] mb-1">
                      Pack / Quantity Info *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 60 Veg Capsules • 100% Herbal"
                      value={form.packageInfo}
                      onChange={(e) => setForm((prev) => ({ ...prev, packageInfo: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-bold text-[#0B3B82] mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="599"
                    value={form.price}
                    onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#0B3B82] mb-1">
                    Original MRP (₹){' '}
                    {previewDiscount > 0 && (
                      <span className="ml-1 text-[#16A34A]">({previewDiscount}% OFF)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="999"
                    value={form.originalPrice}
                    onChange={(e) => setForm((prev) => ({ ...prev, originalPrice: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#0B3B82] mb-1">
                    Product Description & Clinical Details *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe benefits, key ingredients, usage instructions, and safety notes…"
                    value={form.desc}
                    onChange={(e) => setForm((prev) => ({ ...prev, desc: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
                  />
                </div>
              </div>

              {/* Order & Packaging Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.consult}
                    onChange={(e) => setForm((prev) => ({ ...prev, consult: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0B3B82]"
                  />
                  <span>
                    <span className="font-bold text-[#0B3B82] flex items-center gap-1">
                      <Stethoscope className="h-3.5 w-3.5" /> Requires Doctor Consultation
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Shows “Consult to Order” instead of direct “Add to Bag”.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.discreetPack}
                    onChange={(e) => setForm((prev) => ({ ...prev, discreetPack: e.target.checked }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#16A34A]"
                  />
                  <span>
                    <span className="font-bold text-[#0B3B82] flex items-center gap-1">
                      <Package className="h-3.5 w-3.5 text-[#16A34A]" /> 100% Plain Box Delivery
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Displays anonymous plain-box guarantee badge.
                    </span>
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition"
                >
                  <Plus className="h-4 w-4" />
                  {editingId ? 'Save Changes' : 'Add Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
