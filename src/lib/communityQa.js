export const QA_STORAGE_KEY = 'nayacura_qa_threads_v1';
export const QA_LIKED_KEY = 'nayacura_qa_liked_v1';
export const QA_EVENT = 'nayacura:community-qa';

export const QA_CATEGORIES = [
  'Erectile & Stamina',
  'Women’s Sexual Health',
  'STI & Testing',
  'Hormones & Fertility',
  'Performance Anxiety',
  'Relationships & Intimacy',
  'General Sexual Health',
];

const hasWindow = () => typeof window !== 'undefined';

const SEED_THREADS = [
  {
    id: 'QA-1042',
    title: 'Is occasional erection loss during stress normal at age 29?',
    question:
      'For the past two months I have been under heavy work stress and noticed that twice I could not maintain an erection with my partner. Morning erections still happen normally. Should I worry about a permanent issue or get tested?',
    category: 'Erectile & Stamina',
    patientAlias: 'Anonymous • 25–34 yrs',
    ageGroup: '25–34',
    gender: 'Male',
    isAnonymous: true,
    helpfulCount: 14,
    createdAt: '2026-11-23T10:15:00.000Z',
    answers: [
      {
        id: 'ANS-901',
        doctorName: 'Dr. Arvind Swaminathan',
        doctorSpecialty: 'Clinical Sexologist & Andrologist',
        doctorRegNo: 'TN-MED-44819',
        doctorCity: 'Chennai',
        body: 'Normal morning erections are a reassuring sign that your blood vessels and nerve pathways are working properly. Occasional erection drops during high stress or fatigue are very common and usually linked to adrenaline and performance anxiety rather than permanent erectile dysfunction. Prioritise sleep, reduce alcohol before intimacy, and avoid self-testing pressure. If it continues for more than 4–6 weeks, a confidential consult and basic hormone/sugar check can give complete clarity.',
        recommendation: 'Stress & Anxiety Guidance',
        createdAt: '2026-11-23T14:40:00.000Z',
      },
    ],
  },
  {
    id: 'QA-1041',
    title: 'Sharp pain at entry during intercourse — could this be vaginismus?',
    question:
      'Every time my partner and I try penetrative sex, the muscles tighten involuntarily and it feels like hitting a wall with burning pain. Even inserting a tampon feels uncomfortable. What specialist should we consult?',
    category: 'Women’s Sexual Health',
    patientAlias: 'Anonymous • 25–34 yrs',
    ageGroup: '25–34',
    gender: 'Female',
    isAnonymous: true,
    helpfulCount: 19,
    createdAt: '2026-11-22T16:20:00.000Z',
    answers: [
      {
        id: 'ANS-900',
        doctorName: 'Dr. Meera Subramanian',
        doctorSpecialty: 'Women’s Sexual Health & Pelvic Care',
        doctorRegNo: 'TN-MED-51904',
        doctorCity: 'Chennai',
        body: 'What you are describing — involuntary pelvic floor tightening and pain at entry — is very consistent with vaginismus or pelvic floor hypertonicity, and it is completely treatable. Please do not force painful penetration, as that reinforces the reflex. A Women’s Sexual Health specialist paired with guided pelvic floor relaxation and graduated desensitization therapy resolves this comfortably for most patients.',
        recommendation: 'Video Consultation Recommended',
        createdAt: '2026-11-22T19:05:00.000Z',
      },
    ],
  },
  {
    id: 'QA-1044',
    title: 'How many days after unprotected exposure should I take an STI test?',
    question:
      'I had unprotected intercourse 5 days ago and feel anxious even though I have no symptoms right now. If I order the 7-panel PCR STI test today, will the results be accurate or should I wait?',
    category: 'STI & Testing',
    patientAlias: 'Anonymous • 18–24 yrs',
    ageGroup: '18–24',
    gender: 'Prefer not to say',
    isAnonymous: true,
    helpfulCount: 6,
    createdAt: '2026-11-25T06:30:00.000Z',
    answers: [],
  },
  {
    id: 'QA-1043',
    title: 'Safe ways to improve stamina without taking unverified pills?',
    question:
      'I finish within 1–2 minutes during intercourse and see ads for random herbal boosters online. What clinically proven steps or safe doctor-guided options actually work?',
    category: 'Erectile & Stamina',
    patientAlias: 'Anonymous • 25–34 yrs',
    ageGroup: '25–34',
    gender: 'Male',
    isAnonymous: true,
    helpfulCount: 8,
    createdAt: '2026-11-24T18:10:00.000Z',
    answers: [],
  },
];

function cloneSeeds() {
  return SEED_THREADS.map((thread) => ({
    ...thread,
    answers: thread.answers.map((ans) => ({ ...ans })),
  }));
}

function normalizeAnswer(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const body = String(raw.body || '').trim();
  if (!body) return null;
  return {
    id: String(raw.id || `ANS-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`),
    doctorName: String(raw.doctorName || 'Verified Nayacura Doctor').trim(),
    doctorSpecialty: String(raw.doctorSpecialty || 'Clinical Sexologist').trim(),
    doctorRegNo: String(raw.doctorRegNo || '').trim(),
    doctorCity: String(raw.doctorCity || '').trim(),
    body,
    recommendation: String(raw.recommendation || '').trim(),
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function normalizeQaThread(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = String(raw.title || '').trim();
  const question = String(raw.question || '').trim();
  if (!title || !question) return null;
  const isAnonymous = raw.isAnonymous !== false;
  const ageGroup = String(raw.ageGroup || '').trim();
  const displayName = String(raw.patientName || '').trim();
  const fallbackAlias = isAnonymous
    ? `Anonymous${ageGroup ? ` • ${ageGroup} yrs` : ' Patient'}`
    : `${displayName || 'Patient'}${ageGroup ? ` • ${ageGroup} yrs` : ''}`;

  return {
    id: String(raw.id || `QA-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`),
    title,
    question,
    category: QA_CATEGORIES.includes(raw.category) ? raw.category : QA_CATEGORIES[QA_CATEGORIES.length - 1],
    patientAlias: String(raw.patientAlias || fallbackAlias).trim(),
    ageGroup,
    gender: String(raw.gender || 'Prefer not to say').trim(),
    isAnonymous,
    helpfulCount: Math.max(0, Math.round(Number(raw.helpfulCount) || 0)),
    createdAt: raw.createdAt || new Date().toISOString(),
    answers: Array.isArray(raw.answers) ? raw.answers.map(normalizeAnswer).filter(Boolean) : [],
  };
}

function saveThreads(threads) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(QA_STORAGE_KEY, JSON.stringify(threads));
  } catch {
    /* ignore storage errors */
  }
  window.dispatchEvent(new Event(QA_EVENT));
}

export function listQaThreads() {
  const seeds = cloneSeeds();
  if (!hasWindow()) return seeds;
  try {
    const raw = window.localStorage.getItem(QA_STORAGE_KEY);
    if (!raw) return seeds;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seeds;
    const normalized = parsed.map(normalizeQaThread).filter(Boolean);
    return normalized.length ? normalized : seeds;
  } catch {
    return seeds;
  }
}

export function postQaQuestion(input) {
  const thread = normalizeQaThread({
    ...input,
    id: `QA-${Math.floor(1000 + Math.random() * 9000)}`,
    helpfulCount: 0,
    createdAt: new Date().toISOString(),
    answers: [],
  });
  if (!thread) {
    throw new Error('Please enter both a doubt headline and your question.');
  }
  const next = [thread, ...listQaThreads()];
  saveThreads(next);
  return thread;
}

export function postDoctorAnswer(questionId, answerInput) {
  const answer = normalizeAnswer({
    ...answerInput,
    createdAt: new Date().toISOString(),
  });
  if (!answer) {
    throw new Error('Please write a clinical answer before posting.');
  }
  const current = listQaThreads();
  const target = current.find((item) => item.id === questionId);
  if (!target) {
    throw new Error('Question thread not found.');
  }
  const next = current.map((item) =>
    item.id === questionId
      ? { ...item, answers: [...item.answers, answer] }
      : item,
  );
  saveThreads(next);
  return answer;
}

export function listLikedQaIds() {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(QA_LIKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveLikedIds(ids) {
  if (!hasWindow()) return;
  try {
    window.localStorage.setItem(QA_LIKED_KEY, JSON.stringify(ids));
  } catch {
    /* ignore storage errors */
  }
}

export function toggleHelpful(questionId) {
  const liked = new Set(listLikedQaIds());
  const alreadyLiked = liked.has(questionId);
  if (alreadyLiked) {
    liked.delete(questionId);
  } else {
    liked.add(questionId);
  }
  const delta = alreadyLiked ? -1 : 1;
  const current = listQaThreads();
  const next = current.map((item) =>
    item.id === questionId
      ? { ...item, helpfulCount: Math.max(0, (item.helpfulCount || 0) + delta) }
      : item,
  );
  saveLikedIds([...liked]);
  saveThreads(next);
  return { threads: next, likedIds: [...liked], liked: !alreadyLiked };
}

export function subscribeQaThreads(callback) {
  if (!hasWindow()) return () => {};
  const onUpdate = () => callback(listQaThreads(), listLikedQaIds());
  const onStorage = (event) => {
    if (!event.key || event.key === QA_STORAGE_KEY || event.key === QA_LIKED_KEY) {
      onUpdate();
    }
  };
  window.addEventListener(QA_EVENT, onUpdate);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(QA_EVENT, onUpdate);
    window.removeEventListener('storage', onStorage);
  };
}
