import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Heart, 
  Leaf, 
  LockKeyhole, 
  Minus, 
  Package, 
  Plus, 
  Search, 
  ShoppingBag, 
  SlidersHorizontal, 
  Stethoscope, 
  Trash2, 
  Truck, 
  ShieldCheck, 
  Lock, 
  Star,
  Sparkles
} from 'lucide-react';
import { getStoreCategories, listStoreProducts, subscribeStoreCatalog } from '../lib/storeCatalog';
import { CART_KEY, MAX_QUANTITY, cartTotals, normalizeCart } from '../lib/storeCart';
import ProductArtwork from './store/ProductArtwork';
import Modal from './ui/Modal';
import OrderTrackingModal from './OrderTrackingModal';

const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-101 disabled:opacity-40 disabled:cursor-not-allowed';
const primaryGreen = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-101 disabled:opacity-40 disabled:cursor-not-allowed';
const secondary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#0B3B82] hover:bg-slate-50 transition-colors shadow-2xs';
const inputStyle = 'mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#16A34A]';

function Quantity({ product, quantity, onChange }) {
  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs">
      <button 
        type="button" 
        aria-label={`Decrease ${product.title} quantity`} 
        onClick={() => onChange(product.id, -1)} 
        className="grid h-9 w-9 place-items-center text-slate-700 hover:bg-slate-50 transition-colors rounded-l-xl"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-7 text-center text-xs font-bold text-slate-800" aria-label={`${quantity} in bag`}>
        {quantity}
      </span>
      <button 
        type="button" 
        aria-label={`Increase ${product.title} quantity`} 
        disabled={quantity >= MAX_QUANTITY} 
        onClick={() => onChange(product.id, 1)} 
        className="grid h-9 w-9 place-items-center text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition-colors rounded-r-xl"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function OrderSummary({ totals }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between gap-3">
        <span className="text-slate-500 font-medium">Subtotal ({totals.count} items)</span>
        <span className="font-bold text-slate-800">{money(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-slate-500 font-medium">Delivery</span>
        <span className={totals.delivery ? 'font-bold text-slate-800' : 'font-bold text-[#16A34A]'}>
          {totals.delivery ? money(totals.delivery) : 'FREE'}
        </span>
      </div>
      <div className="flex justify-between gap-3 border-t border-slate-200 pt-4 text-lg font-extrabold text-[#0B3B82]">
        <span>Total</span>
        <span>{money(totals.total)}</span>
      </div>
      <p className="rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-[#15803D] border border-emerald-100">
        You save {money(totals.savings)} on listed product prices with 100% plain box delivery.
      </p>
    </div>
  );
}

export default function MedicinesSection({ onOrderMedicine, storeOrders = [], onOpenTracking, user }) {
  const [products, setProducts] = useState(() => listStoreProducts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All products');
  const [sort, setSort] = useState('featured');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartStep, setCartStep] = useState('cart');
  const [order, setOrder] = useState(null);
  const [notice, setNotice] = useState('');
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [cart, setCart] = useState(() => {
    try { 
      return normalizeCart(JSON.parse(localStorage.getItem(CART_KEY) || '[]'), listStoreProducts()); 
    } catch { 
      return []; 
    }
  });

  useEffect(() => subscribeStoreCatalog((nextProducts) => {
    setProducts(nextProducts);
    setCart((current) => normalizeCart(current, nextProducts));
  }), []);

  useEffect(() => { 
    try { 
      localStorage.setItem(CART_KEY, JSON.stringify(cart)); 
    } catch { 
      /* Shopping still works with storage disabled. */ 
    } 
  }, [cart]);

  const closeCart = useCallback(() => { 
    setCartOpen(false); 
    setCartStep('cart'); 
    setOrder(null); 
  }, []);

  const closeProduct = useCallback(() => setSelectedProduct(null), []);
  const totals = cartTotals(cart, products);
  const categories = getStoreCategories(products);

  const visibleProducts = products.filter(product => {
    const matchesCategory = category === 'All products' || product.group === category;
    const matchesSearch = `${product.title} ${product.name} ${product.group} ${product.desc || ''}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price;
    if (sort === 'price-high') return b.price - a.price;
    if (sort === 'savings') return (b.originalPrice - b.price) - (a.originalPrice - a.price);
    return 0;
  });

  const addToCart = product => {
    if (product.consult) return;
    setCart(current => normalizeCart([...current, { id: product.id, quantity: 1 }], products));
    setNotice(`${product.title} added to your bag.`);
  };

  const changeQuantity = (id, delta) => {
    setCart(current => normalizeCart(
      current.map(line => line.id === id ? { ...line, quantity: line.quantity + delta } : line), 
      products
    ));
  };

  const openCart = () => { 
    setSelectedProduct(null); 
    setCartStep('cart'); 
    setOrder(null); 
    setCartOpen(true); 
  };

  const placeOrder = event => {
    event.preventDefault();
    if (!totals.count || order) return;
    const form = new FormData(event.currentTarget);
    const orderId = `NC-STORE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const snapshot = { 
      ...totals, 
      id: orderId, 
      name: String(form.get('name')).trim(), 
      phone: String(form.get('phone')).trim(),
      address: String(form.get('address')).trim(),
      city: String(form.get('city')).trim(),
      postcode: String(form.get('postcode')).trim(),
      status: 'In Transit', 
      trackingNumber: `BLUEDART-NY-${Math.floor(100000 + Math.random() * 900000)}`,
      carrier: 'Blue Dart Express (Plain Box)',
      estimatedDelivery: 'Tomorrow by 2:00 PM',
      createdAt: new Date().toISOString(),
      lines: totals.lines
    };
    setOrder(snapshot);
    setCart([]);
    setCartStep('success');
    onOrderMedicine?.(snapshot);
  };

  return (
    <section id="medicines" className="storefront bg-slate-50 pb-16 pt-4 sm:pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Bag Header Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-[#0B3B82] transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-bold text-[#0B3B82]">Wellness Store</span>
          </nav>
          
          <div className="flex items-center gap-2.5">
            {user?.role === 'admin' && (
              <Link
                to="/admin-dashboard/store"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#0B3B82]/25 bg-blue-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-[#0B3B82] hover:bg-blue-100 transition-all shadow-xs"
              >
                <Plus className="h-4 w-4 text-[#0B3B82]" />
                <span>Manage Products</span>
              </Link>
            )}
            <button 
              type="button" 
              onClick={() => {
                if (onOpenTracking) onOpenTracking();
                else setTrackingModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-[#0B3B82] hover:border-[#16A34A] hover:bg-slate-50 transition-all shadow-xs"
            >
              <Truck className="h-4 w-4 text-[#16A34A]" />
              <span>Track Orders</span>
              {storeOrders.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-emerald-100 text-[#15803D] border border-emerald-200 px-1 text-[11px] font-bold">
                  {storeOrders.length}
                </span>
              )}
            </button>

            <button 
              type="button" 
              onClick={openCart} 
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#0B3B82] hover:border-emerald-300 hover:bg-slate-50 transition-all shadow-xs"
            >
              <ShoppingBag className="h-4 w-4 text-[#16A34A]" />
              <span>My bag</span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#0B3B82] px-1.5 text-[11px] font-bold text-white">
                {totals.count}
              </span>
            </button>
          </div>
        </div>

        {/* ================= HERO BANNER (Nayacura Wave Rectangle Style) ================= */}
        <div 
          className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-200/90 shadow-sm transition-all bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/condition-banner-bg.png')`,
            backgroundColor: '#F3FAF4'
          }}
        >
          <div className="relative z-10 grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.3fr_0.7fr] lg:p-12 items-center">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider shadow-xs">
                <Leaf className="w-3.5 h-3.5 text-[#16A34A]" />
                THE NAYACURA WELLNESS STORE
              </span>
              
              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-[#0B3B82] leading-tight">
                A Little Care. <br className="hidden sm:inline" />
                <span className="text-[#16A34A]">A Lot More Confidence.</span>
              </h1>
              
              <p className="mt-3 text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
                Doctor-formulated intimate essentials, natural vitality boosters, and clinically tested treatments. Delivered with complete discretion and zero judgment.
              </p>

              {/* Trust badges row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 border border-emerald-200 shadow-2xs">
                  <Package className="h-4 w-4 text-[#16A34A]" />
                  <span>100% Plain Box Delivery</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 border border-emerald-200 shadow-2xs">
                  <Truck className="h-4 w-4 text-[#16A34A]" />
                  <span>Free Shipping Above ₹799</span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 border border-emerald-200 shadow-2xs">
                  <ShieldCheck className="h-4 w-4 text-[#16A34A]" />
                  <span>Discreet Anonymous Packaging</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a 
                  href="#shop-products" 
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0B3B82] to-[#072658] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-102"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
                
                <Link 
                  to="/consult-sexologist"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 backdrop-blur-sm px-5 py-3 text-xs sm:text-sm font-bold text-[#0B3B82] hover:bg-white hover:border-[#16A34A] transition-all shadow-xs"
                >
                  <Stethoscope className="h-4 w-4 text-[#16A34A]" />
                  <span>Consult a Doctor</span>
                </Link>
              </div>
            </div>

            {/* Right Featured Showcase Card */}
            <div className="relative hidden lg:flex flex-col items-center justify-center">
              <div className="w-full max-w-sm rounded-3xl border border-emerald-200/90 bg-white/95 p-6 shadow-card-soft backdrop-blur-md relative overflow-hidden group hover:border-[#16A34A] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-[#15803D] px-2.5 py-1 text-[11px] font-bold">
                    <Sparkles className="w-3 h-3" /> Best Seller
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">100% Herbal & Pure</span>
                </div>
                
                <div className="relative h-44 w-full rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white flex items-center justify-center overflow-hidden mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400" 
                    alt="Himalayan Shilajit Resin"
                    className="h-36 w-36 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" 
                  />
                  <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                    Pure Gold Grade
                  </span>
                </div>

                <h4 className="text-sm font-bold text-[#0B3B82] line-clamp-1">
                  Pure Himalayan Shilajit Resin (Fulvic Acid &gt;75%)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">20g Pure Resin with Brass Spoon</p>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-base font-extrabold text-[#0B3B82]">₹799</span>
                    <span className="ml-2 text-xs text-slate-400 line-through">₹1,499</span>
                  </div>
                  <span className="text-xs font-bold text-[#15803D] bg-emerald-50 px-2 py-1 rounded-lg">
                    46% OFF
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= 3 TRUST PILLARS BAR ================= */}
        <div className="mb-10 grid grid-cols-1 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 shadow-xs">
          {[
            { 
              Icon: Package, 
              title: '100% Plain Discreet Packaging', 
              copy: 'Plain brown cardboard box. No mention of Nayacura or products on the exterior.' 
            },
            { 
              Icon: Truck, 
              title: 'Free Express Delivery Above ₹799', 
              copy: 'Fast dispatch with tracking. Standard ₹49 for smaller orders.' 
            },
            { 
              Icon: Stethoscope, 
              title: 'Doctor Guidance on Prescriptions', 
              copy: 'Free confidential specialist follow-up for medical treatments.' 
            }
          ].map(({ Icon, title, copy }) => (
            <div key={title} className="flex items-start gap-3.5 p-5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-100">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B3B82]">{title}</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{copy}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= PRODUCT CATALOG SECTION ================= */}
        <div id="shop-products" className="scroll-mt-24">
          
          {/* Header & Search */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                YOUR DAILY INTIMATE WELLNESS
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#0B3B82] sm:text-3xl">
                Find Your Wellness Essentials
              </h2>
            </div>
            
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="search" 
                aria-label="Search store products" 
                placeholder="Search products, shilajit, spray…" 
                value={search} 
                onChange={event => setSearch(event.target.value)} 
                className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#16A34A] shadow-2xs" 
              />
            </div>
          </div>

          {/* Categories & Sort Bar */}
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center">
            
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2" aria-label="Product categories">
              {categories.map(item => (
                <button 
                  key={item} 
                  type="button" 
                  aria-pressed={category === item} 
                  onClick={() => setCategory(item)} 
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                    category === item 
                      ? 'bg-[#0B3B82] text-white shadow-xs' 
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-[#16A34A] hover:text-[#0B3B82]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-bold text-slate-700">Sort by:</span>
              <select 
                value={sort} 
                onChange={event => setSort(event.target.value)} 
                className="min-h-10 min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-bold text-[#0B3B82] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="savings">Biggest Savings</option>
              </select>
            </label>
          </div>

          {/* Count note */}
          <div className="mb-6 flex flex-wrap justify-between gap-2 text-xs font-semibold text-slate-500">
            <p>{visibleProducts.length} verified products {category !== 'All products' && `in ${category}`}</p>
            <p className="flex items-center gap-1.5 text-[#16A34A]">
              <LockKeyhole className="h-3.5 w-3.5" /> 100% Plain packaging on all orders
            </p>
          </div>

          <p role="status" aria-live="polite" className="sr-only">{notice}</p>

          {/* Product Cards Grid */}
          {visibleProducts.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map(product => {
                const quantity = cart.find(line => line.id === product.id)?.quantity || 0;
                const discount = Math.round((1 - product.price / product.originalPrice) * 100);
                
                return (
                  <article 
                    key={product.id} 
                    className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-card-soft hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                  >
                    {/* Clickable Image Area */}
                    <button 
                      type="button" 
                      onClick={() => setSelectedProduct(product)} 
                      className="relative block w-full text-left bg-gradient-to-b from-slate-50/80 to-white p-5 border-b border-slate-100" 
                      aria-label={`View ${product.title}`}
                    >
                      <div className="h-52 w-full flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.title} 
                            className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <ProductArtwork product={product} className="h-full w-full" />
                        )}
                      </div>

                      {/* Top Badges */}
                      <span className="absolute left-4 top-4 rounded-full border border-emerald-200 bg-white/95 px-3 py-1 text-[11px] font-bold text-[#15803D] shadow-xs">
                        {product.consult ? '🩺 Doctor-guided' : `${discount}% OFF`}
                      </span>
                      
                      <span className="absolute right-4 top-4 rounded-full bg-white/90 border border-slate-200/80 px-2.5 py-1 text-[10px] font-bold text-slate-600 shadow-2xs">
                        📦 Plain Box
                      </span>
                    </button>

                    {/* Card Details */}
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#16A34A]">
                        {product.group}
                      </p>
                      
                      <button 
                        type="button" 
                        onClick={() => setSelectedProduct(product)} 
                        className="mt-1.5 text-left text-base font-bold leading-snug text-[#0B3B82] group-hover:text-[#16A34A] transition-colors line-clamp-2"
                      >
                        {product.title}
                      </button>
                      
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {product.packageInfo || product.size}
                      </p>
                      
                      <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {product.desc || product.copy}
                      </p>

                      {/* Price & Savings */}
                      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-extrabold text-[#0B3B82]">
                            {money(product.price)}
                          </span>
                          <span className="text-xs font-medium text-slate-400 line-through">
                            {money(product.originalPrice)}
                          </span>
                        </div>
                        
                        <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-[#15803D] border border-emerald-100">
                          Save {money(product.originalPrice - product.price)}
                        </span>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-5">
                        {product.consult ? (
                          <Link 
                            to="/consult-sexologist" 
                            className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-101"
                          >
                            <Stethoscope className="h-4 w-4" /> 
                            <span>Consult to Order</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : quantity ? (
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <Quantity product={product} quantity={quantity} onChange={changeQuantity} />
                            <button 
                              type="button" 
                              onClick={openCart} 
                              className="inline-flex min-h-10 items-center gap-1.5 text-xs font-bold text-[#15803D] bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                            >
                              <Check className="h-4 w-4" /> In your bag
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => addToCart(product)} 
                            className="w-full inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-101"
                          >
                            <Plus className="h-4 w-4" /> 
                            <span>Add to Bag</span>
                          </button>
                        )}
                      </div>

                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Search className="mx-auto mb-4 h-10 w-10 text-slate-300" />
              <h3 className="text-xl font-bold text-[#0B3B82]">No products found</h3>
              <p className="mt-2 text-sm text-slate-500">Try a different search keyword or explore all our wellness essentials.</p>
              <button 
                type="button" 
                className={`${secondary} mt-5`} 
                onClick={() => { setSearch(''); setCategory('All products'); }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* ================= 100% DISCREET PACKAGING GUARANTEE BANNER ================= */}
        <div className="mt-14 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/60 p-7 sm:p-9 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-[#16A34A] shadow-2xs">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B3B82] text-sm">1. Plain Cardboard Box</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Completely plain, unbranded box. Zero logos or references to intimacy products.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-[#16A34A] shadow-2xs">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B3B82] text-sm">2. Anonymous Barcode Label</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Only your delivery address and tracking ID. Product contents are never mentioned.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 text-[#16A34A] shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-[#0B3B82] text-sm">3. Tamper-Proof Seal</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Sealed with security tape. Safe, confidential doorstep delivery guaranteed.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ================= DOCTOR CONSULTATION CALLOUT ================= */}
        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl border border-emerald-200 bg-white p-7 sm:p-9 sm:flex-row sm:items-center shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-[#16A34A]">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B3B82] text-base sm:text-lg">
                Not sure what’s right for your intimate health?
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                A 100% confidential online consultation with verified sexologists can help you choose the right doctor-approved plan.
              </p>
            </div>
          </div>
          
          <Link 
            to="/consult-sexologist" 
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-102 shrink-0"
          >
            <span>Talk to a specialist</span> 
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          Nayacura Health Technologies Ltd. All sexual wellness essentials are shipped in 100% plain, unbranded packaging.
        </p>
      </div>

      {/* Floating Bottom Bag Button for Mobile */}
      {totals.count > 0 && !cartOpen && (
        <div className="store-mobile-cart fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-xl sm:hidden">
          <button type="button" onClick={openCart} className={`${primary} w-full justify-between`}>
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[#16A34A]" /> View bag ({totals.count})
            </span>
            <span>{money(totals.total)} <span aria-hidden="true">→</span></span>
          </button>
        </div>
      )}

      {/* Product Details Modal */}
      <Modal isOpen={!!selectedProduct} onClose={closeProduct} title="Product details" maxWidth="max-w-2xl">
        {selectedProduct && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="h-64 w-full rounded-2xl bg-slate-50 flex items-center justify-center p-4 overflow-hidden border border-slate-100">
              {selectedProduct.image ? (
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.title} 
                  className="max-h-full max-w-full object-contain" 
                />
              ) : (
                <ProductArtwork product={selectedProduct} className="min-h-56 rounded-2xl" />
              )}
            </div>
            
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[#16A34A]">
                {selectedProduct.group}
              </p>
              
              <h3 className="mt-2 text-xl font-extrabold text-[#0B3B82]">
                {selectedProduct.title}
              </h3>
              
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {selectedProduct.packageInfo || selectedProduct.size}
              </p>
              
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                {selectedProduct.desc || selectedProduct.copy}
              </p>
              
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#0B3B82]">
                  {money(selectedProduct.price)}
                </span>
                <span className="text-sm font-normal text-slate-400 line-through">
                  {money(selectedProduct.originalPrice)}
                </span>
              </div>
              
              <p className="mb-5 mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Package className="h-4 w-4 text-[#16A34A]" /> 100% Plain packaging guaranteed
              </p>
              
              {selectedProduct.consult ? (
                <Link 
                  onClick={closeProduct} 
                  to="/consult-sexologist" 
                  className={`${primary} w-full`}
                >
                  Consult before ordering <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <button 
                    type="button" 
                    onClick={() => addToCart(selectedProduct)} 
                    disabled={(cart.find(line => line.id === selectedProduct.id)?.quantity || 0) >= MAX_QUANTITY} 
                    className={`${primaryGreen} w-full`}
                  >
                    Add to bag <Plus className="h-4 w-4" />
                  </button>
                  <button 
                    type="button" 
                    onClick={openCart} 
                    className={`${secondary} mt-2 w-full`}
                  >
                    View your bag ({totals.count})
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cart & Checkout Modal */}
      <Modal 
        isOpen={cartOpen} 
        onClose={closeCart} 
        title={
          cartStep === 'success' 
            ? 'Your order is ready'
            : cartStep === 'checkout' 
              ? 'Delivery details' 
              : `Your shopping bag (${totals.count})`
        } 
        subtitle={
          cartStep === 'success' 
            ? 'No payment was collected and no order will be dispatched.' 
            : '100% confidential sexual wellness essentials, delivered with discretion.'
        } 
        maxWidth="max-w-3xl"
      >
        {cartStep === 'success' && order ? (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-[#16A34A]">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0B3B82]">Order Confirmed, {order.name}!</h3>
                <p className="text-xs text-slate-500">
                  Order ID: <strong className="text-slate-800">{order.id}</strong> • 100% Plain Box Delivery
                </p>
              </div>
            </div>

            {/* Live Tracking Status Preview */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B3B82] flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-[#16A34A]" />
                  Live Delivery Status: <span className="text-[#16A34A]">{order.status || 'In Transit'}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  AWB: {order.trackingNumber || 'BLUEDART-NY-98214X'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your package is sealed with tamper-proof security tape in an unbranded brown corrugated box. Courier tracking is active.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200">
              <OrderSummary totals={order} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => {
                  closeCart();
                  if (onOpenTracking) onOpenTracking(order.id);
                  else {
                    setTrackingOrderId(order.id);
                    setTrackingModalOpen(true);
                  }
                }} 
                className={`${primaryGreen} w-full`}
              >
                <Truck className="h-4 w-4" />
                <span>Track Live Package</span>
              </button>
              
              <button 
                type="button" 
                onClick={closeCart} 
                className={`${secondary} w-full`}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : !totals.count ? (
          <div className="py-10 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-xl font-bold text-[#0B3B82]">Your bag is feeling a little empty</h3>
            <p className="mt-2 text-sm text-slate-500">Find a few essentials for your self-care routine.</p>
            <button type="button" onClick={closeCart} className={`${primary} mt-6`}>
              Explore products <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : cartStep === 'checkout' ? (
          <form onSubmit={placeOrder} className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={() => setCartStep('cart')} 
                className="min-h-9 text-xs font-bold text-[#0B3B82] hover:underline"
              >
                ← Back to your bag
              </button>
              
              <label className="block text-xs font-bold text-slate-700">
                Full name
                <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputStyle} />
              </label>
              
              <label className="block text-xs font-bold text-slate-700">
                Mobile number
                <input name="phone" type="tel" required pattern="[0-9]{10}" title="Enter a 10-digit mobile number" inputMode="numeric" maxLength={10} autoComplete="tel-national" className={inputStyle} />
              </label>
              
              <label className="block text-xs font-bold text-slate-700">
                Delivery address
                <textarea name="address" required minLength={10} maxLength={500} autoComplete="street-address" rows={3} className={inputStyle} />
              </label>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-slate-700">
                  City
                  <input name="city" required maxLength={100} autoComplete="address-level2" className={inputStyle} />
                </label>
                <label className="block text-xs font-bold text-slate-700">
                  PIN code
                  <input name="postcode" required pattern="[1-9][0-9]{5}" inputMode="numeric" maxLength={6} autoComplete="postal-code" className={inputStyle} />
                </label>
              </div>
            </div>
            
            <div className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-4 font-bold text-[#0B3B82]">Order summary</h3>
              <OrderSummary totals={totals} />
              <p className="my-4 flex items-start gap-2 text-xs leading-relaxed text-slate-500">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#16A34A]" />
                Secure checkout. Pay on delivery or online; dispensed in plain, unbranded packaging.
              </p>
              <button type="submit" className={`${primaryGreen} w-full`}>
                Place order <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              {totals.lines.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3 border-b border-slate-100 pb-4">
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center p-2 border border-slate-100 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <ProductArtwork product={product} className="h-full w-full" />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-[#0B3B82] line-clamp-1">{product.title}</h3>
                      <button 
                        type="button" 
                        onClick={() => setCart(current => current.filter(line => line.id !== product.id))} 
                        aria-label={`Remove ${product.title} from bag`} 
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="mb-2 text-xs text-slate-500">{product.packageInfo || product.size}</p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Quantity product={product} quantity={quantity} onChange={changeQuantity} />
                      <span className="text-sm font-bold text-[#0B3B82]">{money(product.price * quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="self-start rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="mb-4 font-bold text-[#0B3B82]">Order summary</h3>
              <OrderSummary totals={totals} />
              
              {totals.subtotal < 799 && (
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Add {money(799 - totals.subtotal)} more for free delivery.
                </p>
              )}
              
              <button 
                type="button" 
                onClick={() => setCartStep('checkout')} 
                className={`${primaryGreen} mt-5 w-full`}
              >
                Continue to checkout <ArrowRight className="h-4 w-4" />
              </button>
              
              <button 
                type="button" 
                onClick={closeCart} 
                className={`${secondary} mt-2 w-full`}
              >
                Continue shopping
              </button>
              
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <LockKeyhole className="h-3 w-3 text-[#16A34A]" /> Private, 100% plain packaging
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Order Tracking Modal fallback if not handled at root */}
      {!onOpenTracking && (
        <OrderTrackingModal
          isOpen={trackingModalOpen}
          onClose={() => setTrackingModalOpen(false)}
          orders={storeOrders}
          activeOrderId={trackingOrderId}
        />
      )}
    </section>
  );
}
