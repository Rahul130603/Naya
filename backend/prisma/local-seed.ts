import { prisma } from '../src/config/prisma';

// Reference taxonomy only. No invented doctors, appointments, reviews or accounts.
async function main() {
  const specializations = [
    ['clinical-sexology', 'Clinical Sexology'], ['andrology-urology', 'Andrology & Urology'],
    ['womens-sexual-health', 'Women’s Sexual Health'], ['psychosexual-therapy', 'Psychosexual Therapy'],
    ['sti-care', 'Sexual Health & STI Care'],
  ];
  for (const [slug, name] of specializations) await prisma.specialization.upsert({ where: { slug }, create: { slug, name }, update: {} });
  const category = await prisma.serviceCategory.upsert({ where: { slug: 'sexual-wellness' }, update: {}, create: {
    slug: 'sexual-wellness', name: 'Sexual wellness', tagline: 'Care at your pace',
    description: 'Consult a qualified clinician about your concerns. Services depend on clinician availability.',
  } });
  const services = [
    ['erectile-concerns', 'Erectile concerns', 'Discuss erection difficulties and possible next steps with a clinician.'],
    ['ejaculation-concerns', 'Ejaculation concerns', 'Talk about timing concerns and their effect on your wellbeing.'],
    ['desire-intimacy', 'Desire & intimacy', 'Discuss changes in desire, comfort or intimacy.'],
    ['womens-sexual-health', 'Women’s sexual health', 'Speak with a clinician about discomfort and other sexual health concerns.'],
    ['sexual-health-sti', 'Sexual health & STI care', 'Get a clinical assessment and advice about appropriate testing.'],
    ['psychosexual-counselling', 'Psychosexual counselling', 'Explore emotional concerns about intimacy with a qualified professional.'],
  ];
  for (const [slug, name, summary] of services) await prisma.service.upsert({ where: { slug }, update: {}, create: { slug, name, summary, categoryId: category.id } });
  console.log('Reference services and specializations ready. No sample clinical data or credentials created.');
}
main().finally(() => prisma.$disconnect());
