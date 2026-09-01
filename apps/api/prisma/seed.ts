import { PrismaClient, USER_ROLE } from '../generated/prisma';
import { hashPassword } from '../modules/auth';
import config from '../config';

const prisma = new PrismaClient();

const seedAdmin = async (): Promise<void> => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[seed] SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set — admin not created');
    return;
  }

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      fullName: 'Admin',
      password: await hashPassword(password),
      role: USER_ROLE.ADMIN,
      emailVerified: true,
    },
  });

  console.info(`[seed] admin ready: ${email}`);
};

/**
 * Namunaviy avtomobil katalogi yozuvi — haqiqiy reference-data emas, faqat
 * dev/testing muhitida forma va CRUD oqimini tekshirish uchun (§13: hajm/test
 * ma'lumotlari faqat production bo'lmagan muhitda). Haqiqiy katalog admin panel
 * orqali to'ldiriladi.
 */
const seedVehicleCatalog = async (): Promise<void> => {
  const brand = await prisma.brand.upsert({ where: { name: 'BMW' }, update: {}, create: { name: 'BMW' } });

  const model = await prisma.model.upsert({
    where: { brandId_name: { brandId: brand.id, name: '5 Series' } },
    update: {},
    create: { brandId: brand.id, name: '5 Series' },
  });

  const generation = await prisma.generation.upsert({
    where: { modelId_name: { modelId: model.id, name: 'G30' } },
    update: {},
    create: { modelId: model.id, name: 'G30', yearFrom: 2017, yearTo: 2023 },
  });

  await prisma.engineOption.upsert({
    where: { generationId_name: { generationId: generation.id, name: '530i 2.0 Turbo' } },
    update: {},
    create: {
      generationId: generation.id,
      name: '530i 2.0 Turbo',
      volumeLiters: 2.0,
      fuel: 'PETROL',
      transmission: 'AUTOMATIC',
      powerHp: 252,
    },
  });

  console.info('[seed] vehicle catalog ready: BMW 5 Series G30 530i');
};

/** Haqiqiy reference-data — barcha muhitda (jumladan production) ishga tushadi (§13). */
const seedServiceCatalog = async (): Promise<void> => {
  const items: { slug: string; name: { uz: string; ru: string; en: string } }[] = [
    { slug: 'ecu-diagnostics', name: { uz: 'ECU Diagnostika', ru: 'ECU Диагностика', en: 'ECU Diagnostics' } },
    { slug: 'stage-1', name: { uz: 'Stage 1', ru: 'Stage 1', en: 'Stage 1' } },
    { slug: 'stage-2', name: { uz: 'Stage 2', ru: 'Stage 2', en: 'Stage 2' } },
    { slug: 'eco-tune', name: { uz: 'Eco Tune', ru: 'Эко-тюнинг', en: 'Eco Tune' } },
    { slug: 'custom-tune', name: { uz: 'Custom Tune', ru: 'Индивидуальный тюнинг', en: 'Custom Tune' } },
    { slug: 'dpf-diagnostics', name: { uz: 'DPF diagnostikasi', ru: 'Диагностика DPF', en: 'DPF Diagnostics' } },
    { slug: 'egr-diagnostics', name: { uz: 'EGR diagnostikasi', ru: 'Диагностика EGR', en: 'EGR Diagnostics' } },
    { slug: 'adblue-diagnostics', name: { uz: 'AdBlue diagnostikasi', ru: 'Диагностика AdBlue', en: 'AdBlue Diagnostics' } },
    { slug: 'turbo-diagnostics', name: { uz: 'Turbo diagnostikasi', ru: 'Диагностика турбины', en: 'Turbo Diagnostics' } },
    {
      slug: 'transmission-diagnostics',
      name: { uz: 'Avtomat karobka diagnostikasi', ru: 'Диагностика АКПП', en: 'Transmission Diagnostics' },
    },
  ];

  for (const item of items) {
    await prisma.serviceCatalogItem.upsert({ where: { slug: item.slug }, update: {}, create: item });
  }

  console.info(`[seed] service catalog ready: ${items.length} items`);
};

const main = async (): Promise<void> => {
  await seedAdmin();
  await seedServiceCatalog();

  if (config.stage !== 'production') {
    await seedVehicleCatalog();
  }
};

main()
  .catch((error) => {
    console.error('[seed] error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
