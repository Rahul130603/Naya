
/**
 * Editorial library for the Nayacura Health Feed.
 *
 * Each entry is a complete article so the card can open a real page. The feed
 * shows a rotating set of ten per day (see `getDailyArticles`), which keeps the
 * page fresh without inventing unreviewed clinical claims each morning.
 */
export const ARTICLES = [
  {
    slug: 'erectile-dysfunction-vascular-issue',
    title: 'Why Erectile Dysfunction is a Vascular Issue, Not a Personal Failure',
    category: "Men's Sexual Health",
    author: 'Dr. Arvind Swaminathan',
    specialty: 'Senior Clinical Sexologist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    summary:
      'Penile arteries are only 1–2 mm wide. Learn why stress, sitting posture, diabetes and smoking hit blood flow first — and how that is investigated and treated.',
    sections: [
      {
        heading: 'The smallest arteries show the earliest changes',
        body: 'Penile arteries are among the narrowest in the body, so the first signs of endothelial dysfunction often appear here. That is why erectile difficulty can show up years before a cardiac event — it is a vascular signal, not a verdict on masculinity.',
      },
      {
        heading: 'What a clinician actually checks',
        body: 'A proper assessment reviews blood pressure, fasting glucose and lipids, testosterone where indicated, sleep quality, medication history and smoking. Physical examination and, in selected cases, a Doppler ultrasound help distinguish vascular causes from anxiety-driven ones.',
      },
      {
        heading: 'Treatment works best as a combination',
        body: 'Evidence-based care pairs medication where appropriate with lifestyle change: 150 minutes of weekly activity, better sleep, quitting smoking and treating any underlying diabetes or hypertension. Psychosexual input helps when performance anxiety has developed on top of a physical trigger.',
      },
    ],
    takeaways: [
      'Erection difficulty is often an early vascular sign, not a character flaw.',
      'Blood pressure, glucose, lipids and testosterone are the first sensible checks.',
      'Combining medical treatment with lifestyle change gives the best results.',
    ],
  },
  {
    slug: 'vaginismus-truth-about-painful-penetration',
    title: 'The Truth About Vaginismus: Overcoming Involuntary Tightness and Painful Sex',
    category: "Women's Sexual Wellness",
    author: 'Dr. Meera Nambiar',
    specialty: "Women's Sexual Health Specialist",
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    summary:
      'Painful penetration is common and treatable. Understand the muscle spasm behind vaginismus and the stepwise therapy that helps most women.',
    sections: [
      {
        heading: 'It is a protective reflex, not a lack of desire',
        body: 'Vaginismus is an involuntary contraction of the pelvic floor muscles in response to anticipated penetration. It is a learned protective response, which is why telling someone to relax does not help and can make the cycle worse.',
      },
      {
        heading: 'What treatment looks like',
        body: 'Care usually combines pelvic floor physiotherapy, graded desensitisation with dilators at a comfortable pace, breathing and relaxation work, and psychosexual counselling for any anxiety or pain memory. Partners are often included in the plan.',
      },
      {
        heading: 'How long it takes',
        body: 'Many women notice meaningful improvement within weeks when the programme is consistent, though timelines vary. Pain is never something to push through — progress is built on small, comfortable steps.',
      },
    ],
    takeaways: [
      'Vaginismus is an involuntary muscle response, not a psychological failing.',
      'Graded desensitisation plus physiotherapy is the core of treatment.',
      'Pain should never be pushed through — pace the programme comfortably.',
    ],
  },
  {
    slug: 'performance-anxiety-vs-biological-ed',
    title: 'Performance Anxiety vs Biological ED: How to Tell What Is Happening',
    category: 'Intimacy Psychology',
    author: 'Dr. Shalini Mukherjee',
    specialty: 'Certified Sex Therapist',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    summary:
      'Anxiety releases adrenaline that constricts blood vessels. Here is how clinicians separate a psychological pattern from a physical cause — and why both can coexist.',
    sections: [
      {
        heading: 'The clue is usually in the pattern',
        body: 'Erections present during sleep or masturbation but not with a partner point more towards anxiety. A consistent loss of firmness across all situations, or a gradual decline over months, points more towards a vascular, hormonal or medication-related cause.',
      },
      {
        heading: 'Both problems often travel together',
        body: 'One difficult experience creates worry, worry raises adrenaline, and adrenaline makes the next experience harder. Over time a purely psychological trigger can produce genuine performance difficulty, which is why assessment looks at both sides.',
      },
      {
        heading: 'What helps',
        body: 'Cognitive techniques, sensate focus exercises and paced intimacy reduce the pressure loop. Where a physical factor is also present, treating it removes the trigger that started the cycle.',
      },
    ],
    takeaways: [
      'Situational difficulty leans psychological; consistent difficulty leans physical.',
      'Anxiety and vascular causes frequently overlap.',
      'Sensate focus and paced intimacy reduce the pressure loop.',
    ],
  },
  {
    slug: 'premature-ejaculation-what-actually-helps',
    title: 'Premature Ejaculation: What Actually Helps',
    category: "Men's Sexual Health",
    author: 'Dr. Harish Venkatesh',
    specialty: 'Andrologist & Urologist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&q=80&w=800',
    summary:
      'From behavioural pacing to topical and oral options — an evidence-based overview of what changes ejaculatory control and what does not.',
    sections: [
      {
        heading: 'Start with a clear definition',
        body: 'Clinicians look at time to ejaculation, control, and distress rather than a stopwatch alone. Lifelong and acquired patterns are treated differently, so the history matters more than any single number.',
      },
      {
        heading: 'Behavioural work comes first',
        body: 'Stop–start and squeeze techniques, pelvic floor training and reducing performance pressure all have supportive evidence. These are most effective when practised consistently and combined with partner communication.',
      },
      {
        heading: 'When medication is appropriate',
        body: 'Topical anaesthetics and specific oral medications can help selected patients, but they need clinical review — particularly where cardiovascular health, medication interactions or fertility plans are involved.',
      },
    ],
    takeaways: [
      'Control and distress matter as much as timing.',
      'Behavioural techniques are the first-line, low-risk option.',
      'Medication needs clinical review, not self-experimentation.',
    ],
  },
  {
    slug: 'testosterone-testing-when-worth-it',
    title: 'Testosterone Testing: When It Is Actually Worth It',
    category: 'Hormones & Vitality',
    author: 'Dr. Harish Venkatesh',
    specialty: 'Andrologist & Urologist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    summary:
      'Low energy is not automatically low testosterone. Here is when testing is reasonable, how samples should be timed, and what results genuinely mean.',
    sections: [
      {
        heading: 'Symptoms first, then testing',
        body: 'Persistent low libido, reduced morning erections, fatigue, low mood and loss of muscle mass are reasonable reasons to test. Fatigue alone has many causes — sleep, thyroid, anaemia, depression and medication all matter.',
      },
      {
        heading: 'Timing and repetition',
        body: 'Testosterone peaks in the morning, so samples are best taken early. A single low result is not a diagnosis: guidelines recommend repeating the test before any treatment decision.',
      },
      {
        heading: 'What treatment involves',
        body: 'Where deficiency is confirmed and symptoms fit, treatment can help — but it requires monitoring of haematocrit, blood pressure and fertility intentions, because supplementation can suppress sperm production.',
      },
    ],
    takeaways: [
      'Test only when symptoms fit, not on a hunch.',
      'Morning samples and a repeat test are standard practice.',
      'Fertility plans must be discussed before starting treatment.',
    ],
  },
  {
    slug: 'sti-screening-seven-panel',
    title: 'STI Screening: What a 7-Panel Test Actually Covers',
    category: 'Testing & Prevention',
    author: 'Dr. Deepika Ramaswamy',
    specialty: 'Venereologist / STI Specialist',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800',
    summary:
      'What is included in a comprehensive screen, how the window period affects accuracy, and how results are handled privately.',
    sections: [
      {
        heading: 'What sits inside a comprehensive panel',
        body: 'A thorough screen typically covers HIV, hepatitis B and C, syphilis, chlamydia, gonorrhoea and trichomonas. Some panels add HSV antibodies or mycoplasma testing depending on symptoms and exposure history.',
      },
      {
        heading: 'Window periods matter',
        body: 'A negative result too early after exposure can be falsely reassuring. HIV and syphilis testing have specific window periods, and nucleic-acid tests for chlamydia and gonorrhoea differ again — so timing should guide the test chosen.',
      },
      {
        heading: 'Privacy and next steps',
        body: 'Results should be released only to the patient through a secure channel, with treatment started promptly where needed and partner notification supported confidentially where relevant.',
      },
    ],
    takeaways: [
      'A good screen covers bacterial, viral and parasitic infections.',
      'Testing too early after exposure can produce false reassurance.',
      'Confidential release and prompt treatment are part of good care.',
    ],
  },
  {
    slug: 'painful-sex-after-menopause',
    title: 'Painful Sex After Menopause: What Can Be Done',
    category: "Women's Sexual Wellness",
    author: 'Dr. Meera Nambiar',
    specialty: "Women's Sexual Health Specialist",
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800',
    summary:
      'Genitourinary changes after menopause are common, treatable and rarely discussed. Understand the options — from lubricants to local therapy.',
    sections: [
      {
        heading: 'Why it happens',
        body: 'Falling oestrogen thins the vaginal lining, reduces natural lubrication and changes tissue elasticity. The result is dryness, burning and pain with penetration — a treatable condition known as genitourinary syndrome of menopause.',
      },
      {
        heading: 'What helps',
        body: 'Regular moisturisers, lubricants, pelvic floor work and, for many women, low-dose local oestrogen make a substantial difference. Systemic hormone therapy and non-hormonal prescription options are considered case by case.',
      },
      {
        heading: 'Bring it up with someone',
        body: 'These symptoms are common and treatable, but many people avoid mentioning them. A clinician conversation should be matter-of-fact, and discomfort during intimacy is a valid reason to seek care.',
      },
    ],
    takeaways: [
      'Post-menopausal pain is common and has effective treatment options.',
      'Local oestrogen and moisturisers are first-line for many women.',
      'Discomfort is a valid clinical concern, not something to tolerate.',
    ],
  },
  {
    slug: 'low-libido-hormones-sleep-stress',
    title: 'Low Libido: Hormones, Sleep and Stress',
    category: 'Hormones & Vitality',
    author: 'Dr. Arvind Swaminathan',
    specialty: 'Senior Clinical Sexologist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?auto=format&fit=crop&q=80&w=800',
    summary:
      'Desire is influenced by endocrine, psychological and relational factors. A practical framework for finding the real driver.',
    sections: [
      {
        heading: 'Three systems, one symptom',
        body: 'Hormones (testosterone, thyroid, prolactin), mental health (stress, depression, medication) and the relationship itself all shape desire. Treating only one of them rarely resolves the complaint.',
      },
      {
        heading: 'Sleep is underrated',
        body: 'Chronic sleep restriction lowers morning testosterone and raises cortisol. Before complex investigation, stabilising sleep, alcohol intake and activity levels is a reasonable first step.',
      },
      {
        heading: 'What assessment looks like',
        body: 'A clinician reviews onset, stressor timeline, medication history and bloods where indicated, then agrees a plan. Responsive desire — wanting after arousal rather than before — is normal and often misunderstood.',
      },
    ],
    takeaways: [
      'Desire has hormonal, psychological and relational drivers.',
      'Sleep and alcohol are modifiable factors worth fixing first.',
      'Responsive desire is normal and commonly misread as low libido.',
    ],
  },
  {
    slug: 'diabetes-and-erectile-health',
    title: 'Diabetes and Erectile Health: Protecting What You Can',
    category: "Men's Sexual Health",
    author: 'Dr. Harish Venkatesh',
    specialty: 'Andrologist & Urologist',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    summary:
      'Elevated glucose damages small blood vessels and nerves. Control today changes what is possible later — here is how.',
    sections: [
      {
        heading: 'Why glucose control matters',
        body: 'Persistent high glucose damages the endothelium and the small nerves involved in erection. Good glycaemic control, blood pressure and lipid management protect function over years rather than weeks.',
      },
      {
        heading: 'Medication interactions',
        body: 'Some blood pressure medicines and antidepressants affect sexual function. If a problem started with a new prescription, that is clinically relevant and worth raising rather than stopping medication independently.',
      },
      {
        heading: 'A realistic plan',
        body: 'Activity, weight management, smoking cessation and consistent follow-up form the base. Where needed, clinicians add targeted treatment, always checking cardiac safety and nitrate interactions first.',
      },
    ],
    takeaways: [
      'Glucose and blood pressure control protect erectile function long term.',
      'New medication can be a genuine trigger — raise it clinically.',
      'Never combine nitrate medication with ED treatment without advice.',
    ],
  },
  {
    slug: 'talking-about-intimacy-as-a-couple',
    title: 'Talking About Intimacy Without It Turning Into a Fight',
    category: 'Relationships & Communication',
    author: 'Dr. Shalini Mukherjee',
    specialty: 'Certified Sex Therapist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&q=80&w=800',
    summary:
      'Most couples argue about sex when they are really arguing about feeling wanted. A practical way to open the conversation.',
    sections: [
      {
        heading: 'Name the feeling, not the scoreboard',
        body: 'Complaints about frequency often carry an unspoken question — do you still want me? Naming that directly is more productive than negotiating numbers.',
      },
      {
        heading: 'Choose a neutral moment',
        body: 'Conversations about intimacy go better outside the bedroom and outside a conflict. A twenty-minute walk, phones away, is a better container than a late-night argument.',
      },
      {
        heading: 'Ask before you propose',
        body: 'Curiosity works better than solutions. Asking what feels good, what feels pressured, and what is missing creates information you can actually act on.',
      },
    ],
    takeaways: [
      'Most intimacy arguments are really about feeling wanted.',
      'Talk outside the bedroom, in a calm, time-boxed conversation.',
      'Ask questions before proposing solutions.',
    ],
  },
  {
    slug: 'pcos-and-intimacy',
    title: 'Understanding PCOS and Intimacy',
    category: "Women's Sexual Wellness",
    author: 'Dr. Deepika Ramaswamy',
    specialty: 'Venereologist / STI Specialist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    summary:
      'PCOS can affect desire, comfort and body image. How hormonal management and psychological support fit together.',
    sections: [
      {
        heading: 'Beyond cycles and fertility',
        body: 'PCOS affects androgen levels, insulin resistance, mood and body image — all of which can influence desire and comfort. Treatment plans that ignore those dimensions miss part of the picture.',
      },
      {
        heading: 'Medical options',
        body: 'Depending on goals, clinicians may discuss cycle regulation, insulin-sensitising medication, or management of excess hair and acne. Choice depends on whether fertility, symptom control or both are priorities.',
      },
      {
        heading: 'Body image deserves attention',
        body: 'Shame and self-consciousness are common and treatable. Psychosexual support can help rebuild comfort with intimacy alongside medical management.',
      },
    ],
    takeaways: [
      'PCOS affects desire and comfort, not just cycles.',
      'Treatment depends on your goals — symptom control, fertility or both.',
      'Body image support is a legitimate part of care.',
    ],
  },
  {
    slug: 'sexologist-or-urologist',
    title: 'Sexologist or Urologist: Who Should You See?',
    category: 'Getting Care',
    author: 'Dr. Arvind Swaminathan',
    specialty: 'Senior Clinical Sexologist',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    summary:
      'A practical guide to choosing the right specialist the first time, and why the two roles often overlap.',
    sections: [
      {
        heading: 'Start with the symptom',
        body: 'Physical symptoms — pain, structural concerns, urinary problems, surgical questions — usually belong with a urologist or gynaecologist. Desire, anxiety, communication and relationship concerns are better served by a sexologist or psychosexual therapist.',
      },
      {
        heading: 'Overlap is normal',
        body: 'Many conditions need both. Erectile difficulty often has a vascular component and an anxiety component, and clinicians routinely work together rather than in isolation.',
      },
      {
        heading: 'What a first appointment covers',
        body: 'Expect a focused history, relevant bloods where indicated, and a plan you understand. A good consultation should leave you knowing what is being investigated and why.',
      },
    ],
    takeaways: [
      'Match the specialist to the dominant symptom.',
      'Overlap between medical and psychological care is common and useful.',
      'A good first visit ends with a clear plan.',
    ],
  },
  {
    slug: 'phimosis-and-circumcision',
    title: 'Phimosis and Circumcision: What to Expect',
    category: "Men's Sexual Health",
    author: 'Dr. Harish Venkatesh',
    specialty: 'Andrologist & Urologist',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    summary:
      'Tight foreskin is common and often manageable without surgery. When conservative treatment is enough — and when it is not.',
    sections: [
      {
        heading: 'Types and causes',
        body: 'Phimosis may be physiological in children, or acquired in adults through inflammation, scarring or infection. The distinction changes the treatment path significantly.',
      },
      {
        heading: 'Non-surgical options first',
        body: 'Topical steroid cream with gentle stretching resolves many cases, particularly in younger patients. Treating any underlying balanitis or fungal infection matters alongside it.',
      },
      {
        heading: 'When surgery is considered',
        body: 'Recurrent infection, urinary problems, painful erections or failure of conservative treatment are reasonable indications. Modern stapler techniques generally shorten recovery, but technique and aftercare should be discussed.',
      },
    ],
    takeaways: [
      'Most phimosis is treatable without surgery.',
      'Topical steroids with guided stretching are first-line.',
      'Surgery is reserved for specific indications, not routine.',
    ],
  },
  {
    slug: 'pelvic-floor-basics',
    title: 'Pelvic Floor Physiotherapy: Why It Helps Both Sexes',
    category: 'Recovery & Therapy',
    author: 'Dr. Meera Nambiar',
    specialty: "Women's Sexual Health Specialist",
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    summary:
      'The pelvic floor affects control, comfort and sensation. What supervised training involves and what it can change.',
    sections: [
      {
        heading: 'A muscle group, not a mystery',
        body: 'The pelvic floor supports organs and contributes to continence and sexual sensation. Both weakness and excessive tension cause problems, which is why assessment comes before exercises.',
      },
      {
        heading: 'What a session looks like',
        body: 'A trained physiotherapist assesses breathing, coordination and tone, then prescribes targeted exercises. Biofeedback is used where available and is particularly helpful for people who struggle to identify the muscles.',
      },
      {
        heading: 'Realistic expectations',
        body: 'Improvement typically builds over 6–12 weeks of consistent practice. Pain and discomfort should be reviewed rather than pushed through.',
      },
    ],
    takeaways: [
      'Both tight and weak pelvic floors cause symptoms.',
      'Assessment should come before a generic exercise plan.',
      'Consistency over 6–12 weeks produces the change.',
    ],
  },
  {
    slug: 'porn-and-real-expectations',
    title: 'Pornography and Real Expectations: A Clinical View',
    category: 'Intimacy Psychology',
    author: 'Dr. Shalini Mukherjee',
    specialty: 'Certified Sex Therapist',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    summary:
      'Where concern is legitimate, where it is moral panic, and what actually helps when habits start shaping expectations.',
    sections: [
      {
        heading: 'Separate the question from the shame',
        body: 'Many people use pornography without difficulty. The clinical question is not whether someone watches, but whether habits are displacing real intimacy, producing performance pressure or causing distress.',
      },
      {
        heading: 'How expectations shift',
        body: 'Repeated exposure can shape what arousal is compared against, making ordinary intimacy feel less stimulating. That is a learning effect, and it responds to behavioural work rather than shame.',
      },
      {
        heading: 'What helps',
        body: 'Reducing use gradually, rebuilding sensation-focused intimacy, and addressing underlying anxiety or relationship issues are the usual approach. Escalating distress warrants professional support.',
      },
    ],
    takeaways: [
      'Distress and displacement matter more than simple usage counts.',
      'Expectations can shift with repeated exposure — and can shift back.',
      'Behavioural work, not shame, is the effective route.',
    ],
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Article index for the requested day, so the feed refreshes daily. */
export function getDailyArticles(count = 10, date = new Date()) {
  if (!ARTICLES.length) return [];
  const total = ARTICLES.length;
  const dayIndex = Math.floor(date.getTime() / DAY_MS);
  const take = Math.min(count, total);
  const start = ((dayIndex % total) + total) % total;
  return Array.from({ length: take }, (_, offset) => ARTICLES[(start + offset) % total]);
}

export function getArticleBySlug(slug) {
  return ARTICLES.find((article) => article.slug === slug) || null;
}

export function getRelatedArticles(slug, count = 3) {
  const current = getArticleBySlug(slug);
  if (!current) return ARTICLES.slice(0, count);
  const sameCategory = ARTICLES.filter(
    (article) => article.slug !== slug && article.category === current.category,
  );
  const others = ARTICLES.filter(
    (article) => article.slug !== slug && article.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}
