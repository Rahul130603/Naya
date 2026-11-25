import { useEffect } from 'react';
import { CONDITIONS_DATA } from '../data/conditionsData';

const SITE_NAME = 'Nayacura';
const DEFAULT_IMAGE = '/og/nayacura-og.png';

const PUBLIC_ROUTES = {
  '/': {
    title: 'Confidential Sexual Wellness, Verified Sexologists & Intimate Care',
    description:
      "India's confidential sexual wellness platform. Consult verified sexologists online or in-clinic, book discreet at-home hormone & STI tests, and get doctor-approved treatment in 100% plain packaging.",
  },
  '/consult-sexologist': {
    title: 'Consult Verified Sexologists Online & In-Clinic',
    description:
      'Book a private consultation with MCI/NMC-verified sexologists and andrologists for erectile dysfunction, premature ejaculation, low libido, vaginismus and intimacy concerns.',
    breadcrumb: 'Consult a Sexologist',
  },
  '/video-consult': {
    title: 'Private Video Consultation with Sexologists',
    description:
      'Talk to a verified sexologist from home in a secure, encrypted video room. Same-day slots, complete privacy, and no judgement.',
    breadcrumb: 'Video Consultation',
  },
  '/lab-tests': {
    title: 'Confidential At-Home Hormone & STI Tests',
    description:
      'Discreet at-home sample collection for testosterone, hormone panels and 7-panel STI screening. Reports stay private in your Nayacura account.',
    breadcrumb: 'Lab Tests',
  },
  '/intimate-procedures': {
    title: 'Intimate Wellness Procedures & Treatments',
    description:
      'Clinician-led intimate wellness procedures including shockwave therapy, circumcision and pelvic floor care, explained with clear aftercare.',
    breadcrumb: 'Intimate Procedures',
  },
  '/wellness-store': {
    title: 'Discreet Sexual Wellness Store — Plain Packaging',
    description:
      'Doctor-approved sexual wellness products delivered in 100% unbranded, plain packaging with confidential billing.',
    breadcrumb: 'Wellness Store',
  },
  '/health-feed': {
    title: 'Sexual Health Guides & Expert Articles',
    description:
      'Evidence-informed guides on sexual wellness, intimacy, relationships, STI prevention and treatment — reviewed by Nayacura clinicians.',
    breadcrumb: 'Health Feed',
  },
  '/ask-doctor': {
    title: 'Ask a Doctor — Anonymous Sexual Health Q&A',
    description:
      'Post your sexual and intimate health doubts anonymously and receive clear, judgement-free answers from verified Nayacura sexologists.',
    breadcrumb: 'Ask a Doctor',
  },
  '/for-sexologists': {
    title: 'For Sexologists — Join Our Verified Clinician Network',
    description:
      'Apply to practise on Nayacura. Verified credentials, encrypted telehealth, digital prescriptions and confidential patient records.',
    breadcrumb: 'For Sexologists',
  },
  '/about': {
    title: 'About Nayacura — Confidential Sexual Wellness Care',
    description:
      'Nayacura is built to make sexual and intimate healthcare confidential, stigma-free and clinically credible in India.',
    breadcrumb: 'About',
  },
  '/contact': {
    title: 'Contact Nayacura — Private Support',
    description:
      'Reach the Nayacura care team for private help with appointments, reports, orders or clinician onboarding.',
    breadcrumb: 'Contact',
  },
  '/privacy-standards': {
    title: 'Privacy Standards & Confidentiality',
    description:
      'How Nayacura protects sexual health data: encryption, least-privilege access, anonymous records and plain-box delivery.',
    breadcrumb: 'Privacy Standards',
  },
  '/doctor-register': {
    title: 'Apply as a Clinician',
    description: 'Submit verified credentials to join the Nayacura clinician network.',
    noIndex: true,
    breadcrumb: 'Clinician Application',
  },
};

const PRIVATE_PREFIXES = [
  '/patient-dashboard',
  '/doctor-dashboard',
  '/admin-dashboard',
  '/dashboard',
  '/login',
  '/patient-login',
  '/doctor-login',
  '/admin-login',
  '/doctor/register',
  '/ai',
];

function setMeta(attr, key, value) {
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function setCanonical(href) {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = href;
}

function setPageJsonLd(data) {
  const id = 'nayacura-page-jsonld';
  let script = document.getElementById(id);
  if (!data) {
    script?.remove();
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function resolveSeo(pathname) {
  if (pathname.startsWith('/condition/')) {
    const slug = pathname.replace('/condition/', '').replace(/\/+$/, '');
    const condition = CONDITIONS_DATA[slug];
    if (condition) {
      return {
        title: `${condition.title} — Causes, Treatment & Specialists`,
        description: `${condition.tagline} ${condition.overview}`.slice(0, 158),
        breadcrumb: condition.title,
        conditionName: condition.title,
      };
    }
  }
  if (PUBLIC_ROUTES[pathname]) return PUBLIC_ROUTES[pathname];
  return {
    title: 'Page not found',
    description: 'The page you are looking for is not available on Nayacura.',
    noIndex: true,
  };
}

export function applyPageSeo(pathname) {
  if (typeof document === 'undefined') return;

  const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const seo = isPrivate
    ? {
        title: 'Private Portal',
        description: 'Private Nayacura portal for patients, clinicians and administrators.',
        noIndex: true,
      }
    : resolveSeo(pathname);

  const title = seo.title.includes(SITE_NAME) ? seo.title : `${seo.title} | ${SITE_NAME}`;
  const origin = window.location.origin;
  const url = `${origin}${pathname}`;
  const image = `${origin}${DEFAULT_IMAGE}`;

  document.title = title;
  setMeta('name', 'description', seo.description);
  setMeta('name', 'robots', seo.noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', seo.description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:type', 'website');
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:locale', 'en_IN');
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:image:alt', 'Nayacura — confidential sexual wellness with verified specialists');
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', seo.description);
  setMeta('name', 'twitter:image', image);
  setCanonical(url);

  if (seo.noIndex) {
    setPageJsonLd(null);
    return;
  }

  const breadcrumbName = seo.breadcrumb || (pathname === '/' ? 'Home' : title.split('|')[0].trim());
  setPageJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': seo.conditionName ? 'MedicalWebPage' : 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description: seo.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${origin}/#website` },
        primaryImageOfPage: { '@type': 'ImageObject', url: image },
        ...(seo.conditionName
          ? { about: { '@type': 'MedicalCondition', name: seo.conditionName }, audience: { '@type': 'Patient' } }
          : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          ...(pathname === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: breadcrumbName, item: url }]),
        ],
      },
    ],
  });
}

export function usePageSeo(pathname) {
  useEffect(() => {
    applyPageSeo(pathname);
  }, [pathname]);
}
