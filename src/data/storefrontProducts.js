import { TREATMENTS_STORE } from './healthcareData';

const presentation = [
  { title: 'ED Consultation & Treatment', group: 'Men’s wellness', kind: 'box', color: '#0B3B82', background: '#EDF3FC', label: 'PERSONAL CARE', size: 'Doctor-guided care', consult: true, copy: 'Explore a treatment plan with a qualified specialist. Medication selection and prescribing require a consultation.' },
  { title: 'Pro-Delay Care Spray', group: 'Men’s wellness', kind: 'spray', color: '#5862A9', background: '#F0EFF9', label: 'PRO-DELAY', size: 'Metered spray', consult: true, copy: 'Speak with a clinician about suitability, product directions and precautions before ordering.' },
  { title: 'Himalayan Shilajit Resin', group: 'Daily vitality', kind: 'jar', color: '#86704A', background: '#F7F3E9', label: 'SHILAJIT', size: '20 g resin', copy: 'A resin-format supplement for your wellness routine. Review the ingredients and suitability with your clinician.' },
  { title: 'Intimate Hydration Gel', group: 'Intimate care', kind: 'tube', color: '#A35E77', background: '#FBF0F3', label: 'HYDRATE', size: '100 ml · Water based', copy: 'A water-based intimate hydration gel. Follow the product label and stop use if irritation occurs.' },
  { title: 'Ashwagandha Vitality Capsules', group: 'Daily vitality', kind: 'bottle', color: '#46745C', background: '#EDF5EE', label: 'DAILY VITALITY', size: '60 capsules', copy: 'A botanical supplement for a daily wellness routine. Check ingredients and possible interactions with your clinician.' },
  { title: 'Gentle Intimate Wash', group: 'Intimate care', kind: 'pump', color: '#2B7D82', background: '#EAF6F5', label: 'GENTLE CARE', size: '120 ml · Foaming wash', copy: 'A gentle cleansing foam for external use. See the product label for ingredients and directions.' },
];

export const STORE_PRODUCTS = TREATMENTS_STORE.map((product, index) => ({ ...product, ...presentation[index] }));
export const STORE_CATEGORIES = ['All products', 'Men’s wellness', 'Intimate care', 'Daily vitality'];
