export const CITIES = [
  { id: 'chennai', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'bangalore', name: 'Bangalore', state: 'Karnataka' },
  { id: 'hyderabad', name: 'Hyderabad', state: 'Telangana' },
  { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'delhi', name: 'Delhi NCR', state: 'Delhi' },
  { id: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu' },
  { id: 'madurai', name: 'Madurai', state: 'Tamil Nadu' },
  { id: 'kochi', name: 'Kochi', state: 'Kerala' },
  { id: 'pune', name: 'Pune', state: 'Maharashtra' },
];

export const SPECIALTIES = [
  {
    id: 'sexologist',
    name: 'Clinical Sexologist',
    icon: 'Sparkles',
    desc: 'Erectile dysfunction, premature ejaculation, low stamina & intimacy',
    doctorCount: 180,
    color: 'from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-200'
  },
  {
    id: 'andrologist',
    name: 'Andrologist & Urologist',
    icon: 'ShieldCheck',
    desc: 'Male reproductive organs, testosterone therapy, varicocele & fertility',
    doctorCount: 140,
    color: 'from-emerald-500/10 to-teal-500/10',
    border: 'border-emerald-200'
  },
  {
    id: 'female-sexual-wellness',
    name: 'Women’s Sexual Health',
    icon: 'HeartHandshake',
    desc: 'Low libido, vaginismus, painful intercourse, PCOD & hormonal drive',
    doctorCount: 125,
    color: 'from-rose-500/10 to-pink-500/10',
    border: 'border-rose-200'
  },
  {
    id: 'sex-therapist',
    name: 'Psychologist & Sex Therapist',
    icon: 'UserCheck',
    desc: 'Performance anxiety, relationship conflict, guilt & intimacy therapy',
    doctorCount: 95,
    color: 'from-purple-500/10 to-violet-500/10',
    border: 'border-purple-200'
  },
  {
    id: 'venereologist',
    name: 'Venereologist / STI Specialist',
    icon: 'Activity',
    desc: 'Confidential STI/STD diagnosis, screening, genital rashes & treatment',
    doctorCount: 110,
    color: 'from-amber-500/10 to-orange-500/10',
    border: 'border-amber-200'
  },
  {
    id: 'pelvic-floor',
    name: 'Pelvic Floor Physiotherapist',
    icon: 'HeartPulse',
    desc: 'Non-invasive kegel rehabilitation, vaginismus & pelvic pain relief',
    doctorCount: 65,
    color: 'from-cyan-500/10 to-sky-500/10',
    border: 'border-cyan-200'
  }
];

export const SYMPTOMS_LIST = [
  { id: 'ed', name: 'Erectile Dysfunction (ED)', specialty: 'Clinical Sexologist', query: 'erection' },
  { id: 'pe', name: 'Premature Ejaculation (PE)', specialty: 'Clinical Sexologist', query: 'ejaculation' },
  { id: 'low-t', name: 'Low Testosterone & Fatigue', specialty: 'Andrologist & Urologist', query: 'testosterone' },
  { id: 'libido-w', name: 'Low Libido / No Desire (Women)', specialty: 'Women’s Sexual Health', query: 'female desire' },
  { id: 'pain-sex', name: 'Painful Intercourse / Vaginismus', specialty: 'Women’s Sexual Health', query: 'vaginismus' },
  { id: 'anxiety', name: 'Performance Anxiety & Stress', specialty: 'Psychologist & Sex Therapist', query: 'performance anxiety' },
  { id: 'sti-doubt', name: 'Unprotected Sex / STI Screening', specialty: 'Venereologist / STI Specialist', query: 'sti screening' },
  { id: 'delayed', name: 'Delayed Ejaculation / No Climax', specialty: 'Clinical Sexologist', query: 'climax difficulty' },
];

export const DOCTORS = [
  {
    id: 'dr-arvind-swaminathan',
    name: 'Dr. Arvind Swaminathan',
    degree: 'MBBS, MD - Medicine, FECSM (Fellow of European Committee of Sexual Medicine)',
    specialty: 'Clinical Sexologist',
    experience: 16,
    rating: 99,
    reviewsCount: 620,
    city: 'Chennai',
    area: 'Nungambakkam',
    clinicName: 'Nayacura Men & Women Intimate Health Clinic',
    clinicAddress: '34, Sterling Road, Nungambakkam, Chennai',
    fee: 800,
    videoFee: 599,
    photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    languages: ['Tamil', 'English'],
    about: 'Dr. Arvind Swaminathan is an internationally accredited European Board-certified Sexual Medicine expert. He has helped over 12,000+ individuals overcome erectile dysfunction, premature ejaculation, and intimacy roadblocks with 100% judgment-free clinical guidance.',
    services: ['Erectile Dysfunction Therapy', 'Premature Ejaculation Protocol', 'Penile Shockwave Therapy (ED1000)', 'Testosterone Optimization', 'Couple Sexual Wellness Consultation'],
    availableToday: true,
    slots: {
      today: ['11:30 AM', '12:15 PM', '04:30 PM', '06:00 PM', '07:30 PM'],
      tomorrow: ['10:00 AM', '11:00 AM', '02:00 PM', '05:00 PM', '06:30 PM'],
    }
  },
  {
    id: 'dr-meera-nambiar',
    name: 'Dr. Meera Nambiar',
    degree: 'MBBS, MS - Obstetrics & Gynaecology, Fellowship in Sexual & Reproductive Health',
    specialty: 'Women’s Sexual Health',
    experience: 14,
    rating: 98,
    reviewsCount: 540,
    city: 'Chennai',
    area: 'Adyar',
    clinicName: 'Cura Intimate Wellness Center for Women',
    clinicAddress: '55, LB Road, Near Adyar Signal, Chennai',
    fee: 750,
    videoFee: 550,
    photo: 'https://images.unsplash.com/photo-1594824813579-43c3d52033c4?auto=format&fit=crop&q=80&w=400',
    languages: ['Tamil', 'English', 'Malayalam'],
    about: 'Dr. Meera Nambiar provides compassionate, stigma-free sexual healthcare for women. Expert in treating vaginismus (involuntary pelvic tightening), dyspareunia (painful sex), post-pregnancy loss of intimacy, and hormonal sexual dysfunction.',
    services: ['Vaginismus Therapy & Dilator Guidance', 'Female Hypoactive Sexual Desire Treatment', 'Post-Partum Intimacy Rehabilitation', 'PCOS & Hormonal Libido Optimization'],
    availableToday: true,
    slots: {
      today: ['12:00 PM', '01:00 PM', '05:30 PM', '06:45 PM'],
      tomorrow: ['09:30 AM', '11:00 AM', '03:30 PM', '05:00 PM'],
    }
  },
  {
    id: 'dr-harish-venkatesh',
    name: 'Dr. Harish Venkatesh',
    degree: 'MBBS, MS - General Surgery, MCh - Urology, Fellowship in Andrology',
    specialty: 'Andrologist & Urologist',
    experience: 19,
    rating: 99,
    reviewsCount: 710,
    city: 'Bangalore',
    area: 'Indiranagar',
    clinicName: 'Alpha Men Intimacy & Andrology Institute',
    clinicAddress: '100 Feet Road, Indiranagar, Bangalore',
    fee: 900,
    videoFee: 699,
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    languages: ['English', 'Kannada', 'Hindi', 'Tamil'],
    about: 'Senior Andrologist with 19+ years of surgical and clinical mastery in male sexual wellness, penile vascular doppler evaluation, minimally invasive laser phimosis surgery (ZSR stapler), and varicocele care.',
    services: ['Penile Doppler Ultrasound', 'ZSR Laser Circumcision (Painless)', 'Varicocele Treatment', 'Hypogonadism / Low Testosterone', 'Peyronie’s Disease Correction'],
    availableToday: true,
    slots: {
      today: ['03:00 PM', '04:15 PM', '05:45 PM', '07:00 PM'],
      tomorrow: ['10:30 AM', '11:45 AM', '04:00 PM', '06:30 PM'],
    }
  },
  {
    id: 'dr-shalini-mukherjee',
    name: 'Dr. Shalini Mukherjee',
    degree: 'MA (Clinical Psychology), M.Phil, PhD, Certified Couple & Sex Therapist',
    specialty: 'Psychologist & Sex Therapist',
    experience: 12,
    rating: 97,
    reviewsCount: 420,
    city: 'Chennai',
    area: 'Anna Nagar',
    clinicName: 'Mind & Intimacy Psychotherapy Clinic',
    clinicAddress: '18, 4th Avenue, Anna Nagar East, Chennai',
    fee: 1000,
    videoFee: 750,
    photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400',
    languages: ['Tamil', 'English', 'Hindi'],
    about: 'Specializes in psychological causes of sexual dysfunction including performance anxiety, pornography-induced erectile dysfunction (PIED), couple intimacy blocks, guilt, and body image hesitation.',
    services: ['Sensate Focus Therapy', 'Pornography Dependence Counseling', 'Couple Intimacy Reconstruction', 'Anxiety Desensitization Protocol'],
    availableToday: false,
    slots: {
      today: [],
      tomorrow: ['10:00 AM', '11:30 AM', '03:00 PM', '05:30 PM', '07:00 PM'],
    }
  },
  {
    id: 'dr-deepika-ramaswamy',
    name: 'Dr. Deepika Ramaswamy',
    degree: 'MBBS, MD - Dermatology, Venereology & Leprosy (Gold Medalist)',
    specialty: 'Venereologist / STI Specialist',
    experience: 13,
    rating: 98,
    reviewsCount: 380,
    city: 'Chennai',
    area: 'T. Nagar',
    clinicName: 'Derm & Venereology Care',
    clinicAddress: '11, Bazullah Road, T. Nagar, Chennai',
    fee: 700,
    videoFee: 500,
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    languages: ['Tamil', 'English'],
    about: 'Expert in diagnosis and confidential management of sexually transmitted infections (STIs/STDs), genital herpes, HPV warts, balanitis, and intimate hygiene dermatoses with total privacy.',
    services: ['Confidential STI/STD Screening & Treatment', 'Genital Wart Laser Removal', 'Balanitis & Yeast Infection Care', 'PrEP & Post-Exposure Prophylaxis Counseling'],
    availableToday: true,
    slots: {
      today: ['02:00 PM', '03:30 PM', '05:00 PM', '06:30 PM'],
      tomorrow: ['11:00 AM', '12:30 PM', '04:00 PM', '06:00 PM'],
    }
  }
];

export const LAB_PACKAGES = [
  {
    id: 'testosterone-vitality',
    title: 'Complete Male Testosterone & Vitality Panel',
    parameters: 14,
    sampleType: 'Blood Sample (Home Collection in Sealed Kit)',
    fastingRequired: 'Morning fasting sample recommended before 10 AM',
    price: 1299,
    originalPrice: 2800,
    discount: '54% OFF',
    popular: true,
    badge: 'Men’s Vitality',
    testsIncluded: [
      'Total Testosterone (Serum)',
      'Free Testosterone (Bioavailable)',
      'SHBG (Sex Hormone Binding Globulin)',
      'Prolactin (Sexual desire & refractory period marker)',
      'LH & FSH (Pituitary gonadotropins)',
      'Estradiol (Estrogen balance in men)',
      'Cortisol (Stress & libido suppressor)',
      'Vitamin D3 & Zinc Levels'
    ]
  },
  {
    id: 'confidential-sti-screen',
    title: '100% Confidential Comprehensive STI / STD Screen',
    parameters: 8,
    sampleType: 'Blood & Urine (Tamper-Proof Anonymous Barcode)',
    fastingRequired: 'No fasting required. 100% Private & Anonymous',
    price: 1999,
    originalPrice: 4500,
    discount: '56% OFF',
    popular: true,
    badge: '100% Discreet',
    testsIncluded: [
      'HIV 1 & 2 4th Gen Antigen/Antibody (p24)',
      'Hepatitis B Surface Antigen (HBsAg)',
      'Hepatitis C Virus Total Antibody (HCV)',
      'Syphilis Screening (VDRL / RPR & TPHA)',
      'Chlamydia Trachomatis (Urine PCR)',
      'Neisseria Gonorrhoeae (Urine PCR)',
      'Herpes Simplex Virus (HSV 1 & 2 IgG/IgM)'
    ]
  },
  {
    id: 'female-hormone-libido',
    title: 'Women’s Intimate Hormonal & Libido Profile',
    parameters: 16,
    sampleType: 'Blood Sample',
    fastingRequired: '10 hours fasting. Ideal between Day 2-5 of cycle',
    price: 1599,
    originalPrice: 3600,
    discount: '55% OFF',
    popular: false,
    badge: 'Women Special',
    testsIncluded: [
      'Estradiol (E2 - Estrogen & lubrication marker)',
      'Progesterone & Free Testosterone for women',
      'DHEA-S (Adrenal vitality & libido)',
      'Prolactin & TSH (Thyroid & desire suppression)',
      'AMH (Ovarian Reserve Indicator)',
      'Hemoglobin & Iron Profile for stamina'
    ]
  },
  {
    id: 'male-fertility-semen',
    title: 'Comprehensive Male Fertility & Semen Analysis',
    parameters: 18,
    sampleType: 'Semen Sample (Home Collection Kit or Private Room)',
    fastingRequired: '3 to 5 days of sexual abstinence required',
    price: 999,
    originalPrice: 2200,
    discount: '55% OFF',
    popular: false,
    badge: 'Fertility Special',
    testsIncluded: [
      'Total Sperm Count & Concentration (Million/ml)',
      'Progressive & Rapid Motility Percentage',
      'Strict Kruger Sperm Morphology Analysis',
      'Sperm Vitality & Viability Assay',
      'Fructose Content & Seminal Fluid pH',
      'Pus Cells / Leucocytes & Agglutination check'
    ]
  }
];

export const SURGERIES = [
  {
    id: 'zsr-circumcision',
    name: 'Painless ZSR Laser Circumcision',
    tagline: 'Minimally invasive stapler technique for Phimosis, Balanitis & Tight Foreskin',
    timeTaken: '15 mins procedure',
    stayDuration: 'Walk home in 30 minutes',
    startingPrice: '₹24,000',
    icon: 'ShieldCheck',
    coverCashless: true,
    benefits: ['Zero stitches, Zero blood loss', 'Silicon ring falls off naturally in 7-10 days', 'US FDA Approved medical stapler', 'Resume non-strenuous work next day']
  },
  {
    id: 'ed-shockwave',
    name: 'Low-Intensity Shockwave Therapy (EDSWT)',
    tagline: 'Non-invasive acoustic wave therapy that stimulates new penile blood vessels',
    timeTaken: '20 mins / session',
    stayDuration: 'Outpatient Clinic Procedure',
    startingPrice: '₹4,500 / session',
    icon: 'Zap',
    coverCashless: false,
    benefits: ['100% Drug-Free & Surgery-Free', 'Enhances spontaneous natural erections', 'Clinically proven neo-vascularization', 'Zero downtime or pain']
  },
  {
    id: 'vaginismus-therapy',
    name: 'Vaginismus Botox & Pelvic Neuromodulation',
    tagline: 'Targeted relaxation for involuntary pelvic floor muscle spasms enabling painless intimacy',
    timeTaken: '25 mins procedure',
    stayDuration: 'Day Care Procedure',
    startingPrice: '₹28,000',
    icon: 'HeartHandshake',
    coverCashless: true,
    benefits: ['Relaxes hyperactive bulbocavernosus muscles', 'Over 92% success rate in overcoming vaginismus', 'Paired with gentle dilator protocol', 'Done under mild sedation with zero discomfort']
  },
  {
    id: 'varicocele-micro',
    name: 'Microscopic Subinguinal Varicocelectomy',
    tagline: 'Gold standard microsurgery for dilated testicular veins affecting testosterone and sperm',
    timeTaken: '45 mins procedure',
    stayDuration: 'Same Day Discharge',
    startingPrice: '₹38,000',
    icon: 'Activity',
    coverCashless: true,
    benefits: ['Operating microscope for 0.5% recurrence rate', 'Improves natural testosterone levels', 'Relieves scrotal heaviness and pain', 'Cashless insurance covered']
  }
];

export const TREATMENTS_STORE = [
  {
    id: 'treat-1',
    name: 'Doctor-Prescribed ED Solution (Tadalafil 10mg / 20mg)',
    category: 'Erection Hardness',
    price: 399,
    originalPrice: 650,
    discount: '38% OFF',
    packageInfo: 'Requires Free Doctor Consultation • 10 Tablets',
    discreetPack: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
    desc: 'PDE-5 inhibitor that increases blood flow to the penile chambers for firm, sustained erections lasting up to 36 hours.'
  },
  {
    id: 'treat-2',
    name: 'Nayacura Pro-Delay Lidocaine Spray (Prolonged Climax)',
    category: 'Stamina & Lasting Time',
    price: 499,
    originalPrice: 899,
    discount: '44% OFF',
    packageInfo: 'Metered Dose Spray • 100+ Sprays',
    discreetPack: true,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400',
    desc: 'Clinically calibrated desensitizing spray that delays ejaculation by 15-25 minutes without transferring numbness to your partner.'
  },
  {
    id: 'treat-3',
    name: 'Pure Himalayan Shilajit Resin (Gold Grade with Fulvic Acid >75%)',
    category: 'Natural Testosterone & Stamina',
    price: 799,
    originalPrice: 1499,
    discount: '46% OFF',
    packageInfo: '20g Pure Resin with Brass Spoon',
    discreetPack: true,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
    desc: 'Purified high-altitude Himalayan shilajit rich in 84+ minerals that boosts natural free testosterone, energy, and endurance.'
  },
  {
    id: 'treat-4',
    name: 'Intimate Arousal & Hydrating Silk Gel for Women (pH 4.5)',
    category: 'Women Intimacy & Lubrication',
    price: 449,
    originalPrice: 799,
    discount: '43% OFF',
    packageInfo: '100ml Pump Bottle • 100% Water Based',
    discreetPack: true,
    image: 'https://images.unsplash.com/photo-1556228722-d0b5de741b4b?auto=format&fit=crop&q=80&w=400',
    desc: 'Natural aloe vera & hyaluronic acid formula that eliminates friction, moisturizes delicate tissues, and heightens pleasure.'
  },
  {
    id: 'treat-5',
    name: 'Ashwagandha KSM-66 & Safed Musli Vitality Capsules',
    category: 'Stress & Performance Boost',
    price: 549,
    originalPrice: 999,
    discount: '45% OFF',
    packageInfo: '60 Veg Capsules • 100% Ayurvedic',
    discreetPack: true,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400',
    desc: 'Full-spectrum standardized root extract that reduces cortisol by 28% and enhances vigor and desire in both men and women.'
  },
  {
    id: 'treat-6',
    name: 'Gentle Intimate Hygiene Foam for Men with Tea Tree & Aloe',
    category: 'Intimate Hygiene & Odor Control',
    price: 299,
    originalPrice: 499,
    discount: '40% OFF',
    packageInfo: '120ml Foaming Wash • Soap-free pH 5.5',
    discreetPack: true,
    image: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&q=80&w=400',
    desc: 'Sulfate-free formulation that prevents bacterial and fungal buildup, balanitis irritation, and unpleasant intimate odor.'
  }
];

export const HEALTH_ARTICLES = [
  {
    id: 'art-1',
    title: 'Why Erectile Dysfunction is a Vascular Issue, Not a Personal Failure',
    author: 'Dr. Arvind Swaminathan',
    specialty: 'Senior Clinical Sexologist',
    readTime: '4 min read',
    category: 'Men’s Sexual Health',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=400',
    summary: 'Penile arteries are 1-2mm wide. Learn why modern stress, sitting posture, diabetes, and smoking impact blood flow first, and how science restores firm erections.'
  },
  {
    id: 'art-2',
    title: 'The Truth About Vaginismus: Overcoming Involuntary Tightness and Painful Sex',
    author: 'Dr. Meera Nambiar',
    specialty: 'Women’s Sexual Health Specialist',
    readTime: '5 min read',
    category: 'Women’s Sexual Wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
    summary: 'Millions of women experience painful penetration in silence due to subconscious muscle spasms. Evidence-based desensitization and therapy cure vaginismus in weeks.'
  },
  {
    id: 'art-3',
    title: 'Performance Anxiety vs Biological ED: How to Tell What is Happening',
    author: 'Dr. Shalini Mukherjee',
    specialty: 'Certified Sex Therapist',
    readTime: '5 min read',
    category: 'Intimacy Psychology',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400',
    summary: 'Worrying about performance releases adrenaline, which constricts blood vessels. Discover simple cognitive techniques and sensate focus exercises to stay present.'
  }
];

export const TESTIMONIALS = [
  {
    id: 'rev-1',
    name: 'Karthik S. (Name changed for privacy)',
    location: 'Chennai',
    service: 'Online Sexology Consultation',
    comment: 'I was hesitant to speak about my premature ejaculation for nearly 3 years. Connecting with Dr. Arvind online was the best decision. He explained the physiology without any awkwardness or judgment. The treatment worked within 3 weeks!',
    rating: 5,
    verified: true
  },
  {
    id: 'rev-2',
    name: 'Pooja & Arun (Couple Consultation)',
    location: 'Bangalore',
    service: 'Vaginismus & Intimacy Therapy',
    comment: 'We struggled with unconsummated marriage for 18 months due to severe pain. Dr. Meera Nambiar guided us with dilators and pelvic relaxation exercises. Today our relationship is completely transformed. Forever grateful to Nayacura!',
    rating: 5,
    verified: true
  },
  {
    id: 'rev-3',
    name: 'Vikram M. (Name changed for privacy)',
    location: 'Coimbatore',
    service: 'Discreet At-Home Testosterone Test',
    comment: 'The home sample pickup was completely anonymous in a brown plain box without any brand labels. Found my free testosterone was significantly low. With Dr. Harish’s protocol, my energy and libido are back to normal.',
    rating: 5,
    verified: true
  }
];
