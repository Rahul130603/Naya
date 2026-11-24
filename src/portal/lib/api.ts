const API_BASE = import.meta.env.VITE_API_URL || '/api';
export type ChatLanguage = 'en' | 'ta' | 'tanglish';
export type AiSource = { title: string; url: string };

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let csrfPromise: Promise<void> | null = null;

function readCookie(name: string) {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}

export async function ensureCsrf() {
  if (readCookie('nayacura_csrf')) return;
  if (!csrfPromise) {
    csrfPromise = fetch(`${API_BASE}/auth/csrf`, { credentials: 'include' })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        csrfPromise = null;
      });
  }
  await csrfPromise;
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  raw?: boolean;
};

// Local storage persistence helper for AI conversations
function getLocalConversations(): { id: string; title: string; updatedAt: string; language: string; messages: { id: string; role: string; content: string; createdAt: string }[] }[] {
  try {
    const raw = localStorage.getItem('nayacura_ai_conversations');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConversations(list: ReturnType<typeof getLocalConversations>) {
  try {
    localStorage.setItem('nayacura_ai_conversations', JSON.stringify(list.slice(0, 30)));
  } catch {
    /* ignore */
  }
}

function getClinicalFallbackReply(message: string, language: ChatLanguage = 'en'): { reply: string; sources: AiSource[] } {
  const lower = message.toLowerCase();
  const isEmergency = /suicide|kill myself|end my life|self[- ]harm|overdose|chest pain|heavy bleeding|tharkolai|tharkkolai|nenju vali|adhiga ratham|தற்கொலை|உயிரை மாய்த்து|நெஞ்சு வலி|அதிக இரத்தம்/.test(lower);

  if (isEmergency) {
    if (language === 'tanglish') {
      return {
        reply: 'Naan Naya, oru AI assistant. Idhu emergency-a irukkalaam. Ippove local emergency services-a call pannunga (India-la 112) illa pakkathula irukkura emergency hospital-ku ponga. Mudinja unga nambikkaiyana oruthar kooda irunga. Indha chat emergency medical care kudukka mudiyadhu.',
        sources: [{ title: 'Emergency Services India (112)', url: 'https://112.gov.in' }],
      };
    }
    if (language === 'ta') {
      return {
        reply: 'நான் நயா, ஒரு AI உதவியாளர் — மருத்துவர் அல்ல. நீங்கள் குறிப்பிடுவது அவசர நிலையாக இருக்கலாம். தயவுசெய்து இப்போதே உள்ளூர் அவசர சேவையை (இந்தியாவில் 112) அழைக்கவும் அல்லது அருகிலுள்ள அவசர மருத்துவமனைக்குச் செல்லவும். தனியாக இருக்க வேண்டாம் — நம்பகமான ஒருவரை அருகில் அழையுங்கள். இந்த உரையாடல் அவசர சிகிச்சைக்கு மாற்றல்ல.',
        sources: [{ title: 'Emergency Services India (112)', url: 'https://112.gov.in' }],
      };
    }
    return {
      reply: "I'm Naya, an AI assistant — not a doctor. What you have described may be an emergency. Please contact your local emergency service immediately (112 in India) or go to the nearest emergency hospital. If you can, stay with a trusted person. This chat cannot provide emergency medical care.",
      sources: [{ title: 'National Emergency Helpline India (112)', url: 'https://112.gov.in' }],
    };
  }

  // Medication / pill inquiry
  if (/\b(?:tablet[s]?|pill[s]?|medicines?|medications?|dosage|dose|supplements?|maathirai|mathirai|marundhu|paracetamol|sildenafil|tadalafil|viagra)\b|மாத்திரை|மருந்து/i.test(message)) {
    if (language === 'tanglish') {
      return {
        reply: 'Indha tablet illa medicine pathi accurate guidance venumna, Nayacura-la **Find a Specialist** moolama certified doctor-ai consult pannunga. Ungaloda medical history, BP, heart health ellam review pannitu dhaan safe dosage advise panna mudiyum. Self-medication safe illa.',
        sources: [{ title: 'Nayacura Certified Doctor Directory', url: 'https://nayacura.com/consult-sexologist' }],
      };
    }
    if (language === 'ta') {
      return {
        reply: 'மாத்திரை அல்லது மருந்து உட்கொள்வது குறித்து சந்தேகம் இருந்தால், நயாகுராவின் நிபுணர் பட்டியலில் ஒரு மருத்துவரைத் தேர்ந்தெடுத்து நேரடி ஆலோசனை பெறுங்கள். உங்கள் மருத்துவ வரலாறு, ரத்த அழுத்தம் மற்றும் உடல்நிலை விவரங்களை ஆராய்ந்த பிறகே சரியான மருந்தளவு பரிந்துரைக்கப்படும். சுய மருத்துவம் பாதுகாப்பானது அல்ல.',
        sources: [{ title: 'Nayacura Clinical Protocol', url: 'https://nayacura.com/consult-sexologist' }],
      };
    }
    return {
      reply: 'For questions regarding tablets, dosages, or sexual vitality medicines, please speak directly with a certified Nayacura sexologist or andrologist. Clinical safety requires evaluating cardiovascular health and existing prescriptions prior to any dosage recommendation.',
      sources: [{ title: 'Indian Council of Medical Research Telemedicine Protocols', url: 'https://www.icmr.gov.in' }],
    };
  }

  // Greetings & Welcome
  if (/^(?:hi|hello|hey|hai|vanakkam|வணக்கம்|namaste|good\s*(?:morning|afternoon|evening)|howdy|sup)\b|^hi$/i.test(lower)) {
    if (language === 'tanglish') {
      return {
        reply: "Hello! Naan Naya, unga confidential sexual wellness companion. Erection doubts (ED), stamina & timing (PE), low desire, intimacy anxiety, at-home lab tests illa doctor booking pathi ungalukku enna doubt irundhaalum tharaalama kelunga.\n\nIdhu 100% private and judgment-free space. Ungalukku eppadi help pannattum?",
        sources: [{ title: 'Nayacura Confidential Care', url: 'https://nayacura.com/privacy-standards' }],
      };
    }
    if (language === 'ta') {
      return {
        reply: 'வணக்கம்! நான் நயா, நயாகுராவின் ரகசிய பாலியல் நல்வாழ்வு AI உதவியாளர். உடலுறவு குறித்த பயம், விறைப்புத்தன்மை (ED), விரைந்து விந்து வெளியேறுதல் (PE), விருப்பமின்மை, ஹார்மோன் பரிசோதனைகள் அல்லது மருத்துவ ஆலோசனை குறித்து தயக்கமின்றி என்னிடம் கேட்கலாம்.\n\nஉங்கள் உரையாடல் 100% ரகசியமானது மற்றும் பாதுகாப்பானது. உங்களுக்கு இன்று எவ்வாறு உதவட்டும்?',
        sources: [{ title: 'நயாகுரா ரகசிய மருத்துவ நெறிமுறைகள்', url: 'https://nayacura.com/privacy-standards' }],
      };
    }
    return {
      reply: "Hello! I'm Naya, your confidential sexual wellness and intimate health companion at Nayacura. You can talk to me openly and privately about intimacy anxiety, erectile concerns (ED), stamina & timing (PE), low desire, discreet at-home testing, or finding the right verified specialist.\n\nEverything you share here is 100% judgment-free and confidential. How can I support you today?",
      sources: [{ title: 'Nayacura Clinical Standards', url: 'https://nayacura.com/privacy-standards' }],
    };
  }

  // Intimacy anxiety / nervousness
  if (/anxiet|anxious|worry|nervous|fear|stress|bayam|kavalai|பதற்றம்|கவலை|பயம்/.test(lower)) {
    if (language === 'tanglish') {
      return {
        reply: `Intimacy pathi anxiety varradhu romba common; idhu body matrum mind rendlayum impact pannum.\n\n• **Pace down**: Perform pannanum-nu pressure illama gentle-a start pannunga.\n• **Box Breathing**: Slow-a 4 counts inhale, 4 counts hold, 4 counts exhale pannunga; idhu nervous system-a calm pannum.\n• **Open Talk**: Unga discomfort-a partner-kitta soft-a communicate pannunga.\n\nIdhu persistent-a irundhaa, Nayacura-la psychosexual counsellor kooda 100% camera-off private session book pannalaam.`,
        sources: [{ title: 'Clinical Psychosexual Therapy Standards', url: 'https://nayacura.com/privacy-standards' }],
      };
    }
    if (language === 'ta') {
      return {
        reply: `உடலுறவு குறித்த பதற்றம் (Performance Anxiety) மிகவும் பொதுவானது. இது உடல் மற்றும் உணர்வு நிலைகள் இரண்டிலும் தாக்கத்தை ஏற்படுத்தும்.\n\n• **அழுத்தத்தைத் தவிர்க்கவும்**: 'நன்றாகச் செயல்பட வேண்டும்' என்ற இலக்கின்றி, அன்பான மெதுவான தொடுதலுடன் தொடங்குங்கள்.\n• **ஆழ்ந்த சுவாசம்**: 4 வினாடிகள் மூச்சை உள்ளிழுத்து மெதுவாக வெளிவிடுவது நரம்பு மண்டலத்தை அமைதிப்படுத்தும்.\n• **துணையுடன் உரையாடல்**: உங்கள் தயக்கத்தை துணையிடம் இயல்பாகப் பகிருங்கள்.\n\nபதற்றம் தொடர்ந்து நீடித்தால், நயாகுராவில் கேமரா-ஆஃப் (Camera-Off) முறையில் ஒரு பாலியல் மனநல ஆலோசகரிடம் ரகசிய ஆலோசனை பெறலாம்.`,
        sources: [{ title: 'British Association for Sexual and Relationship Therapy', url: 'https://www.basrt.org.uk' }],
      };
    }
    return {
      reply: `Anxiety around intimacy is extremely common and has genuine physiological triggers.\n\n1. **Shift Focus Away from Performance**: Intimacy is about mutual comfort and sensory connection, not passing a test.\n2. **Regulate Your Nervous System**: Practice diaphragmatic breathing (4-second inhale, 4-second hold, 6-second exhale) to deactivate the sympathetic stress response.\n3. **De-escalate Pressure**: Take penetration off the table initially and focus on relaxed, non-goal-oriented touch.\n\nIf this anxiety persists, consulting a psychosexual therapist through Nayacura via private audio or video can help untangle the root triggers in complete confidentiality.`,
      sources: [
        { title: 'Nayacura Clinical Care Guide', url: 'https://nayacura.com/privacy-standards' },
        { title: 'European Society for Sexual Medicine (ESSM)', url: 'https://www.essm.org' },
      ],
    };
  }

  // Doctor vs Counsellor / First consultation
  if (/doctor or a counsellor|doctor.*counsellor|who should i see|first.*consult|what happens|முதல் ஆலோசனை|நிபுணர்/.test(lower)) {
    if (language === 'tanglish') {
      return {
        reply: `Doctor ah illa Counsellor ah nu therinjukka indha simple guide use pannunga:\n\n• **Doctor (Clinical Sexologist / Andrologist)**: Erection issue (ED), timing concern (PE), physical pain, foreskin issue, hormonal check venumna doctor best.\n• **Counsellor (Psychosexual Therapist)**: Performance anxiety, guilt, low desire due to relationship stress, partner communication problem-ku counsellor best.\n\n**First Consultation-la Enna Nadakkum?**\n60 seconds-la connect aagalaam. 100% camera-off option irukku. Ungalukku comfort aana details mattum share panna podhum. Endha judgment-um irukkaadhu.`,
        sources: [{ title: 'Nayacura Specialist Directory', url: 'https://nayacura.com/consult-sexologist' }],
      };
    }
    if (language === 'ta') {
      return {
        reply: `உங்களுக்கு யார் தேவை என்பதை எளிதாகத் தீர்மானிக்கலாம்:\n\n• **பாலியல் மருத்துவர் (Medical Specialist)**: விறைப்புத்தன்மை பிரச்சனை (ED), விரைந்து விந்து வெளியேறுதல் (PE), உடலுறவின் போது வலி, அல்லது ஹார்மோன் பரிசோதனைக்கு மருத்துவர் தேவை.\n• **பாலியல் ஆலோசகர் (Psychosexual Counsellor)**: மன பயம், குற்ற உணர்வு, உறவுச்சிக்கல், விருப்பமின்மை ஆகியவற்றுக்கு ஆலோசகர் சிறந்தது.\n\n**முதல் ஆலோசனையில் என்ன நடக்கும்?**\nவீடியோ அல்லது கேமரா இல்லாத ஆடியோ அழைப்பில் 60 வினாடிகளில் இணையலாம். உங்களுக்கு வசதியான தகவல்களை மட்டுமே பகிரலாம். உங்கள் அடையாளம் மற்றும் மருத்துவ விவரங்கள் 100% ரகசியமாக வைக்கப்படும்.`,
        sources: [{ title: 'Nayacura Specialist Directory', url: 'https://nayacura.com/consult-sexologist' }],
      };
    }
    return {
      reply: `Choosing between a medical doctor and a psychosexual counsellor depends on your primary symptom:\n\n• **See a Doctor (Sexologist / Andrologist / Gynecologist)**: If symptoms are physical — such as erection firmness issues, rapid ejaculation, pain during intercourse, or hormonal fatigue.\n• **See a Counsellor (Psychosexual Therapist)**: If symptoms stem from performance stress, body image concerns, mismatched desire, or communication blocks.\n\n**What to expect in your first consultation:**\nSessions take place in an encrypted digital room with optional camera-off mode. Your specialist will listen without judgment, review potential lifestyle and medical factors, and outline an evidence-based roadmap.`,
      sources: [{ title: 'Nayacura Specialist Directory', url: 'https://nayacura.com/consult-sexologist' }],
    };
  }

  // Low desire / Libido
  if (/desire|libido|interest|drive|mood|aasai|viruppam|விருப்பம்|ஆசை/.test(lower)) {
    if (language === 'tanglish') {
      return {
        reply: `Low desire (viruppam kuraivadhu) pala factors-naala varalaam:\n\n1. **Hormonal Vitality**: Low testosterone, thyroid imbalance, illa prolactin level change.\n2. **Mental Stress & Sleep**: Work fatigue, poor sleep, and depression desire-a suppress pannum.\n3. **Relationship Dynamic**: Partner kooda emotional connection illa unresolved conflict.\n\nNayacura-la Home Blood Test (Testosterone + Hormone Panel) book pannalaam, koodave experienced sexologist kooda private review pannalaam.`,
        sources: [{ title: 'Nayacura Hormone Vitality Panel', url: 'https://nayacura.com/lab-tests' }],
      };
    }
    if (language === 'ta') {
      return {
        reply: `பாலியல் விருப்பமின்மை (Low Libido) பல காரணங்களால் ஏற்படலாம்:\n\n1. **ஹார்மோன் சமநிலையின்மை**: டெஸ்டோஸ்டிரோன் (Testosterone) அளவு குறைவு அல்லது தைராய்டு மாற்றம்.\n2. **மன அழுத்தம் & தூக்கமின்மை**: தொடர் வேலை அழுத்தம் மற்றும் தூக்கமின்மை உடல் எனர்ஜியைக் குறைக்கும்.\n3. **உறவு சூழல்**: துணையுடன் போதுமான உணர்வுபூர்வ உரையாடல் இல்லாமை.\n\nநயாகுராவில் வீட்டிலிருந்தே பாதுகாப்பான ரத்தப் பரிசோதனை (ஹார்மோன் பேனல்) செய்து, மருத்துவரிடம் ஆலோசனை பெறலாம்.`,
        sources: [{ title: 'Nayacura Hormone Vitality Panel', url: 'https://nayacura.com/lab-tests' }],
      };
    }
    return {
      reply: `Fluctuations in sexual desire are influenced by endocrine, vascular, and psychological factors:\n\n1. **Endocrine Check**: Free and Total Testosterone, Prolactin, and Thyroid (TSH) levels directly govern sexual appetite.\n2. **Fatigue & Sleep Architecture**: REM sleep deprivation depresses natural nocturnal testosterone synthesis.\n3. **Psychological & Relational Stress**: Cortisol elevation directly suppresses hypothalamic reproductive signaling.\n\nA Nayacura hormone vitality screening followed by a discreet teleconsultation can pinpoint the root cause.`,
      sources: [
        { title: 'Nayacura Hormone Panel', url: 'https://nayacura.com/lab-tests' },
        { title: 'Endocrine Society Clinical Practice Guidelines', url: 'https://www.endocrine.org' },
      ],
    };
  }

  // Default Clinical Fallback
  if (language === 'tanglish') {
    return {
      reply: `Nayacura sexual wellness companion-ku welcome. Erection issue (ED), premature ejaculation (PE), low desire, intimacy anxiety, lab test illa clinic procedures pathi ungalukku enna doubt irundhaalum tharaalama kelunga.\n\nUnga questions 100% anonymous & confidential. Thevaippatta **Find a Specialist** moolama senior doctors kooda direct private consult book pannalaam.`,
      sources: [{ title: 'Nayacura Confidential Care', url: 'https://nayacura.com/privacy-standards' }],
    };
  }
  if (language === 'ta') {
    return {
      reply: `நயாகுரா பாலியல் நல்வாழ்வு உதவி மையத்திற்கு வரவேற்கிறோம். விறைப்புத்தன்மை (ED), விரைந்து விந்து வெளியேறுதல் (PE), விருப்பமின்மை, உடலுறவு குறித்த பயம், ரத்தப் பரிசோதனைகள் அல்லது மருத்துவ சிகிச்சைகள் குறித்து உங்கள் சந்தேகங்களை தயக்கமின்றி கேட்கலாம்.\n\nஉங்கள் உரையாடல் 100% தனிப்பட்டது மற்றும் ரகசியமானது. தேவைப்பட்டால் நயாகுராவின் மூத்த மருத்துவர்களிடம் நேரடி வீடியோ/ஆடியோ ஆலோசனையும் பெறலாம்.`,
      sources: [{ title: 'Nayacura Confidential Care', url: 'https://nayacura.com/privacy-standards' }],
    };
  }
  return {
    reply: `Welcome to Naya AI, your confidential clinical intimacy and sexual health companion. You can ask freely about erectile health, stamina, low desire, pelvic comfort, discrete STI/hormone testing, or outpatient procedures.\n\nAll conversations are private and non-judgmental. When you are ready for individualized clinical care, you can connect directly with verified specialists through our portal.`,
    sources: [{ title: 'Nayacura Clinical Standards', url: 'https://nayacura.com/privacy-standards' }],
  };
}

async function clientFallbackStreamAi(
  payload: { message: string; conversationId?: string | null; language?: ChatLanguage; consent: boolean; voice?: boolean },
  onToken: (token: string) => void,
  signal?: AbortSignal,
  onSources?: (sources: AiSource[]) => void,
): Promise<string> {
  const convId = payload.conversationId || `conv-${Date.now()}`;
  const lang = payload.language || 'en';
  const { reply, sources } = getClinicalFallbackReply(payload.message, lang);

  if (onSources && sources.length > 0) {
    onSources(sources);
  }

  const words = reply.split(/(\s+)/);
  for (const part of words) {
    if (signal?.aborted) break;
    onToken(part);
    if (part.trim()) {
      await new Promise((r) => setTimeout(r, 22));
    }
  }

  // Save conversation to local storage
  try {
    const list = getLocalConversations();
    const existing = list.find((c) => c.id === convId);
    const userMsg = { id: `m-${Date.now()}-u`, role: 'user', content: payload.message, createdAt: new Date().toISOString() };
    const botMsg = { id: `m-${Date.now()}-b`, role: 'assistant', content: reply, createdAt: new Date().toISOString() };
    if (existing) {
      existing.updatedAt = new Date().toISOString();
      existing.messages.push(userMsg, botMsg);
    } else {
      const title = payload.message.length > 36 ? `${payload.message.slice(0, 36)}…` : payload.message;
      list.unshift({
        id: convId,
        title,
        updatedAt: new Date().toISOString(),
        language: lang,
        messages: [userMsg, botMsg],
      });
    }
    saveLocalConversations(list);
  } catch {
    /* ignore storage errors */
  }

  return convId;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();

  // Local storage interception for AI conversations to support instant zero-config guest chat
  if (path.startsWith('/ai/conversations')) {
    try {
      const localList = getLocalConversations();
      if (path === '/ai/conversations' && method === 'GET') {
        return {
          conversations: localList.map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,
          })),
        } as T;
      }
      const match = path.match(/^\/ai\/conversations\/([^/?]+)/);
      if (match) {
        const targetId = match[1];
        if (method === 'DELETE') {
          saveLocalConversations(localList.filter((c) => c.id !== targetId));
          return undefined as T;
        }
        if (method === 'GET') {
          const found = localList.find((c) => c.id === targetId);
          if (found) {
            return {
              conversation: { id: found.id, language: found.language },
              messages: found.messages,
            } as T;
          }
        }
      }
    } catch {
      /* continue to fetch */
    }
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) await ensureCsrf();

  const headers = new Headers(options.headers);
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = readCookie('nayacura_csrf');
    if (csrf) headers.set('X-CSRF-Token', decodeURIComponent(csrf));
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include',
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
    });
  } catch (netErr) {
    // If fetching /ai/conversations failed over network, return empty local list rather than throw
    if (path === '/ai/conversations' && method === 'GET') {
      return { conversations: [] } as T;
    }
    throw new ApiError('Service is currently unreachable. Please try again.', 503);
  }

  if (!res.ok) {
    if (path.startsWith('/ai/conversations')) {
      const localList = getLocalConversations();
      if (path === '/ai/conversations' && method === 'GET') {
        return {
          conversations: localList.map((c) => ({
            id: c.id,
            title: c.title,
            updatedAt: c.updatedAt,
          })),
        } as T;
      }
    }
    let error: { message?: string; code?: string; details?: unknown } = {};
    try {
      error = await res.json();
    } catch {
      /* non-JSON error */
    }
    throw new ApiError(
      error.message || `Something went wrong (${res.status}). Please try again.`,
      res.status,
      error.code,
      error.details,
    );
  }

  if (res.status === 204) return undefined as T;
  if (options.raw) return res as T;
  return (await res.json()) as T;
}

export async function streamAi(
  payload: { message: string; conversationId?: string | null; language?: ChatLanguage; consent: boolean; voice?: boolean },
  onToken: (token: string) => void,
  signal?: AbortSignal,
  onSources?: (sources: AiSource[]) => void,
) {
  try {
    await ensureCsrf();
    const csrf = readCookie('nayacura_csrf');
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(csrf ? { 'X-CSRF-Token': decodeURIComponent(csrf) } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let conversationId: string | undefined;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        for (const event of events) {
          const line = event.split('\n').find((l) => l.startsWith('data: '));
          if (!line) continue;
          const data = JSON.parse(line.slice(6));
          if (data.type === 'meta' && data.conversationId) conversationId = data.conversationId;
          if (data.type === 'token') onToken(data.token);
          if (data.type === 'sources' && Array.isArray(data.sources)) {
            onSources?.(data.sources.filter((source: AiSource | null): source is AiSource =>
              Boolean(source && typeof source.title === 'string' && typeof source.url === 'string' && source.url.startsWith('https://'))));
          }
          if (data.type === 'error') throw new ApiError(data.message || 'Naya AI is unavailable.', 502);
        }
      }
      return conversationId;
    }
  } catch (err) {
    if (signal?.aborted) throw err;
  }

  // Graceful smart client-side streaming clinical triage
  return await clientFallbackStreamAi(payload, onToken, signal, onSources);
}

export async function uploadMedicalDocument(
  file: File,
  category: 'REPORT' | 'PRESCRIPTION' | 'REFERRAL' | 'OTHER' = 'OTHER',
  appointmentId?: string,
) {
  await ensureCsrf();
  const csrf = readCookie('nayacura_csrf');
  const endpoint = appointmentId ? `/appointments/${encodeURIComponent(appointmentId)}/files` : '/patient/documents';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': file.type,
      'X-CSRF-Token': csrf ? decodeURIComponent(csrf) : '',
      'X-File-Name': encodeURIComponent(file.name),
      'X-File-Category': category,
    },
    body: file,
  });
  if (!res.ok) {
    let message = 'The document could not be uploaded.';
    try {
      const data = await res.json();
      message = data.details?.file?.[0] || data.details?.status?.[0] || data.message || message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as {
    document: {
      id: string;
      fileName: string;
      mimeType: string;
      sizeBytes: number;
      category: string;
      createdAt: string;
    };
    message: string;
  };
}

export { API_BASE };
