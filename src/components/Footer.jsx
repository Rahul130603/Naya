import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Heart, 
  MapPin, 
  PhoneCall, 
  Mail, 
  Stethoscope,
  Globe,
  Share2,
  Lock,
  Package
} from 'lucide-react';

export default function Footer({ onOpenDoctorOnboarding }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 sm:pt-16 pb-24 sm:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Directory Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800 text-xs">
          
          {/* Col 1: Nayacura */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Nayacura</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="hover:text-emerald-400 transition">About Our Mission</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">Careers <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">Hiring</span></Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition">Press & Research</Link></li>
              <li><Link to="/health-feed" className="hover:text-emerald-400 transition">Sexual Health Feed</Link></li>
              <li><Link to="/ask-doctor" className="hover:text-emerald-400 transition">Ask a Doctor (Q&amp;A)</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition">Confidential Contact</Link></li>
              <li>
                <a href="mailto:support@nayacura.com" className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  <Mail className="w-3.5 h-3.5" /> support@nayacura.com
                </a>
              </li>
              <li><Link to="/privacy-standards" className="hover:text-emerald-400 transition">256-Bit Data Privacy</Link></li>
            </ul>
          </div>

          {/* Col 2: Sexual Wellness */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Sexual Wellness</h4>
            <ul className="space-y-2.5">
              <li><Link to="/condition/erectile-dysfunction" className="hover:text-emerald-400 transition">Erectile Dysfunction Care</Link></li>
              <li><Link to="/condition/premature-ejaculation" className="hover:text-emerald-400 transition">Premature Ejaculation Care</Link></li>
              <li><Link to="/video-consult" className="hover:text-emerald-400 transition">Instant Video/Audio Consult</Link></li>
              <li><Link to="/condition/testosterone" className="hover:text-emerald-400 transition">At-Home Testosterone Test</Link></li>
              <li><Link to="/condition/sti-screening" className="hover:text-emerald-400 transition">Confidential 7-Panel STI Test</Link></li>
              <li><Link to="/condition/zsr-circumcision" className="hover:text-emerald-400 transition">Painless ZSR Circumcision</Link></li>
              <li><Link to="/wellness-store" className="hover:text-emerald-400 transition">Discreet Wellness Store</Link></li>
            </ul>
          </div>

          {/* Col 3: Women's Intimacy */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Women's Intimacy</h4>
            <ul className="space-y-2.5">
              <li><Link to="/condition/vaginismus" className="hover:text-emerald-400 transition">Vaginismus Rehabilitation</Link></li>
              <li><Link to="/condition/low-libido" className="hover:text-emerald-400 transition">Low Libido & Desire</Link></li>
              <li><Link to="/condition/dyspareunia" className="hover:text-emerald-400 transition">Dyspareunia (Painful Sex)</Link></li>
              <li><Link to="/condition/pcos-intimacy" className="hover:text-emerald-400 transition">PCOS & Hormonal Balance</Link></li>
              <li><Link to="/wellness-store" className="hover:text-emerald-400 transition">pH-Balanced Intimate Gels</Link></li>
            </ul>
          </div>

          {/* Col 4: For Sexologists */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">For Sexologists</h4>
            <ul className="space-y-2.5">
              <li><Link to="/for-sexologists" className="text-emerald-400 hover:text-emerald-300 transition font-bold">Join Sexologist Network</Link></li>
              <li><Link to="/for-sexologists" className="hover:text-emerald-400 transition">Encrypted EMR System</Link></li>
              <li><Link to="/for-sexologists" className="hover:text-emerald-400 transition">Private Teleconsult Suite</Link></li>
              <li><Link to="/for-sexologists" className="hover:text-emerald-400 transition">Nayacura Pro Mobile App</Link></li>
              <li><Link to="/for-sexologists" className="hover:text-emerald-400 transition">Clinical Research Board</Link></li>
            </ul>
          </div>

          {/* Col 5: Privacy Standards */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Privacy Standards</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/privacy-standards" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  <Package className="w-3.5 h-3.5" /> 100% Plain Box Delivery
                </Link>
              </li>
              <li>
                <Link to="/privacy-standards" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  <Lock className="w-3.5 h-3.5" /> Anonymous Barcodes
                </Link>
              </li>
              <li>
                <Link to="/privacy-standards" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero Patient Stigma
                </Link>
              </li>
              <li><Link to="/privacy-standards" className="hover:text-emerald-400 transition">HIPAA & ISO 27001</Link></li>
              <li><Link to="/privacy-standards" className="hover:text-emerald-400 transition">Terms & Medical Ethics</Link></li>
            </ul>
          </div>

        </div>

        {/* Brand Bar & Security Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link to="/" aria-label="Nayacura home" className="inline-flex shrink-0 items-center rounded-xl bg-white px-3 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">
              <img src="/logo.png" alt="Nayacura" className="h-8 w-auto object-contain sm:h-9" />
            </Link>
            <p className="text-xs text-slate-400 max-w-md">
              Copyright © 2026, Nayacura Health Technologies Ltd. India's trusted, 100% confidential sexual health & intimate wellness ecosystem.
            </p>
          </div>

          {/* Security Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <a href="mailto:support@nayacura.com" className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-400 text-slate-200 transition">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Support: support@nayacura.com</span>
            </a>
            <Link to="/privacy-standards" className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-400 transition">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>100% Anonymous Consultations</span>
            </Link>
            <Link to="/privacy-standards" className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-emerald-400 transition">
              <Package className="w-4 h-4 text-emerald-400" />
              <span>Discreet Plain Packaging</span>
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}
