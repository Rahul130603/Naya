import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download, 
  XCircle, 
  Package, 
  Truck, 
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import Modal from './ui/Modal';

const money = amount => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export default function AppointmentsModal({ 
  isOpen, 
  onClose, 
  appointments = [], 
  onCancelAppointment,
  storeOrders = [],
  onTrackOrder
}) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'orders'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Appointments & Orders"
      subtitle="View and manage your upcoming doctor visits, lab tests, and wellness store deliveries"
      maxWidth="max-w-2xl"
    >
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'bookings'
              ? 'border-[#0B3B82] text-[#0B3B82]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Doctor Visits & Tests ({appointments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-[#16A34A] text-[#15803D]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="h-4 w-4 text-[#16A34A]" />
          <span>Wellness Store Orders ({storeOrders.length})</span>
          {storeOrders.length > 0 && (
            <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
          )}
        </button>
      </div>

      {/* Tab 1: Doctor Appointments */}
      {activeTab === 'bookings' && (
        appointments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">No appointments booked yet</h4>
            <p className="text-xs text-slate-400">
              When you book doctor appointments or lab tests, they will show up here.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#072658] transition"
            >
              Find a Doctor Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div 
                key={appt.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Booking ID: {appt.id}
                    </span>
                    <h4 className="text-base font-bold text-[#0B3B82] mt-0.5">
                      {appt.doctorName || appt.packageName}
                    </h4>
                    <p className="text-xs text-[#16A34A] font-semibold">
                      {appt.doctorSpecialty || 'Diagnostic Package'}
                    </p>
                    {appt.serviceName && <p className="mt-1 text-xs text-slate-600">{appt.serviceName}</p>}
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#15803D] text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {appt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Slot & Date</span>
                    <span className="font-bold text-slate-800">{appt.day || appt.date} • {appt.timeSlot || appt.slot}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Patient</span>
                    <span className="font-bold text-slate-800">{appt.patientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Amount Due</span>
                    <span className="font-bold text-[#0B3B82]">₹{appt.fee || appt.price} (Pay on visit)</span>
                  </div>
                </div>

                {appt.clinicName && (
                  <div className="text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{appt.clinicName}, {appt.clinicAddress}</span>
                  </div>
                )}

                {appt.address && (
                  <div className="text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>Sample Pickup Address: {appt.address}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 text-xs">
                  <button
                    onClick={() => alert(`Appointment slip for ${appt.id} downloaded successfully!`)}
                    className="text-[#0B3B82] hover:underline font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>Download Slip</span>
                  </button>

                  <button
                    onClick={() => onCancelAppointment(appt.id)}
                    className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Appointment</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      )}

      {/* Tab 2: Wellness Store Orders */}
      {activeTab === 'orders' && (
        storeOrders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">No store orders placed yet</h4>
            <p className="text-xs text-slate-400">
              When you purchase items from the Wellness Store, your orders and live tracking appear here.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold hover:bg-[#15803D] transition"
            >
              Shop Wellness Store
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {storeOrders.map((ord) => (
              <div 
                key={ord.id}
                className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-white shadow-xs space-y-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Order ID: {ord.id}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-[#0B3B82] mt-0.5">
                      {ord.lines?.length || ord.count || 1} Item(s) in Plain Box
                    </h4>
                    <p className="text-xs text-slate-500">
                      Placed on {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-bold text-[#15803D]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                    {ord.status || 'In Transit'}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(ord.lines || []).map(({ product, quantity }, idx) => (
                    <div 
                      key={product.id || idx}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 p-2 text-xs"
                    >
                      {product.image && (
                        <img 
                          src={product.image} 
                          alt={product.title} 
                          className="h-8 w-8 object-contain rounded-lg"
                        />
                      )}
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1 max-w-[140px]">
                          {product.title}
                        </p>
                        <p className="text-[10px] text-slate-400">Qty: {quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery & Price row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Estimated Arrival</span>
                    <span className="font-bold text-[#0B3B82]">{ord.estimatedDelivery || 'Within 24-48 Hours'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Recipient</span>
                    <span className="font-bold text-slate-800 truncate block">{ord.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Total Amount</span>
                    <span className="font-bold text-[#16A34A]">{money(ord.total)} (Paid)</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                    100% Plain packaging guarantee
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTrackOrder?.(ord.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0B3B82] to-[#072658] px-4 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all hover:scale-102"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live Delivery</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
      )}
    </Modal>
  );
}
