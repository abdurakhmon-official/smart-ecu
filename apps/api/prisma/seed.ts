import { PrismaClient, USER_ROLE } from '../generated/prisma';
import { hashPassword } from '../modules/auth';

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

/** Bosh sahifadagi avtomobil tanlash formasini dev'da sinash uchun bir nechta namunaviy yozuv. */
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

const main = async (): Promise<void> => {
  await seedAdmin();
  await seedVehicleCatalog();
};

main()
  .catch((error) => {
    console.error('[seed] error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
