import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Dedicated Pages
import HomePage from './pages/HomePage';
import ConsultSexologistPage from './pages/ConsultSexologistPage';
import VideoConsultPage from './pages/VideoConsultPage';
import LabTestsPage from './pages/LabTestsPage';
import ProceduresPage from './pages/ProceduresPage';
import WellnessStorePage from './pages/WellnessStorePage';
import ConditionDetailPage from './pages/ConditionDetailPage';
import HealthFeedPage from './pages/HealthFeedPage';
import PrivacyStandardsPage from './pages/PrivacyStandardsPage';
import ForSexologistsPage from './pages/ForSexologistsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PatientLoginPage from './pages/PatientLoginPage';
import DoctorRegisterPage from './pages/DoctorRegisterPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import DoctorDashboardPage from './pages/DoctorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BookingScheduleModal from './components/BookingScheduleModal';

// Modals
import BookingModal from './components/BookingModal';
import VideoConsultModal from './components/VideoConsultModal';
import AppointmentsModal from './components/AppointmentsModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import AuthModal from './components/AuthModal';
import DoctorOnboardingModal from './components/DoctorOnboardingModal';
import FloatingAiChatButton from './components/FloatingAiChatButton';
import MobileTabBar from './components/MobileTabBar';
import { usePageSeo } from './lib/seo';

const PortalApp = lazy(() => import('./portal/PortalApp'));

// Resolved once per load so the demo appointment keeps a stable date.
const TODAY_ISO_DATE = new Date().toLocaleDateString('en-CA');

function WebsiteApp() {
  const location = useLocation();
  usePageSeo(location.pathname);
  const isDashboard = location.pathname.includes('dashboard');
  const isAuthPage = /^\/(login|patient-login|doctor-login|admin-login|doctor-register|doctor\/register)/.test(location.pathname);
  const showMobileTabBar = !isDashboard && !isAuthPage;
  const [selectedCity, setSelectedCity] = useState('Chennai');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nayacura_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('nayacura_user', JSON.stringify(userData));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setUser(null);
    try {
      localStorage.removeItem('nayacura_user');
    } catch (e) {
      console.error(e);
    }
  };

  // Appointments state with intimate wellness demo appointment
  const [appointments, setAppointments] = useState([
    {
      id: 'NC-2026-928104',
      doctorName: 'Dr. Arvind Swaminathan',
      doctorSpecialty: 'Clinical Sexologist',
      clinicName: 'Nayacura Men & Women Intimate Health Clinic',
      clinicAddress: '34, Sterling Road, Nungambakkam, Chennai',
      day: 'Today',
      date: TODAY_ISO_DATE,
      timeSlot: '04:30 PM',
      patientName: 'Karthik S.',
      fee: 800,
      type: 'clinic',
      status: 'Confirmed (100% Private Room)'
    }
  ]);

  // Wellness Store Orders State
  const [storeOrders, setStoreOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('nayacura_store_orders');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'NC-STORE-849201',
        name: 'Karthik S.',
        phone: '9840123456',
        address: '14, Greenways Road, R.A. Puram, Chennai, Tamil Nadu',
        city: 'Chennai',
        postcode: '600028',
        status: 'In Transit',
        trackingNumber: 'BLUEDART-NY-98214X',
        carrier: 'Blue Dart Express (Plain Box)',
        estimatedDelivery: 'Tomorrow by 2:00 PM',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
        count: 2,
        subtotal: 1298,
        delivery: 0,
        total: 1298,
        savings: 1100,
        lines: [
          {
            product: {
              id: 'treat-3',
              title: 'Pure Himalayan Shilajit Resin (Gold Grade)',
              price: 799,
              originalPrice: 1499,
              size: '20g Pure Resin with Brass Spoon',
              image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400'
            },
            quantity: 1
          },
          {
            product: {
              id: 'treat-2',
              title: 'Nayacura Pro-Delay Care Spray',
              price: 499,
              originalPrice: 899,
              size: 'Metered Dose Spray • 100+ Sprays',
              image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400'
            },
            quantity: 1
          }
        ]
      }
    ];
  });

  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const handleOpenTracking = (orderId = null) => {
    setTrackingOrderId(orderId);
    setIsTrackingModalOpen(true);
  };

  const handleOrderMedicine = (newOrder) => {
    setStoreOrders(prev => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('nayacura_store_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Modal Triggers
  const [bookingModalDoctor, setBookingModalDoctor] = useState(null);
  const [bookingConsultType, setBookingConsultType] = useState('clinic');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalDoctor, setVideoModalDoctor] = useState(null);

  const [isAppointmentsModalOpen, setIsAppointmentsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDoctorOnboardingOpen, setIsDoctorOnboardingOpen] = useState(false);

  // Handlers
  const handleBookAppointment = (doctor, type = 'clinic') => {
    setBookingModalDoctor(doctor);
    setBookingConsultType(type);
    setIsBookingModalOpen(true);
  };

  const handleStartVideoConsult = (doctor = null) => {
    setVideoModalDoctor(doctor);
    setIsVideoModalOpen(true);
  };

  const handleBookingSuccess = (newBooking) => {
    setAppointments(prev => [newBooking, ...prev]);
  };

  const handleTestBooked = (newLabOrder) => {
    setAppointments(prev => [newLabOrder, ...prev]);
  };

  const handleCancelAppointment = (id) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  // Full-screen dedicated route for Naya AI Chat
  if (location.pathname.startsWith('/ai')) {
    return (
      <Suspense fallback={<div className="min-h-screen grid place-items-center bg-slate-50 font-bold text-[#0B3B82]">Loading Naya AI…</div>}>
        <PortalApp />
      </Suspense>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand-green/20 selection:text-brand-green-dark ${showMobileTabBar ? 'pb-16 md:pb-0' : ''}`}>
      {/* Global Navigation - hidden on all dashboard portals */}
      {!isDashboard && (
        <Navbar
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          onOpenBookingModal={() => setIsScheduleModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenDoctorOnboarding={() => setIsDoctorOnboardingOpen(true)}
          onOpenAppointmentsModal={() => setIsAppointmentsModalOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {/* Dedicated Route Pages (Practo Style Navigation) */}
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage
                selectedCity={selectedCity}
                onOpenBookingSchedule={() => setIsScheduleModalOpen(true)}
                onBookAppointment={handleBookAppointment}
                onStartVideoConsult={handleStartVideoConsult}
              />
            } 
          />

          <Route 
            path="/consult-sexologist" 
            element={
              <ConsultSexologistPage
                selectedCity={selectedCity}
                selectedSpecialty={selectedSpecialty}
                setSelectedSpecialty={setSelectedSpecialty}
                onBookAppointment={handleBookAppointment}
                onStartVideoConsult={handleStartVideoConsult}
              />
            } 
          />

          <Route 
            path="/video-consult" 
            element={
              <VideoConsultPage
                selectedCity={selectedCity}
                selectedSpecialty={selectedSpecialty}
                setSelectedSpecialty={setSelectedSpecialty}
                onBookAppointment={handleBookAppointment}
                onStartVideoConsult={handleStartVideoConsult}
              />
            } 
          />

          <Route 
            path="/lab-tests" 
            element={
              <LabTestsPage
                selectedCity={selectedCity}
                onTestBooked={handleTestBooked}
              />
            } 
          />

          <Route 
            path="/intimate-procedures" 
            element={<ProceduresPage selectedCity={selectedCity} />} 
          />

          <Route 
            path="/wellness-store" 
            element={
              <WellnessStorePage 
                onOrderMedicine={handleOrderMedicine}
                storeOrders={storeOrders}
                onOpenTracking={handleOpenTracking}
              />
            } 
          />

          {/* In-depth Condition Guides (e.g. /condition/erectile-dysfunction, /condition/vaginismus) */}
          <Route 
            path="/condition/:slug" 
            element={
              <ConditionDetailPage
                onBookAppointment={handleBookAppointment}
                onStartVideoConsult={handleStartVideoConsult}
              />
            } 
          />

          <Route path="/health-feed" element={<HealthFeedPage />} />
          <Route path="/privacy-standards" element={<PrivacyStandardsPage />} />
          <Route path="/for-sexologists" element={<ForSexologistsPage onOpenDoctorOnboarding={() => setIsDoctorOnboardingOpen(true)} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route 
            path="/login" 
            element={
              <PatientLoginPage 
                onLoginSuccess={handleLoginSuccess}
                currentUser={user}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/patient-login" 
            element={
              <PatientLoginPage 
                onLoginSuccess={handleLoginSuccess}
                currentUser={user}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/doctor-login" 
            element={
              <PatientLoginPage 
                initialRole="doctor"
                onLoginSuccess={handleLoginSuccess}
                currentUser={user}
                onLogout={handleLogout}
              />
            } 
          />
          <Route
            path="/doctor-register"
            element={<DoctorRegisterPage />}
          />
          <Route
            path="/doctor/register"
            element={<DoctorRegisterPage />}
          />
          <Route 
            path="/admin-login" 
            element={
              <PatientLoginPage 
                initialRole="admin"
                onLoginSuccess={handleLoginSuccess}
                currentUser={user}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/patient-dashboard" 
            element={
              <PatientDashboardPage 
                user={user}
                onLogout={handleLogout}
                appointments={appointments}
                storeOrders={storeOrders}
                onOpenTracking={handleOpenTracking}
                onStartVideoConsult={handleStartVideoConsult}
                onOpenBookingSchedule={() => setIsScheduleModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/patient-dashboard/:section" 
            element={
              <PatientDashboardPage 
                user={user}
                onLogout={handleLogout}
                appointments={appointments}
                storeOrders={storeOrders}
                onOpenTracking={handleOpenTracking}
                onStartVideoConsult={handleStartVideoConsult}
                onOpenBookingSchedule={() => setIsScheduleModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/doctor-dashboard" 
            element={
              <DoctorDashboardPage 
                user={user}
                onLogout={handleLogout}
                onStartVideoConsult={handleStartVideoConsult}
              />
            } 
          />
          <Route 
            path="/doctor-dashboard/:section" 
            element={
              <DoctorDashboardPage 
                user={user}
                onLogout={handleLogout}
                onStartVideoConsult={handleStartVideoConsult}
              />
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <AdminDashboardPage 
                user={user}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/admin-dashboard/:section" 
            element={
              <AdminDashboardPage 
                user={user}
                onLogout={handleLogout}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <PatientDashboardPage 
                user={user}
                onLogout={handleLogout}
                appointments={appointments}
                storeOrders={storeOrders}
                onOpenTracking={handleOpenTracking}
                onStartVideoConsult={handleStartVideoConsult}
                onOpenBookingSchedule={() => setIsScheduleModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/dashboard/:section" 
            element={
              <PatientDashboardPage 
                user={user}
                onLogout={handleLogout}
                appointments={appointments}
                storeOrders={storeOrders}
                onOpenTracking={handleOpenTracking}
                onStartVideoConsult={handleStartVideoConsult}
                onOpenBookingSchedule={() => setIsScheduleModalOpen(true)}
              />
            } 
          />
        </Routes>
      </main>

      {/* Footer with full page links */}
      {!isDashboard && <Footer onOpenDoctorOnboarding={() => setIsDoctorOnboardingOpen(true)} />}

      {showMobileTabBar && <MobileTabBar user={user} onBook={() => setIsScheduleModalOpen(true)} />}

      {/* Global Interactive Modals */}
      {isScheduleModalOpen && (
        <BookingScheduleModal onClose={() => setIsScheduleModalOpen(false)} onBookingSuccess={handleBookingSuccess} />
      )}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        doctor={bookingModalDoctor}
        consultationType={bookingConsultType}
        onBookingSuccess={handleBookingSuccess}
      />

      <VideoConsultModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        preselectedDoctor={videoModalDoctor}
      />

      <AppointmentsModal
        isOpen={isAppointmentsModalOpen}
        onClose={() => setIsAppointmentsModalOpen(false)}
        appointments={appointments}
        onCancelAppointment={handleCancelAppointment}
        storeOrders={storeOrders}
        onTrackOrder={handleOpenTracking}
      />

      <OrderTrackingModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        orders={storeOrders}
        initialOrderId={trackingOrderId}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <DoctorOnboardingModal
        isOpen={isDoctorOnboardingOpen}
        onClose={() => setIsDoctorOnboardingOpen(false)}
      />

      {/* Global Floating Naya AI Companion Launcher */}
      {!isDashboard && <FloatingAiChatButton />}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <WebsiteApp />
    </BrowserRouter>
  );
}
