import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Lock, 
  ShieldCheck, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  Search,
  ExternalLink,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import Modal from './ui/Modal';

const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function OrderTrackingModal({ 
  isOpen, 
  onClose, 
  orders = [], 
  initialOrderId = null 
}) {
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId || (orders[0]?.id || null));
  const [copied, setCopied] = useState(false);

  // Sync active order if changed
  const currentOrder = orders.find(o => o.id === activeOrderId) || orders[0] || null;

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepProgress = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 4;
      case 'out for delivery':
        return 3;
      case 'in transit':
      case 'dispatched':
        return 2;
      case 'packed':
        return 1;
      case 'confirmed':
      case 'demo order':
      default:
        return 2; // Default realistic preview: In Transit
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discreet Package Tracking & Order Details"
      subtitle="100% confidential sexual wellness delivery • Zero brand names on exterior box"
      maxWidth="max-w-3xl"
    >
      {!orders.length ? (
        <div className="py-12 text-center space-y-4">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-[#16A34A] border border-emerald-100">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#0B3B82]">No orders placed yet</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              When you order products from the Wellness Store, your tracking timeline and package details will appear here.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all"
          >
            Explore Wellness Store
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Order Selector Tab if multiple orders */}
          {orders.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-100">
              {orders.map((ord) => (
                <button
                  key={ord.id}
                  type="button"
                  onClick={() => setActiveOrderId(ord.id)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    currentOrder?.id === ord.id
                      ? 'bg-[#0B3B82] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300'
                  }`}
                >
                  {ord.id} • {ord.status || 'In Transit'}
                </button>
              ))}
            </div>
          )}

          {currentOrder && (
            <div className="space-y-6">
              
              {/* Order Status Header Card */}
              <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 p-6 shadow-xs">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#0B3B82]">
                        Order ID: {currentOrder.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyId(currentOrder.id)}
                        className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-700 transition-colors"
                        title="Copy Order ID"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-[#16A34A]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Placed on {new Date(currentOrder.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-[#15803D]">
                    <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
                    {currentOrder.status || 'In Transit (Discreet Courier)'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-emerald-100/80 pt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Estimated Delivery</span>
                    <span className="font-bold text-[#0B3B82] text-sm">
                      {currentOrder.estimatedDelivery || 'Within 24-48 Hours'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Tracking AWB</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {currentOrder.trackingNumber || 'BLUEDART-NY-98214X'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Delivery Partner</span>
                    <span className="font-bold text-slate-800">
                      {currentOrder.carrier || 'Blue Dart Express (Plain Box)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Live Visual 4-Step Tracking Timeline */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h4 className="text-sm font-bold text-[#0B3B82] mb-5 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#16A34A]" />
                  Live Delivery Journey & Privacy Status
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:bottom-3 before:left-[11px] before:top-3 before:w-0.5 before:bg-emerald-200">
                  
                  {/* Step 1 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#16A34A] text-white ring-4 ring-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-[#0B3B82]">1. Order Confirmed & Clinically Verified</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Order received in secure medical dispatch queue. Prescription safety check completed.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-[#16A34A] text-white ring-4 ring-white">
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-[#0B3B82]">2. Packed in 100% Plain Brown Cardboard Box</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Double-layered tamper-proof seal applied. Zero mention of "Nayacura", "Sexology", or products on exterior box.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start gap-3">
                    <span className="absolute -left-6 mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white ring-4 ring-white animate-pulse">
                      <Clock className="h-3.5 w-3.5 stroke-[2.5]" />
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-[#0B3B82]">3. Dispatched in Transit via Express Courier</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Package moving through regional sorting hub. AWB: <strong className="text-slate-700">{currentOrder.trackingNumber || 'BLUEDART-NY-98214X'}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-start gap-3 opacity-60">
                    <span className="absolute -left-6 mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-slate-500 ring-4 ring-white">
                      <MapPin className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-slate-700">4. Out for Discreet Doorstep Delivery</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Courier associate in casual attire delivers package directly into your hands.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Items in Package */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h4 className="text-sm font-bold text-[#0B3B82] mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#16A34A]" />
                    Items in This Plain Package ({currentOrder.lines?.length || currentOrder.count || 1})
                  </span>
                  <span className="text-xs font-bold text-[#15803D] bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    100% Confidential
                  </span>
                </h4>

                <div className="space-y-3 divide-y divide-slate-100">
                  {(currentOrder.lines || []).map(({ product, quantity }, idx) => (
                    <div key={product.id || idx} className="pt-3 first:pt-0 flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center p-1.5 border border-slate-100 overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Package className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs font-bold text-[#0B3B82] truncate">
                          {product.title}
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          {product.size || product.packageInfo || 'Discreet unit'} • Qty: {quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-[#0B3B82]">
                          {money(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="mt-5 border-t border-slate-100 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">{money(currentOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Plain Box Packaging & Tamper Seal</span>
                    <span className="font-bold text-[#16A34A]">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Express Delivery</span>
                    <span className={currentOrder.delivery ? 'font-semibold text-slate-800' : 'font-bold text-[#16A34A]'}>
                      {currentOrder.delivery ? money(currentOrder.delivery) : 'FREE'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-extrabold text-[#0B3B82]">
                    <span>Total Paid</span>
                    <span>{money(currentOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Customer Info */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <h4 className="text-sm font-bold text-[#0B3B82] mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#16A34A]" />
                  Delivery Address
                </h4>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-1.5">
                  <p className="font-bold text-slate-800 text-sm">
                    {currentOrder.name}
                  </p>
                  <p className="text-slate-600 font-medium">
                    Phone: {currentOrder.phone || '+91 ••••• •••••'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {currentOrder.address || 'Address provided during checkout'}
                  </p>
                  {currentOrder.city && (
                    <p className="text-slate-700 font-semibold">
                      {currentOrder.city} {currentOrder.postcode && `- ${currentOrder.postcode}`}
                    </p>
                  )}
                </div>
              </div>

              {/* 100% Privacy Guarantee Footnote */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#0B3B82]">100% Unbranded Packaging Guarantee:</strong> Your package arrives in a plain brown corrugated box. The courier company and delivery driver have zero knowledge of what is inside.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => alert(`Invoice & receipt for ${currentOrder.id} generated successfully!`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0B3B82] hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <Download className="h-3.5 w-3.5 text-[#16A34A]" />
                  <span>Download Invoice Slip</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-5 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all"
                >
                  Close Tracking
                </button>
              </div>

            </div>
          )}

        </div>
      )}
    </Modal>
  );
}
