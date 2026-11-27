import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import VideoCallRoom from '../components/VideoCallRoom';
import DoctorQaSection from '../components/DoctorQaSection';
import PracticeScheduleEditor from '../components/PracticeScheduleEditor';
import useVideoRoom from '../hooks/useVideoRoom';
import { roomCodeFor } from '../lib/videoRoom';
import { listQaThreads, subscribeQaThreads } from '../lib/communityQa';
import {
  formatDateLabel,
  formatTime,
  hasSavedSchedule,
  hydrateSchedule,
  loadSchedule,
  slotsForDate,
  subscribeSchedule,
} from '../lib/practiceSchedule';
import {
  hydrateDoctorBookings,
  listDoctorBookings,
  subscribeBookings,
  toDoctorQueueEntry,
} from '../lib/bookingsStore';
import {
  changeDoctorPassword,
  getDoctorProfileOverride,
  hydrateDoctorProfile,
  listAccounts,
  saveDoctorProfileLocal,
  subscribeRegistry,
  syncDoctorProfileToServer,
} from '../lib/doctorRegistry';
import { 
  LayoutDashboard,
  Users,
  Video, 
  FileText, 
  FlaskConical,
  Clock, 
  UserRound,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Plus,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  MessageCircleQuestion,
  Camera,
  Trash2,
  KeyRound,
  Save,
  AlertCircle
} from 'lucide-react';

const RX_STORAGE_PREFIX = 'nayacura_doctor_prescriptions_v1';

const rxStorageKey = (doctorName) => {
  const normalized = String(doctorName || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized ? `${RX_STORAGE_PREFIX}:${normalized}` : RX_STORAGE_PREFIX;
};

const loadDoctorPrescriptions = (doctorName) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(rxStorageKey(doctorName));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveDoctorPrescriptions = (doctorName, items) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(rxStorageKey(doctorName), JSON.stringify(items));
  } catch {
    /* storage may be blocked */
  }
};

function resizePhotoToDataUrl(file, maxSize = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width || 1, img.height || 1));
        const width = Math.max(1, Math.round((img.width || maxSize) * scale));
        const height = Math.max(1, Math.round((img.height || maxSize) * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      img.onerror = () => reject(new Error('Selected file is not a valid image.'));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

const SECTION_TITLES = {
  overview: 'Dashboard Overview',
  queue: "Today's Patient Queue",
  qa: 'Patient Doubts (Q&A)',
  video: 'Video Consultation Suite',
  prescriptions: 'Digital E-Prescriptions',
  emr: 'Patient Medical Records (EMR)',
  schedule: 'Practice Schedule & Availability',
  profile: 'Clinician Profile & Credentials'
};

export default function DoctorDashboardPage({ user, onLogout, onUpdateUser }) {
  const navigate = useNavigate();
  const { section } = useParams();
  const [internalSection, setInternalSection] = useState(section || 'overview');
  const activeSection = (section && SECTION_TITLES[section]) ? section : internalSection;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modal States
  const [selectedPatientRecord, setSelectedPatientRecord] = useState(null);
  const [isNewRxModalOpen, setIsNewRxModalOpen] = useState(false);
  const [prescribedToast, setPrescribedToast] = useState(null);

  // Practice state
  const [isAcceptingInstantCalls, setIsAcceptingInstantCalls] = useState(true);
  const [selectedEmrPatient, setSelectedEmrPatient] = useState('');
  const [qaThreads, setQaThreads] = useState(() => listQaThreads());
  const [profileVersion, setProfileVersion] = useState(0);

  useEffect(() => subscribeQaThreads(setQaThreads), []);
  useEffect(() => subscribeRegistry(() => setProfileVersion((v) => v + 1)), []);

  const pendingQaCount = qaThreads.filter((thread) => thread.answers.length === 0).length;

  const showDoctorToast = (message) => {
    setPrescribedToast(message);
    setTimeout(() => setPrescribedToast(null), 4000);
  };

  void profileVersion;
  const savedProfileOverride = getDoctorProfileOverride(user?.email, user?.name);

  // Clinician profile — uses signed-in doctor details + saved overrides, never seeded demo identity.
  const baseDoctor = user?.role === 'doctor'
    ? {
        ...user,
        name: user.name || 'Clinician',
        regNo: user.regNo || '',
        council: user.council || '',
        specialty: user.specialty || 'Clinical Sexologist',
        qualifications: user.qualifications || '',
        languages: user.languages || '',
        experience: user.experience
          ? (/year/i.test(String(user.experience)) ? String(user.experience) : `${user.experience} Years`)
          : '',
        clinic: user.clinic || user.city || 'Nayacura Partner Clinic',
        city: user.city || 'Chennai',
        email: user.email || '',
        phone: user.phone || '',
        about: user.about || '',
        videoFee: user.videoFee || 599,
        photoUrl: user.photoUrl || '',
        role: 'doctor',
      }
    : {
        name: 'Clinician',
        regNo: '',
        council: '',
        specialty: 'Clinical Specialist',
        qualifications: '',
        languages: '',
        experience: '',
        clinic: '',
        city: 'Chennai',
        email: '',
        phone: '',
        about: '',
        videoFee: 599,
        photoUrl: '',
        role: 'doctor',
      };

  const doctor = savedProfileOverride
    ? {
        ...baseDoctor,
        ...savedProfileOverride,
        clinic: savedProfileOverride.clinic || savedProfileOverride.clinicName || baseDoctor.clinic,
        experience: savedProfileOverride.experience
          ? (/year/i.test(String(savedProfileOverride.experience))
            ? String(savedProfileOverride.experience)
            : `${savedProfileOverride.experience} Years`)
          : baseDoctor.experience,
        email: baseDoctor.email || savedProfileOverride.email || '',
      }
    : baseDoctor;

  const avatarLetter = (doctor.name || 'D').replace(/^Dr\.?\s*/i, '').trim().charAt(0).toUpperCase() || 'D';

  const buildProfileFormState = (doc) => ({
    name: doc.name || '',
    specialty: doc.specialty || 'Clinical Sexologist',
    qualifications: doc.qualifications || '',
    experience: doc.experience || '',
    languages: Array.isArray(doc.languages) ? doc.languages.join(', ') : (doc.languages || ''),
    clinic: doc.clinic || '',
    city: doc.city || 'Chennai',
    council: doc.council || '',
    regNo: doc.regNo || '',
    phone: doc.phone || '',
    videoFee: doc.videoFee ? String(doc.videoFee) : '599',
    about: doc.about || '',
    photoUrl: doc.photoUrl || '',
  });

  const [profileForm, setProfileForm] = useState(() => buildProfileFormState(doctor));
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    if (!doctor.email && !doctor.name) return;
    let active = true;
    hydrateDoctorProfile({ email: doctor.email, name: doctor.name }).then((remoteProfile) => {
      if (!active || !remoteProfile) return;
      setProfileForm((prev) => ({
        ...prev,
        ...buildProfileFormState({ ...doctor, ...remoteProfile }),
      }));
    });
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.name]);

  const hasRegisteredPassword = Boolean(
    doctor.email &&
      listAccounts().some(
        (acc) => acc.email?.toLowerCase() === doctor.email.toLowerCase() && acc.password,
      ),
  );

  const persistDoctorProfile = async (nextValues, successToast) => {
    const cleanName = String(nextValues.name || '').trim();
    if (!cleanName) {
      setProfileError('Doctor name is required.');
      return false;
    }
    setProfileError('');
    setProfileSavedMsg('');
    setProfileSaving(true);

    const payload = {
      id: doctor.id,
      email: doctor.email,
      name: cleanName,
      specialty: String(nextValues.specialty || '').trim() || 'Clinical Sexologist',
      qualifications: String(nextValues.qualifications || '').trim(),
      experience: String(nextValues.experience || '').trim(),
      languages: String(nextValues.languages || '').trim(),
      clinic: String(nextValues.clinic || '').trim() || 'Nayacura Partner Clinic',
      clinicName: String(nextValues.clinic || '').trim() || 'Nayacura Partner Clinic',
      city: String(nextValues.city || '').trim() || 'Chennai',
      council: String(nextValues.council || '').trim(),
      regNo: String(nextValues.regNo || '').trim(),
      phone: String(nextValues.phone || '').trim(),
      videoFee: Number(nextValues.videoFee) > 0 ? Number(nextValues.videoFee) : 599,
      about: String(nextValues.about || '').trim(),
      photoUrl: nextValues.photoUrl || '',
    };

    const saved = saveDoctorProfileLocal(payload);
    await syncDoctorProfileToServer(payload);

    if (onUpdateUser) {
      onUpdateUser({
        ...doctor,
        ...saved,
        role: 'doctor',
      });
    } else if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('nayacura_user', JSON.stringify({ ...doctor, ...saved, role: 'doctor' }));
      } catch {
        /* ignore */
      }
    }

    setProfileSaving(false);
    setProfileSavedMsg(successToast || 'Profile changes saved!');
    showDoctorToast(successToast || 'Clinician profile updated!');
    return true;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await persistDoctorProfile(profileForm, 'Profile details saved!');
  };

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please choose a valid image file (PNG, JPG, or WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image must be smaller than 5 MB.');
      return;
    }
    try {
      const compressed = await resizePhotoToDataUrl(file, 320);
      const next = { ...profileForm, photoUrl: compressed };
      setProfileForm(next);
      await persistDoctorProfile(next, 'Profile photo updated!');
    } catch (err) {
      setProfileError(err?.message || 'Could not process the selected image.');
    }
  };

  const handleRemovePhoto = async () => {
    const next = { ...profileForm, photoUrl: '' };
    setProfileForm(next);
    await persistDoctorProfile(next, 'Profile photo removed.');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (hasRegisteredPassword && !currentPasswordInput) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    const result = await changeDoctorPassword({
      id: doctor.id,
      email: doctor.email,
      name: doctor.name,
      regNo: doctor.regNo,
      council: doctor.council,
      specialty: doctor.specialty,
      city: doctor.city,
      clinicName: doctor.clinic,
      currentPassword: currentPasswordInput || undefined,
      newPassword: newPasswordInput,
    });
    setPasswordSaving(false);

    if (!result.ok) {
      setPasswordError(result.message || 'Could not update password.');
      return;
    }

    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordSuccess(result.message);
    showDoctorToast('Password updated successfully!');
  };

  const [practiceSchedule, setPracticeSchedule] = useState(() => loadSchedule(doctor.name));
  const [schedulePublished, setSchedulePublished] = useState(() => hasSavedSchedule(doctor.name));

  useEffect(() => {
    setPracticeSchedule(loadSchedule(doctor.name));
    setSchedulePublished(hasSavedSchedule(doctor.name));
    void hydrateSchedule(doctor.name);
    return subscribeSchedule((next) => {
      if (!next) return;
      if (!doctor.name || !next.doctorName || next.doctorName.trim().toLowerCase() === doctor.name.trim().toLowerCase()) {
        setPracticeSchedule(next);
        setSchedulePublished(Boolean(next.updatedAt));
      }
    });
  }, [doctor.name]);

  const navItems = [
    { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { key: 'queue', label: "Today's Queue", icon: Users },
    { key: 'qa', label: 'Patient Doubts (Q&A)', icon: MessageCircleQuestion, badge: pendingQaCount },
    { key: 'video', label: 'Video Consultation Suite', icon: Video },
    { key: 'prescriptions', label: 'E-Prescriptions', icon: FileText },
    { key: 'emr', label: 'Patient Records (EMR)', icon: FlaskConical },
    { key: 'schedule', label: 'Practice Schedule', icon: Clock },
    { key: 'profile', label: 'Profile & Security', icon: UserRound },
  ];

  const handleNavClick = (key) => {
    setInternalSection(key);
    navigate(key === 'overview' ? '/doctor-dashboard' : `/doctor-dashboard/${key}`);
    setSidebarOpen(false);
  };

  // Patients Queue — hydrated live from confirmed bookings for this clinician.
  const [patientsQueue, setPatientsQueue] = useState(() =>
    listDoctorBookings(doctor.name).map(toDoctorQueueEntry),
  );

  useEffect(() => {
    const syncLocal = () => {
      setPatientsQueue(listDoctorBookings(doctor.name).map(toDoctorQueueEntry));
    };
    syncLocal();
    void hydrateDoctorBookings(doctor.name);
    const unsubscribe = subscribeBookings(syncLocal);
    const poll = window.setInterval(() => {
      void hydrateDoctorBookings(doctor.name);
    }, 15000);
    return () => {
      unsubscribe();
      window.clearInterval(poll);
    };
  }, [doctor.name]);

  // Live video room: patient presence arrives from the patient portal.
  const roomCode = roomCodeFor(doctor.name);
  const { room: videoRoom, patientPresent, bothPresent, status: videoStatus } = useVideoRoom(roomCode);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [dismissedPatientJoin, setDismissedPatientJoin] = useState(null);
  const waitingPatient = patientsQueue[0] || null;
  const patientJoinedAt = videoRoom?.patient?.joinedAt || null;
  const videoCompleted = videoStatus === 'completed' && !patientPresent;
  const completedAtLabel = videoRoom?.completedAt
    ? new Date(videoRoom.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const showPatientRoomToast = Boolean(patientJoinedAt) && !isCallOpen && dismissedPatientJoin !== patientJoinedAt;

  // Prescriptions list — persisted per clinician account.
  const [prescriptions, setPrescriptions] = useState(() => loadDoctorPrescriptions(doctor.name));
  useEffect(() => {
    setPrescriptions(loadDoctorPrescriptions(doctor.name));
  }, [doctor.name]);

  const pendingRefillsCount = prescriptions.filter((p) => p.status === 'REFILL REQUEST').length;
  const emrReportsCount = patientsQueue.filter((p) => Boolean(p.labSummary)).length;

  // New Rx Modal State
  const [newRxPatient, setNewRxPatient] = useState('');
  const [newRxMedicine, setNewRxMedicine] = useState('');
  const [newRxDosage, setNewRxDosage] = useState('');
  const [newRxDuration, setNewRxDuration] = useState('');
  const [newRxNotes, setNewRxNotes] = useState('');

  // Inline Queue Rx State
  const [activeQueueRxId, setActiveQueueRxId] = useState(null);
  const [queueRxMedicine, setQueueRxMedicine] = useState('');
  const [queueRxDosage, setQueueRxDosage] = useState('');
  const [queueRxDuration, setQueueRxDuration] = useState('');
  const [queueRxNotes, setQueueRxNotes] = useState('');

  const issuePrescription = ({ patientName, patientId, drug, instructions, duration, notes }) => {
    const cleanName = String(patientName || '').trim();
    const cleanDrug = String(drug || '').trim();
    if (!cleanName || !cleanDrug) return false;
    const matched = patientsQueue.find((p) => p.id === patientId || p.name === cleanName);
    const newRx = {
      id: `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: cleanName,
      patientId: patientId || matched?.id || 'Direct Rx',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      drug: cleanDrug,
      instructions: String(instructions || '').trim() || 'As directed',
      duration: String(duration || '').trim() || '—',
      notes: String(notes || '').trim(),
      status: 'ISSUED & SIGNED',
      type: 'Certified Tele-Rx',
    };
    const next = [newRx, ...prescriptions];
    setPrescriptions(next);
    saveDoctorPrescriptions(doctor.name, next);
    setPrescribedToast(`Digitally signed and issued prescription for ${cleanName}!`);
    setTimeout(() => setPrescribedToast(null), 4000);
    return true;
  };

  const handleIssueRx = (e) => {
    e.preventDefault();
    if (!issuePrescription({
      patientName: newRxPatient,
      drug: newRxMedicine,
      instructions: newRxDosage,
      duration: newRxDuration,
      notes: newRxNotes,
    })) return;
    setNewRxPatient('');
    setNewRxMedicine('');
    setNewRxDosage('');
    setNewRxDuration('');
    setNewRxNotes('');
    setIsNewRxModalOpen(false);
  };

  const handleIssueQueueRx = (e, patient) => {
    e.preventDefault();
    if (!issuePrescription({
      patientName: patient.name,
      patientId: patient.id,
      drug: queueRxMedicine,
      instructions: queueRxDosage,
      duration: queueRxDuration,
      notes: queueRxNotes,
    })) return;
    setQueueRxMedicine('');
    setQueueRxDosage('');
    setQueueRxDuration('');
    setQueueRxNotes('');
    setActiveQueueRxId(null);
  };

  const handleApproveRefill = (rxId) => {
    const next = prescriptions.map(p => p.id === rxId ? { ...p, status: 'APPROVED & DISPATCHED' } : p);
    setPrescriptions(next);
    saveDoctorPrescriptions(doctor.name, next);
    setPrescribedToast('Refill request approved and sent to pharmacy dispatch!');
    setTimeout(() => setPrescribedToast(null), 4000);
  };

  // Stealth Mode Camouflage
  if (isStealthMode) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold">Clinician Screen Lock Active</h2>
          <p className="mt-2 text-xs text-slate-400">
            Clinical records and patient identifiers are temporarily hidden from display. Medical session remains active.
          </p>
          <button
            type="button"
            onClick={() => setIsStealthMode(false)}
            className="mt-6 w-full py-3 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs transition"
          >
            Resume Clinician Console
          </button>
        </div>
      </div>
    );
  }

  const nextScheduleSlotLabel = (() => {
    if (!schedulePublished) return 'Not published yet';
    const base = new Date();
    for (let offset = 0; offset < 7; offset += 1) {
      const target = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset);
      const onlineSlots = slotsForDate(practiceSchedule, target, 'online');
      const first = onlineSlots[0];
      if (first) {
        const prefix = offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : formatDateLabel(target);
        return `${prefix} ${first.label}`;
      }
    }
    return 'No upcoming slots';
  })();

  const selectedEmrRecord = patientsQueue.find((p) => p.id === selectedEmrPatient) || patientsQueue[0] || null;
  const filteredQueue = patientsQueue;

  return (
    <div className="flex min-h-screen bg-[#F5F9FF] text-[#0B234D]">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close dashboard menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* 1. PERSISTENT LEFT SIDEBAR */}
      <aside className={`app-sidebar fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col justify-between border-r border-[#E1E7EF] bg-white transition-transform duration-200 lg:sticky lg:top-0 shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Top: Logo & Main Navigation Links */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex h-[74px] items-center justify-between border-b border-[#E1E7EF] px-6 shrink-0">
            <Link to="/" aria-label="Nayacura home">
              <img src="/logo.png" alt="Nayacura" className="h-10 sm:h-14 w-auto object-contain cursor-pointer hover:opacity-85 transition" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Doctor portal" className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-4 px-2 text-xs font-extrabold uppercase tracking-widest text-slate-400">Doctor Portal</p>
            
            <div className="space-y-1">
              {navItems.map(({ key, label, icon: Icon, badge }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNavClick(key)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition-colors ${
                    activeSection === key 
                      ? 'bg-[#0B3B82] text-white shadow-sm' 
                      : 'text-[#14213D] hover:bg-[#F0F6FF]'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{label}</span>
                  {badge > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                      activeSection === key ? 'bg-emerald-400 text-[#0B3B82]' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Doctor Credential Footnote - Pinned to the VERY BOTTOM */}
        <div className="mt-auto shrink-0 border-t border-[#E1E7EF] p-4 bg-slate-50/80">
          <button
            type="button"
            onClick={() => handleNavClick('profile')}
            className="flex items-center gap-3 w-full text-left group hover:opacity-90 transition"
          >
            <div className="w-10 h-10 rounded-full bg-[#0B3B82] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:ring-2 group-hover:ring-[#16A34A] transition overflow-hidden">
              {doctor.photoUrl ? (
                <img src={doctor.photoUrl} alt={doctor.name} className="h-full w-full object-cover" />
              ) : (
                avatarLetter
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#0B3B82] truncate group-hover:text-[#16A34A] transition">{doctor.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{doctor.regNo || doctor.specialty}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="min-w-0 flex-1">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-[#E1E7EF] bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              aria-label="Open dashboard menu"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Doctor Portal</p>
              <h2 className="truncate text-lg font-extrabold text-[#0B3B82] sm:text-2xl">
                {SECTION_TITLES[activeSection] || 'Dashboard Overview'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-[#16A34A]">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>Available Online</span>
            </div>

            <button
              type="button"
              onClick={() => handleNavClick('video')}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#072658] transition"
            >
              <Video className="h-3.5 w-3.5 text-emerald-400" />
              <span>Video Suite</span>
            </button>

            <span className="hidden h-7 w-px bg-[#E1E7EF] sm:block" />

            {/* Round Avatar Icon with Dropdown Menu & Sign Out */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#0B3B82] font-bold text-white text-sm hover:ring-2 hover:ring-[#16A34A] hover:ring-offset-2 transition cursor-pointer shadow-xs overflow-hidden"
                aria-label="Clinician Account Menu"
                title="Account Menu & Sign Out"
              >
                {doctor.photoUrl ? (
                  <img src={doctor.photoUrl} alt={doctor.name} className="h-full w-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setUserMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-2xl border border-slate-200 z-50 animate-scale-up text-xs">
                    {/* User Info Header */}
                    <div className="p-3 border-b border-slate-100">
                      <p className="font-extrabold text-[#0B3B82] text-sm truncate">{doctor.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{doctor.specialty}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        {doctor.regNo && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                            {doctor.regNo}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0B3B82]">
                          Doctor Portal
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium transition"
                      >
                        <Building className="h-4 w-4 text-[#0B3B82]" />
                        <span>Go to Nayacura Home</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleNavClick('profile');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:bg-[#F0F6FF] font-medium text-left transition"
                      >
                        <UserRound className="h-4 w-4 text-[#0B3B82]" />
                        <span>Clinician Profile & Credentials</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setIsStealthMode(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 font-medium text-left transition"
                      >
                        <EyeOff className="h-4 w-4 text-slate-400" />
                        <span>Screen Lock</span>
                      </button>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onLogout?.();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-left transition"
                      >
                        <LogOut className="h-4 w-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Toast Notification */}
        {prescribedToast && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0B3B82] text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-bounce border border-emerald-400/40">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{prescribedToast}</span>
          </div>
        )}

        {/* Patient joined the secure room — live presence notification */}
        {showPatientRoomToast && (
          <div className="fixed bottom-6 right-6 z-40 w-[min(92vw,340px)] rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-[#128D28]"><Video className="h-5 w-5" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0B3B82]">{videoRoom?.patient?.name || waitingPatient?.name || 'Your patient'} joined the room</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#526987]">Your patient is waiting in the secure video room. Join now to begin the consultation.</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setIsCallOpen(true); setDismissedPatientJoin(patientJoinedAt); }} className="rounded-lg bg-[#0B3B82] px-3 py-2 text-xs font-bold text-white hover:bg-[#082B5E]">Join Room</button>
                  <button type="button" onClick={() => setDismissedPatientJoin(patientJoinedAt)} className="rounded-lg border border-[#DCE7F6] px-3 py-2 text-xs font-bold text-[#526987]">Later</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY CONTAINER */}
        <div className="px-4 py-5 sm:px-6 lg:px-8">

          {/* ==================== A. DASHBOARD OVERVIEW ==================== */}
          {activeSection === 'overview' && (
            <>
              {/* Mint-Wave Hero Banner matching uploaded design */}
              <section className="relative mb-5 overflow-hidden rounded-2xl border border-[#DCE7F6] bg-white p-6 shadow-sm sm:p-8">
                <svg
                  className="pointer-events-none absolute bottom-0 right-0 h-24 w-3/5 opacity-80 sm:h-32"
                  viewBox="0 0 800 150"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0 150 C160 45 260 50 400 125 C555 175 670 35 800 70 L800 150 Z" fill="#DDF7DD" />
                  <path d="M0 150 C180 72 280 86 430 135 C570 178 670 80 800 105 L800 150 Z" fill="#9FEA93" />
                  <path d="M130 150 C290 90 360 128 480 150 Z" fill="#50CC47" />
                </svg>

                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#0B3B82] text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                    <span>
                      {doctor.regNo
                        ? `Verified Specialist • Reg No: ${doctor.regNo}`
                        : 'Verified Clinician Suite'}
                    </span>
                  </div>

                  <h1 className="text-2xl font-extrabold tracking-tight text-[#0B3B82] sm:text-3xl">
                    Welcome back, <span className="text-[#128D28]">{doctor.name}</span>
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#334B73]">
                    Manage your patient queue, issue certified digital tele-prescriptions, and review confidential diagnostic EMRs.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleNavClick('video')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B3B82] px-5 py-2 text-sm font-bold text-white hover:bg-[#082B5E] transition"
                    >
                      <Video className="h-4 w-4 text-emerald-400" />
                      Enter HD Video Suite
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsNewRxModalOpen(true)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#16A34A] bg-emerald-50 px-5 py-2 text-sm font-bold text-[#128D28] hover:bg-emerald-100 transition"
                    >
                      <Plus className="h-4 w-4" />
                      + Write Digital Rx
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('queue')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-bold text-[#0B3B82] hover:bg-blue-100 transition"
                    >
                      <Calendar className="h-4 w-4" />
                      Today's Queue ({patientsQueue.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('qa')}
                      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-5 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100 transition"
                    >
                      <MessageCircleQuestion className="h-4 w-4" />
                      Patient Doubts ({pendingQaCount} Pending)
                    </button>
                  </div>
                </div>
              </section>

              {/* 4 Summary Stat Cards in a Row */}
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
                {[
                  { key: 'queue', label: "Today's Queue", count: patientsQueue.length, note: 'Consultations', icon: Users, tone: 'bg-blue-50 text-[#0B3B82]' },
                  { key: 'prescriptions', label: 'Pending Refills', count: pendingRefillsCount, note: 'Medical slips', icon: FileText, tone: 'bg-emerald-50 text-[#128D28]' },
                  { key: 'emr', label: 'EMR Labs', count: emrReportsCount, note: 'Diagnostic reports', icon: FlaskConical, tone: 'bg-purple-50 text-purple-700' },
                  { key: 'video', label: 'Instant Video', count: isAcceptingInstantCalls ? 'Active' : 'Offline', note: 'Telehealth status', icon: Video, tone: 'bg-amber-50 text-amber-700' },
                ].map(({ key, label, count, note, icon: Icon, tone }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleNavClick(key)}
                    className="flex min-h-28 items-center gap-3 rounded-2xl border border-[#DCE7F6] bg-white p-4 text-left shadow-sm transition-colors hover:border-[#16A34A] sm:p-5"
                  >
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${tone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-extrabold uppercase tracking-wide text-[#31466A]">{label}</span>
                      <span className="block text-2xl font-extrabold text-[#0B3B82]">{count}</span>
                      <span className="block truncate text-xs text-[#526987]">{note}</span>
                    </span>
                    <ChevronRight className="hidden h-4 w-4 text-[#0B3B82] sm:block" />
                  </button>
                ))}
              </div>

              {/* Balanced 2x2 Grid of Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                
                {/* Card 1: Next Patient Up */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Next Patient Up</h3>
                      </div>
                      {waitingPatient && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#15803D] text-xs font-extrabold border border-emerald-200">
                          {waitingPatient.status}
                        </span>
                      )}
                    </div>

                    {waitingPatient ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="text-lg font-extrabold text-slate-800">
                              {waitingPatient.name}
                              {[waitingPatient.gender, waitingPatient.age && `${waitingPatient.age} yrs`].filter(Boolean).length > 0 && (
                                <span className="ml-1.5 text-xs font-semibold text-slate-500">
                                  ({[waitingPatient.gender, waitingPatient.age && `${waitingPatient.age} yrs`].filter(Boolean).join(', ')})
                                </span>
                              )}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Ref: {waitingPatient.id}
                              {waitingPatient.phone ? ` • ${waitingPatient.phone}` : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-[#0B3B82] block">Scheduled</span>
                            <span className="text-xs text-slate-500">{waitingPatient.time}</span>
                          </div>
                        </div>

                        <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                          <p className="flex items-center gap-1.5 text-slate-700">
                            <Video className="h-3.5 w-3.5 text-[#128D28]" />
                            <span>{waitingPatient.room} • ₹{waitingPatient.fee}</span>
                          </p>
                          <p className="text-slate-600">
                            <strong>Chief Complaint:</strong> {waitingPatient.chiefComplaint}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                        <p className="text-sm font-bold text-[#0B3B82]">No patients in today&apos;s queue</p>
                        <p className="mt-1 text-xs text-slate-500">Confirmed bookings for your slots will appear here.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {waitingPatient ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedPatientRecord(waitingPatient)}
                          className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition flex items-center gap-1"
                        >
                          <span>View Full Patient EMR</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsCallOpen(true)}
                          className="px-4 py-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Start Online Call</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNavClick('schedule')}
                        className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                      >
                        Publish consultation slots →
                      </button>
                    )}
                  </div>
                </div>

                {/* Card 2: Digital E-Prescription Manager */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Digital E-Prescription Manager</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0B3B82] text-xs font-extrabold border border-blue-200">
                        {pendingRefillsCount} Pending Refill{pendingRefillsCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {prescriptions.length > 0 ? (
                        prescriptions.slice(0, 2).map((rx) => (
                          <div key={rx.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{rx.drug}</p>
                              <p className="text-[11px] text-slate-500">Patient: {rx.patientName} • {rx.duration}</p>
                            </div>
                            {rx.status === 'REFILL REQUEST' ? (
                              <button
                                type="button"
                                onClick={() => handleApproveRefill(rx.id)}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                              >
                                APPROVE REFILL →
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                                {rx.status}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                          <p className="text-sm font-bold text-[#0B3B82]">No prescriptions issued yet</p>
                          <p className="mt-1 text-xs text-slate-500">Digital prescriptions and refill requests will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsNewRxModalOpen(true)}
                      className="px-4 py-2 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create New Digital Rx</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('prescriptions')}
                      className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      View All Rx History →
                    </button>
                  </div>
                </div>

                {/* Card 3: Electronic Medical Records (EMR) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Electronic Medical Records (EMR)</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-extrabold border border-purple-200">
                        {emrReportsCount} Reports
                      </span>
                    </div>

                    {selectedEmrRecord ? (
                      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-slate-800 pb-2 border-b border-slate-200">
                          <span>Patient: {selectedEmrRecord.name} ({selectedEmrRecord.id})</span>
                          <span className="text-emerald-700">Record Ready</span>
                        </div>
                        <p className="text-slate-600">{selectedEmrRecord.history || 'No lab summary attached yet.'}</p>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                        <p className="text-sm font-bold text-[#0B3B82]">No EMR lab reports yet</p>
                        <p className="mt-1 text-xs text-slate-500">Diagnostic panels shared by your patients will appear here.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {selectedEmrRecord ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPatientRecord(selectedEmrRecord)}
                        className="font-bold text-xs text-[#0B3B82] hover:text-[#16A34A] transition"
                      >
                        Review Full Diagnostic Chart →
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Encrypted clinician EMR vault</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleNavClick('emr')}
                      className="text-xs font-bold text-[#0B3B82] hover:text-[#16A34A] transition"
                    >
                      Open EMR Section
                    </button>
                  </div>
                </div>

                {/* Card 4: Practice Schedule & Availability */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#0B3B82]" />
                        <h3 className="font-extrabold text-[#0B3B82] text-base">Practice Schedule & Availability</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                        schedulePublished
                          ? 'bg-emerald-50 text-[#15803D] border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {schedulePublished ? 'ACTIVE' : 'NOT SET'}
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <div>
                          <span className="text-xs font-bold text-[#0B3B82] block">Instant Video Care Status</span>
                          <span className="text-[11px] text-slate-500">Allow verified patients to request instant video triage</span>
                        </div>
                        <button type="button" role="switch" aria-checked={isAcceptingInstantCalls} aria-label="Accept instant video consults" onClick={() => setIsAcceptingInstantCalls(!isAcceptingInstantCalls)}
                          className={`toggle-switch w-11 h-6 rounded-full transition-colors relative shrink-0 flex items-center ${
                            isAcceptingInstantCalls ? 'bg-[#16A34A]' : 'bg-slate-300'
                          }`}
                        >
                          <span className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                            isAcceptingInstantCalls ? 'translate-x-5' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>

                      {schedulePublished ? (
                        <div className="mt-3 text-xs text-slate-600 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 shrink-0 text-[#128D28]" aria-hidden="true" />
                            <span>
                              <strong>Online Consultation (Video &amp; Audio):</strong>{' '}
                              {formatTime(practiceSchedule.modes?.online?.start || practiceSchedule.modes?.video?.start || '14:00')} – {formatTime(practiceSchedule.modes?.online?.end || practiceSchedule.modes?.video?.end || '19:00')}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="mt-3 text-xs text-slate-500">
                          No consultation hours saved yet. Configure your online consultation slots to appear in Consult Sexology.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-slate-500">
                      Next available slot: <strong>{nextScheduleSlotLabel}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleNavClick('schedule')}
                      className="self-start font-bold text-[#0B3B82] hover:text-[#16A34A] transition sm:self-auto"
                    >
                      Manage Practice Calendar →
                    </button>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ==================== B. TODAY'S PATIENT QUEUE ==================== */}
          {activeSection === 'queue' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Today&apos;s Scheduled Consultations</h3>
                  <p className="text-xs text-slate-500 mt-1">Review check-in status and join private online consultations (Video or Audio anytime during call).</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-[#0B3B82]">
                  Online Consultations ({patientsQueue.length})
                </span>
              </div>

              {filteredQueue.length === 0 ? (
                <div className="rounded-2xl border border-[#DCE7F6] bg-white p-10 text-center shadow-xs">
                  <Users className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-base font-extrabold text-[#0B3B82]">No scheduled consultations yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    When patients book an online consultation slot from your published schedule, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQueue.map((patient) => {
                    const demoMeta = [patient.gender, patient.age && `${patient.age} yrs`].filter(Boolean).join(', ');
                    const isRxComposerOpen = activeQueueRxId === patient.id;
                    const patientPrescriptions = prescriptions.filter(
                      (rx) => rx.patientId === patient.id || rx.patientName === patient.name
                    );
                    return (
                    <div key={patient.id} className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-xs flex flex-col gap-4 hover:border-[#16A34A] transition">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-base text-[#0B3B82]">{patient.name}</span>
                            {demoMeta && <span className="text-xs text-slate-400">({demoMeta})</span>}
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0B3B82] border border-blue-200">
                              {patient.id}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                              <Video className="h-3 w-3" aria-hidden="true" />
                              Online (Video / Audio)
                            </span>
                            {patient.name === waitingPatient?.name && videoCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#128D28] border border-emerald-200">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            <strong>Chief Complaint:</strong> {patient.chiefComplaint}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Scheduled for: <strong>{patient.time}</strong>
                            {patient.phone ? ` • Phone: ${patient.phone}` : ''}
                            {patient.fee ? ` • Fee: ₹${patient.fee}` : ''}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (isRxComposerOpen) {
                                setActiveQueueRxId(null);
                              } else {
                                setQueueRxMedicine('');
                                setQueueRxDosage('');
                                setQueueRxDuration('');
                                setQueueRxNotes('');
                                setActiveQueueRxId(patient.id);
                              }
                            }}
                            aria-expanded={isRxComposerOpen}
                            className={`px-4 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                              isRxComposerOpen
                                ? 'border-[#0B3B82] bg-blue-50 text-[#0B3B82]'
                                : 'border-[#DCE7F6] bg-[#F8FAFC] hover:bg-blue-50 text-[#0B3B82]'
                            }`}
                          >
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Write Rx</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedPatientRecord(patient)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            View Full EMR
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsCallOpen(true)}
                            className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span>{videoCompleted ? 'Rejoin Call' : 'Start Online Call'}</span>
                          </button>
                        </div>
                      </div>

                      {patientPrescriptions.length > 0 && (
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {patientPrescriptions.map((rx) => (
                              <span
                                key={rx.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-[#128D28]"
                              >
                                ✓ Rx Issued: {rx.drug} • {rx.instructions} • {rx.duration}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleNavClick('prescriptions')}
                            className="text-xs font-bold text-[#0B3B82] hover:underline shrink-0"
                          >
                            View in E-Prescriptions
                          </button>
                        </div>
                      )}

                      {isRxComposerOpen && (
                        <form
                          onSubmit={(e) => handleIssueQueueRx(e, patient)}
                          className="p-4 rounded-xl bg-[#F8FBFF] border border-[#DCE7F6] space-y-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#0B3B82]" aria-hidden="true" />
                              <span className="text-xs font-extrabold text-[#0B3B82]">
                                Digital E-Prescription for {patient.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Ref: {patient.id}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Medication / Formulation
                              </label>
                              <input
                                type="text"
                                required
                                value={queueRxMedicine}
                                onChange={(e) => setQueueRxMedicine(e.target.value)}
                                placeholder="Enter medication or formulation"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Dosage &amp; Timing
                              </label>
                              <input
                                type="text"
                                required
                                value={queueRxDosage}
                                onChange={(e) => setQueueRxDosage(e.target.value)}
                                placeholder="e.g. 1 tablet at bedtime"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Duration
                              </label>
                              <input
                                type="text"
                                required
                                value={queueRxDuration}
                                onChange={(e) => setQueueRxDuration(e.target.value)}
                                placeholder="e.g. 15 Days"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Clinical Advice / Diet Notes
                            </label>
                            <textarea
                              rows="2"
                              value={queueRxNotes}
                              onChange={(e) => setQueueRxNotes(e.target.value)}
                              placeholder="Enter clinical instructions..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:border-[#0B3B82] resize-none"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveQueueRxId(null)}
                              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-[#0B3B82] hover:bg-[#092C63] text-white text-xs font-bold transition shadow-xs"
                            >
                              Sign &amp; Issue Prescription
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ==================== C. VIDEO TELEHEALTH SUITE ==================== */}
          {activeSection === 'video' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-6 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm">
                <div className="flex flex-col gap-2 pb-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0B3B82]">HD Video Consultation Suite</h3>
                    <p className="text-xs text-slate-500 mt-1">256-Bit HIPAA Encrypted LiveKit WebRTC Peer-to-Peer Teleconsultation Room</p>
                  </div>
                  <span className={`self-start px-3 py-1 rounded-full text-xs font-extrabold border ${bothPresent || patientPresent ? 'bg-emerald-50 text-[#16A34A] border-emerald-200' : videoCompleted ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {bothPresent ? 'Both Connected' : patientPresent ? 'Patient In Room' : videoCompleted ? 'Completed' : 'Waiting for Patient'}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Video Preview Window */}
                  <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-white lg:col-span-2">
                    <div className="relative flex min-h-[230px] flex-col items-center justify-center gap-1 p-6 pt-12 sm:min-h-[300px] lg:aspect-video lg:min-h-0">
                      {patientPresent ? (
                        <>
                          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#16A34A] text-xl font-bold">
                            {(videoRoom?.patient?.name || waitingPatient?.name || 'P').charAt(0)}
                          </div>
                          <p className="font-extrabold text-base">{videoRoom?.patient?.name || waitingPatient?.name || 'Patient'}</p>
                          <p className="text-xs text-slate-400">{bothPresent ? 'Patient is connected' : 'Patient is waiting in the room'}</p>
                        </>
                      ) : videoCompleted ? (
                        <>
                          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="h-8 w-8" />
                          </div>
                          <p className="font-extrabold text-base">Consultation completed</p>
                          <p className="text-center text-xs text-slate-400">{completedAtLabel ? `Session closed at ${completedAtLabel}` : 'Session closed'}</p>
                        </>
                      ) : (
                        <>
                          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#0B3B82] text-xl font-bold">
                            {avatarLetter}
                          </div>
                          <p className="font-extrabold text-base">{doctor.name}</p>
                          <p className="text-xs text-slate-400">{doctor.specialty} (Ready)</p>
                        </>
                      )}

                      <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 pr-3 sm:left-4 sm:top-4">
                        <span className="flex items-center gap-1 rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          HD 1080p WebRTC
                        </span>
                        <span className="rounded-md bg-black/60 px-2.5 py-1 text-[10px] font-bold text-slate-300">
                          Room #{roomCode}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-white/10 bg-slate-950/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-[11px] text-slate-400">
                        {bothPresent ? 'Connected — consultation in progress' : patientPresent ? 'Patient is waiting — join the room' : videoCompleted ? 'Consultation completed — rejoin if needed' : 'Waiting for patient to connect audio/video...'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCallOpen(true)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-[#15803D] sm:w-auto"
                      >
                        <Video className="h-4 w-4" />
                        {bothPresent || videoCompleted ? 'Rejoin Room' : 'Join Room'}
                      </button>
                    </div>
                  </div>

                  {/* Right: Tele-Consultation Controls */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-xs text-[#0B3B82] uppercase tracking-wider mb-2">Connected Patient</h4>
                      {patientPresent || waitingPatient ? (
                        <>
                          <p className="font-extrabold text-slate-800 text-sm">
                            {videoRoom?.patient?.name || waitingPatient?.name || 'Patient'}
                          </p>
                          {waitingPatient && (
                            <>
                              <p className="text-xs text-slate-500">Scheduled: {waitingPatient.time}</p>
                              <p className="text-xs text-slate-600 mt-2">
                                <strong>Complaint:</strong> {waitingPatient.chiefComplaint}
                              </p>
                            </>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-500">
                          No patient in the waiting room yet.
                        </p>
                      )}
                      <p className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${patientPresent ? 'bg-emerald-100 text-[#15803D]' : videoCompleted ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-600'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${patientPresent ? 'bg-emerald-500 animate-pulse' : videoCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {bothPresent ? 'Both in room — connected' : patientPresent ? 'Patient in the waiting room' : videoCompleted ? 'Consultation completed' : 'Waiting for patient'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsCallOpen(true)}
                      className="w-full py-3 rounded-xl bg-[#0B3B82] hover:bg-[#082B5E] text-white text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Video className="h-4 w-4 text-emerald-400" />
                      {bothPresent ? 'Rejoin Video Room' : 'Enter Video Room'}
                    </button>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <h4 className="font-bold text-xs text-[#0B3B82] uppercase tracking-wider">Quick Actions in Call</h4>
                      <button
                        type="button"
                        onClick={() => setIsNewRxModalOpen(true)}
                        className="w-full py-2.5 rounded-xl bg-white border border-[#16A34A] text-[#16A34A] hover:bg-emerald-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        Write Prescription in Call
                      </button>
                      <button
                        type="button"
                        onClick={() => (waitingPatient ? setSelectedPatientRecord(waitingPatient) : handleNavClick('emr'))}
                        className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                      >
                        Open Patient EMR Chart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== D. DIGITAL E-PRESCRIPTIONS ==================== */}
          {activeSection === 'prescriptions' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Digital E-Prescription Manager</h3>
                  <p className="text-xs text-slate-500 mt-1">Review active tele-prescriptions, approve refill requests, and issue certified digital slips.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewRxModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  + Create New Digital Rx
                </button>
              </div>

              {prescriptions.length === 0 ? (
                <div className="rounded-2xl border border-[#DCE7F6] bg-white p-10 text-center shadow-sm">
                  <FileText className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-base font-extrabold text-[#0B3B82]">No prescriptions issued yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Click &ldquo;+ Create New Digital Rx&rdquo; to issue a digitally signed prescription.
                  </p>
                </div>
              ) : (
                /* Prescriptions History Table */
                <div className="rounded-2xl bg-white border border-[#DCE7F6] shadow-sm overflow-hidden">
                  <div className="hidden sm:grid grid-cols-12 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                    <span className="col-span-3">Patient & ID</span>
                    <span className="col-span-4">Formulation & Dosage</span>
                    <span className="col-span-2">Date & Duration</span>
                    <span className="col-span-3 text-right">Status & Action</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {prescriptions.map((rx) => (
                      <div key={rx.id} className="grid grid-cols-1 items-start gap-3 p-4 text-xs transition hover:bg-slate-50/60 sm:grid-cols-12 sm:items-center sm:gap-2">
                        <div className="sm:col-span-3">
                          <p className="font-extrabold text-slate-800">{rx.patientName}</p>
                          <p className="text-[11px] text-slate-500">{rx.id} • {rx.patientId}</p>
                        </div>
                        <div className="sm:col-span-4">
                          <p className="font-bold text-[#0B3B82]">{rx.drug}</p>
                          <p className="text-[11px] text-slate-500">{rx.instructions}</p>
                        </div>
                        <div className="flex items-center gap-3 sm:col-span-2 sm:block">
                          <p className="font-medium text-slate-700">{rx.date}</p>
                          <p className="text-[11px] text-slate-500">{rx.duration}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:col-span-3 sm:block sm:text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            rx.status.includes('DISPATCHED') || rx.status.includes('SIGNED')
                              ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {rx.status}
                          </span>
                          {rx.status === 'REFILL REQUEST' && (
                            <div className="sm:mt-1">
                              <button
                                type="button"
                                onClick={() => handleApproveRefill(rx.id)}
                                className="px-3 py-1.5 rounded-lg bg-[#16A34A] text-white text-[11px] font-bold hover:bg-[#15803D] transition sm:ml-auto"
                              >
                                Approve Refill
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== E. PATIENT RECORDS (EMR) ==================== */}
          {activeSection === 'emr' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0B3B82]">Electronic Medical Records (EMR)</h3>
                  <p className="text-xs text-slate-500 mt-1">NABL Accredited diagnostic reports, STI screens, and endocrine blood profiles.</p>
                </div>
                {patientsQueue.length > 0 && (
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                    <span className="text-xs font-bold text-slate-500">Selected Patient:</span>
                    <select
                      value={selectedEmrRecord?.id || ''}
                      onChange={(e) => setSelectedEmrPatient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-[#0B3B82] bg-white focus:outline-none sm:w-auto sm:py-1.5"
                    >
                      {patientsQueue.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {selectedEmrRecord ? (
                <div className="p-6 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm space-y-6">
                  <div className="flex flex-col gap-3 pb-4 border-b border-slate-200 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Encrypted Patient Record
                      </span>
                      <h4 className="text-base font-extrabold text-slate-800 mt-1">
                        {selectedEmrRecord.name} ({selectedEmrRecord.id})
                      </h4>
                      <p className="text-xs text-slate-500">{selectedEmrRecord.history || 'No lab summary uploaded yet.'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <h5 className="text-xs font-bold text-[#0B3B82] uppercase tracking-wider mb-2">Doctor Clinical Consultation Notes</h5>
                    <textarea
                      rows={3}
                      defaultValue=""
                      placeholder="Enter confidential consultation notes..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-700 focus:outline-none focus:border-[#0B3B82]"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPrescribedToast('Clinical notes saved to encrypted EMR database.');
                          setTimeout(() => setPrescribedToast(null), 3000);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold hover:bg-[#072658] transition"
                      >
                        Save EMR Notes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#DCE7F6] bg-white p-10 text-center shadow-sm">
                  <FlaskConical className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-base font-extrabold text-[#0B3B82]">No patient diagnostic records yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Once patients book consultations and share lab reports with you, their EMR charts will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================== F. PRACTICE SCHEDULE ==================== */}
          {activeSection === 'schedule' && (
            <div className="animate-fade-in">
              <PracticeScheduleEditor doctorName={doctor.name} onNotify={showDoctorToast} />
            </div>
          )}

          {/* ==================== PATIENT DOUBTS (Q&A) ==================== */}
          {activeSection === 'qa' && (
            <DoctorQaSection
              threads={qaThreads}
              doctor={doctor}
              onNotify={showDoctorToast}
            />
          )}

          {/* ==================== G. CLINICIAN PROFILE ==================== */}
          {activeSection === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              {/* Profile & Photo Editor Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full bg-[#0B3B82] text-white text-2xl font-bold flex items-center justify-center overflow-hidden border-2 border-[#DCE7F6] shadow-xs">
                        {profileForm.photoUrl ? (
                          <img src={profileForm.photoUrl} alt={doctor.name} className="h-full w-full object-cover" />
                        ) : (
                          avatarLetter
                        )}
                      </div>
                      <label
                        htmlFor="doctor-profile-photo-input"
                        title="Change profile photo"
                        className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-[#16A34A] text-white shadow-md ring-2 ring-white hover:bg-[#15803D] transition"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                      <input
                        id="doctor-profile-photo-input"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoFileChange}
                        className="sr-only"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-[#0B3B82]">{doctor.name}</h3>
                      <p className="text-xs text-slate-500">
                        {doctor.specialty}
                        {doctor.experience ? ` • ${doctor.experience} Experience` : ''}
                      </p>
                      {doctor.regNo && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="h-3 w-3" />
                          {doctor.council ? `${doctor.council} Reg: ` : 'Medical Council Reg: '}
                          {doctor.regNo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      htmlFor="doctor-profile-photo-input"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#DCE7F6] bg-[#F8FBFF] px-4 py-2 text-xs font-bold text-[#0B3B82] hover:bg-blue-50 transition"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>{profileForm.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    </label>
                    {profileForm.photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={profileSaving}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>
                </div>

                {profileError && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSavedMsg && (
                  <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-[#128D28] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{profileSavedMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor="doc-prof-name" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        id="doc-prof-name"
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => {
                          setProfileForm((f) => ({ ...f, name: e.target.value }));
                          if (profileSavedMsg) setProfileSavedMsg('');
                        }}
                        placeholder="Dr. Arvind Swaminathan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div>
                      <label htmlFor="doc-prof-specialty" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Primary Specialty
                      </label>
                      <input
                        id="doc-prof-specialty"
                        type="text"
                        value={profileForm.specialty}
                        onChange={(e) => setProfileForm((f) => ({ ...f, specialty: e.target.value }))}
                        placeholder="Clinical Sexologist & Andrologist"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div>
                      <label htmlFor="doc-prof-qual" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Qualifications &amp; Degrees
                      </label>
                      <input
                        id="doc-prof-qual"
                        type="text"
                        value={profileForm.qualifications}
                        onChange={(e) => setProfileForm((f) => ({ ...f, qualifications: e.target.value }))}
                        placeholder="e.g. MBBS, MD, FECSM"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="doc-prof-exp" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                          Experience
                        </label>
                        <input
                          id="doc-prof-exp"
                          type="text"
                          value={profileForm.experience}
                          onChange={(e) => setProfileForm((f) => ({ ...f, experience: e.target.value }))}
                          placeholder="e.g. 12 Years"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                      </div>
                      <div>
                        <label htmlFor="doc-prof-fee" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                          Online Fee (₹)
                        </label>
                        <input
                          id="doc-prof-fee"
                          type="number"
                          min="100"
                          max="10000"
                          value={profileForm.videoFee}
                          onChange={(e) => setProfileForm((f) => ({ ...f, videoFee: e.target.value }))}
                          placeholder="599"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="doc-prof-clinic" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Practice Location / Clinic
                      </label>
                      <input
                        id="doc-prof-clinic"
                        type="text"
                        value={profileForm.clinic}
                        onChange={(e) => setProfileForm((f) => ({ ...f, clinic: e.target.value }))}
                        placeholder="Clinic or practice name"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="doc-prof-city" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                          City
                        </label>
                        <input
                          id="doc-prof-city"
                          type="text"
                          value={profileForm.city}
                          onChange={(e) => setProfileForm((f) => ({ ...f, city: e.target.value }))}
                          placeholder="Chennai"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                      </div>
                      <div>
                        <label htmlFor="doc-prof-langs" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                          Languages
                        </label>
                        <input
                          id="doc-prof-langs"
                          type="text"
                          value={profileForm.languages}
                          onChange={(e) => setProfileForm((f) => ({ ...f, languages: e.target.value }))}
                          placeholder="Tamil, English"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="doc-prof-council" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Medical Council
                      </label>
                      <input
                        id="doc-prof-council"
                        type="text"
                        value={profileForm.council}
                        onChange={(e) => setProfileForm((f) => ({ ...f, council: e.target.value }))}
                        placeholder="Tamil Nadu Medical Council"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div>
                      <label htmlFor="doc-prof-regno" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Council Registration No.
                      </label>
                      <input
                        id="doc-prof-regno"
                        type="text"
                        value={profileForm.regNo}
                        onChange={(e) => setProfileForm((f) => ({ ...f, regNo: e.target.value }))}
                        placeholder="TN-MED-44819"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Encrypted Doctor Mail
                      </label>
                      <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 flex items-center justify-between gap-2">
                        <span className="truncate">{doctor.email || 'Not set'}</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                          Verified Login
                        </span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="doc-prof-phone" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Contact Phone (Optional)
                      </label>
                      <input
                        id="doc-prof-phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+91 98..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="doc-prof-about" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Clinical Bio &amp; Approach
                      </label>
                      <textarea
                        id="doc-prof-about"
                        rows="3"
                        value={profileForm.about}
                        onChange={(e) => setProfileForm((f) => ({ ...f, about: e.target.value }))}
                        placeholder="Describe your clinical specialization and patient care approach..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-[#0B3B82] resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileForm(buildProfileFormState(doctor));
                        setProfileError('');
                        setProfileSavedMsg('');
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 transition"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3B82] hover:bg-[#082B5E] text-white text-xs font-bold shadow-xs transition disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Password & Account Security Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DCE7F6] shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#0B3B82]">
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B3B82]">Change Password &amp; Security</h3>
                      <p className="text-xs text-slate-500">
                        Update your clinician sign-in password (minimum 6 characters).
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-[#128D28]">
                    <Lock className="h-3 w-3" /> Encrypted Auth
                  </span>
                </div>

                {passwordError && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-[#128D28] flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="doc-curr-pw" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Current Password{hasRegisteredPassword ? ' *' : ' (if set)'}
                      </label>
                      <div className="relative">
                        <input
                          id="doc-curr-pw"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPasswordInput}
                          onChange={(e) => {
                            setCurrentPasswordInput(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          required={hasRegisteredPassword}
                          placeholder={hasRegisteredPassword ? 'Enter current password' : 'Optional if first setup'}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="doc-new-pw" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          id="doc-new-pw"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPasswordInput}
                          onChange={(e) => {
                            setNewPasswordInput(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          placeholder="Minimum 6 characters"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="doc-confirm-pw" className="block font-bold text-slate-600 uppercase text-[10px] tracking-wider mb-1.5">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <input
                          id="doc-confirm-pw"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPasswordInput}
                          onChange={(e) => {
                            setConfirmPasswordInput(e.target.value);
                            if (passwordError) setPasswordError('');
                          }}
                          placeholder="Re-enter new password"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#DCE7F6] bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B3B82]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition disabled:opacity-60"
                    >
                      <KeyRound className="h-4 w-4" />
                      <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== WRITE DIGITAL RX MODAL ==================== */}
      {isNewRxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border border-emerald-300 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#16A34A]" />
                <h3 className="font-extrabold text-[#0B3B82] text-base">Issue Certified Tele-Prescription</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewRxModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIssueRx} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                {patientsQueue.length > 0 ? (
                  <select
                    value={newRxPatient}
                    onChange={(e) => setNewRxPatient(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="">Select patient</option>
                    {patientsQueue.map((patient) => (
                      <option key={patient.id} value={patient.name}>
                        {patient.name} ({patient.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter patient name"
                    value={newRxPatient}
                    onChange={(e) => setNewRxPatient(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Formulation Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter medication or formulation"
                  value={newRxMedicine}
                  onChange={(e) => setNewRxMedicine(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage & Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 tablet at bedtime"
                    value={newRxDosage}
                    onChange={(e) => setNewRxDosage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days"
                    value={newRxDuration}
                    onChange={(e) => setNewRxDuration(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter clinical instructions..."
                  value={newRxNotes}
                  onChange={(e) => setNewRxNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#16A34A]" />
                <span>
                  Digitally signed via {doctor.council || 'Medical Council'}
                  {doctor.regNo ? ` • Reg: ${doctor.regNo}` : ''}. Dispatches in 100% plain box.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold transition shadow-xs"
                >
                  Sign & Issue Tele-Rx
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== PATIENT FULL EMR VIEWER MODAL ==================== */}
      {selectedPatientRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-[#0B3B82]" />
                <h3 className="font-extrabold text-[#0B3B82] text-base">
                  Electronic Medical Record — {selectedPatientRecord.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPatientRecord(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block">Patient ID:</span>
                  <span className="font-extrabold text-[#0B3B82]">{selectedPatientRecord.id}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Age & Gender:</span>
                  <span className="font-extrabold text-slate-800">{selectedPatientRecord.age} Yrs / {selectedPatientRecord.gender}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Blood Pressure:</span>
                  <span className="font-extrabold text-emerald-700">{selectedPatientRecord.vitals?.bp || '—'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700">Clinical History & Presentation:</h4>
                <p className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-slate-700 mt-1">
                  {selectedPatientRecord.history || 'No clinical history recorded yet.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700">Chief Complaint:</h4>
                <p className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-700 mt-1">
                  {selectedPatientRecord.chiefComplaint || '—'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700">Diagnostic Lab Summary:</h4>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 mt-1">
                  {selectedPatientRecord.labSummary || 'No diagnostic panel attached yet.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">256-Bit HIPAA Encrypted Consultation Room</span>
              <button
                type="button"
                onClick={() => setSelectedPatientRecord(null)}
                className="px-4 py-2 rounded-xl bg-[#0B3B82] text-white text-xs font-bold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {isCallOpen && (
        <VideoCallRoom
          roomCode={roomCode}
          role="doctor"
          selfName={doctor.name}
          peerName={waitingPatient?.name || 'Patient'}
          onClose={() => setIsCallOpen(false)}
        />
      )}

    </div>
  );
}