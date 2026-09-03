import { faker } from '@faker-js/faker';
import {
  ECU_FILE_KIND,
  NOTIFICATION_TYPE,
  ORDER_STATUS,
  PAYMENT_PROVIDER,
  PAYMENT_STATUS,
  PrismaClient,
  SERVICE_STATUS,
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
  TUNING_ORDER_STATUS,
  USER_ROLE,
} from '../generated/prisma';
import { hashPassword } from '../modules/auth';
import config from '../config';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password123!';
const CITIES = ['Toshkent', 'Samarqand', 'Buxoro', 'Andijon', 'Namangan', "Farg'ona"];

faker.seed(20260902);

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

/**
 * O'zbekistonda keng tarqalgan yana bir nechta brend/model/motor — namunaviy
 * ma'lumotlar (mijoz avtomobillari, buyurtmalar) turlicha bo'lishi uchun.
 * Har biri haqiqiy spetsifikatsiyaga mos (qo'lda tanlangan, faker emas — texnik
 * to'g'rilik muhim), faqat dev/testing muhitida (yuqoridagi kabi).
 */
const seedAdditionalVehicleCatalog = async (): Promise<void> => {
  const entries = [
    {
      brand: 'Chevrolet',
      model: 'Cobalt',
      generation: { name: 'I', yearFrom: 2013, yearTo: 2024 },
      engines: [
        { name: '1.5 MT', volumeLiters: 1.5, fuel: 'PETROL', transmission: 'MANUAL', powerHp: 98 },
        { name: '1.5 AT', volumeLiters: 1.5, fuel: 'PETROL', transmission: 'AUTOMATIC', powerHp: 106 },
      ],
    },
    {
      brand: 'Chevrolet',
      model: 'Nexia',
      generation: { name: 'III', yearFrom: 2016, yearTo: 2024 },
      engines: [{ name: '1.5 MT', volumeLiters: 1.5, fuel: 'PETROL', transmission: 'MANUAL', powerHp: 105 }],
    },
    {
      brand: 'Toyota',
      model: 'Camry',
      generation: { name: 'XV70', yearFrom: 2017, yearTo: 2023 },
      engines: [{ name: '2.5 AT', volumeLiters: 2.5, fuel: 'PETROL', transmission: 'AUTOMATIC', powerHp: 181 }],
    },
    {
      brand: 'Hyundai',
      model: 'Tucson',
      generation: { name: 'TL', yearFrom: 2015, yearTo: 2020 },
      engines: [{ name: '2.0 CRDi AT', volumeLiters: 2.0, fuel: 'DIESEL', transmission: 'AUTOMATIC', powerHp: 185 }],
    },
    {
      brand: 'Mercedes-Benz',
      model: 'E-Class',
      generation: { name: 'W213', yearFrom: 2016, yearTo: 2023 },
      engines: [{ name: 'E200 2.0 Turbo', volumeLiters: 2.0, fuel: 'PETROL', transmission: 'AUTOMATIC', powerHp: 245 }],
    },
  ] as const;

  for (const entry of entries) {
    const brand = await prisma.brand.upsert({ where: { name: entry.brand }, update: {}, create: { name: entry.brand } });
    const model = await prisma.model.upsert({
      where: { brandId_name: { brandId: brand.id, name: entry.model } },
      update: {},
      create: { brandId: brand.id, name: entry.model },
    });
    const generation = await prisma.generation.upsert({
      where: { modelId_name: { modelId: model.id, name: entry.generation.name } },
      update: {},
      create: { modelId: model.id, ...entry.generation },
    });

    for (const engine of entry.engines) {
      await prisma.engineOption.upsert({
        where: { generationId_name: { generationId: generation.id, name: engine.name } },
        update: {},
        create: { generationId: generation.id, ...engine },
      });
    }
  }

  console.info(`[seed] additional vehicle catalog ready: ${entries.length} brand/model combos`);
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

// types

interface DemoContext {
  customers: { id: string; fullName: string }[];
  brandIds: string[];
  engineOptionIds: string[];
  catalogItems: { id: string; slug: string }[];
  admin: { id: string } | null;
}

const randomItem = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];
const randomSubset = <T>(items: T[], count: number): T[] => faker.helpers.arrayElements(items, Math.min(count, items.length));

const seedCustomers = async (count: number): Promise<{ id: string; fullName: string }[]> => {
  const customers: { id: string; fullName: string }[] = [];
  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  for (let index = 0; index < count; index += 1) {
    const fullName = faker.person.fullName();
    const email = `customer${index + 1}@smartecu.local`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName,
        password: hashedPassword,
        role: USER_ROLE.CUSTOMER,
        phone: faker.phone.number({ style: 'international' }),
        emailVerified: true,
      },
    });

    customers.push({ id: user.id, fullName: user.fullName });
  }

  console.info(`[seed] ${customers.length} customers ready`);
  return customers;
};

/** N ta VERIFIED ServiceProvider — o'z egasi SERVICE roliga o'tadi, tasodifiy brend+xizmat bilan bog'lanadi. */
const seedServiceProviders = async (count: number, brandIds: string[], catalogItems: { id: string }[]): Promise<void> => {
  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  for (let index = 0; index < count; index += 1) {
    const email = `service${index + 1}@smartecu.local`;
    const companyName = `${faker.company.name()} Auto Service`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        fullName: faker.person.fullName(),
        password: hashedPassword,
        role: USER_ROLE.SERVICE,
        phone: faker.phone.number({ style: 'international' }),
        emailVerified: true,
      },
    });

    const existing = await prisma.serviceProvider.findUnique({ where: { userId: user.id } });
    if (existing) continue;

    const provider = await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        name: companyName,
        description: faker.lorem.sentence(),
        city: randomItem(CITIES),
        address: faker.location.streetAddress(),
        phone: faker.phone.number({ style: 'international' }),
        telegram: `@${faker.internet.username()}`,
        workingHours: '09:00–19:00',
        status: SERVICE_STATUS.VERIFIED,
        brands: { connect: randomSubset(brandIds, 3).map((id) => ({ id })) },
        offerings: {
          create: randomSubset(catalogItems, 4).map((item) => {
            const priceMin = faker.number.int({ min: 50_000, max: 300_000 });
            return { serviceCatalogItemId: item.id, priceMin, priceMax: priceMin + faker.number.int({ min: 50_000, max: 500_000 }) };
          }),
        },
      },
    });

    console.info(`[seed] service provider ready: ${provider.name} (${provider.city})`);
  }
};

/** N ta VERIFIED TunerProfile — o'z egasi TUNER roliga o'tadi. */
const seedTuners = async (count: number, brandIds: string[]): Promise<void> => {
  const hashedPassword = await hashPassword(DEMO_PASSWORD);

  for (let index = 0; index < count; index += 1) {
    const email = `tuner${index + 1}@smartecu.local`;
    const companyName = `${faker.company.name()} Chip Tuning`;

    const user = await prisma.user.upsert({
      where: { email },
      update: { role: USER_ROLE.TUNER },
      create: {
        email,
        fullName: faker.person.fullName(),
        password: hashedPassword,
        role: USER_ROLE.TUNER,
        phone: faker.phone.number({ style: 'international' }),
        emailVerified: true,
      },
    });

    const existing = await prisma.tunerProfile.findUnique({ where: { userId: user.id } });
    if (existing) continue;

    const tuner = await prisma.tunerProfile.create({
      data: {
        userId: user.id,
        name: companyName,
        description: faker.lorem.sentence(),
        city: randomItem(CITIES),
        address: faker.location.streetAddress(),
        phone: faker.phone.number({ style: 'international' }),
        telegram: `@${faker.internet.username()}`,
        workingHours: '10:00–20:00',
        status: SERVICE_STATUS.VERIFIED,
        brands: { connect: randomSubset(brandIds, 3).map((id) => ({ id })) },
      },
    });

    console.info(`[seed] tuner ready: ${tuner.name} (${tuner.city})`);
  }
};

/** Har bir mijozga 1-2 avtomobil — ba'zilari katalogdan, ba'zilari erkin kiritilgan. */
const seedCustomerVehicles = async (customers: { id: string }[], engineOptionIds: string[]): Promise<string[]> => {
  const vehicleIds: string[] = [];

  for (const customer of customers) {
    const vehicleCount = faker.number.int({ min: 1, max: 2 });

    for (let index = 0; index < vehicleCount; index += 1) {
      const useCatalog = engineOptionIds.length > 0 && faker.datatype.boolean();

      const vehicle = await prisma.userVehicle.create({
        data: {
          userId: customer.id,
          isPrimary: index === 0,
          ...(useCatalog
            ? { engineOptionId: randomItem(engineOptionIds) }
            : {
                customBrand: faker.vehicle.manufacturer(),
                customModel: faker.vehicle.model(),
                customYear: faker.number.int({ min: 2005, max: 2023 }),
              }),
          vin: faker.vehicle.vin(),
          plateNumber: `01 ${faker.number.int({ min: 100, max: 999 })} ${faker.string.alpha({ length: 3, casing: 'upper' })}`,
          mileageKm: faker.number.int({ min: 5_000, max: 250_000 }),
        },
      });

      vehicleIds.push(vehicle.id);
    }
  }

  console.info(`[seed] ${vehicleIds.length} customer vehicles ready`);
  return vehicleIds;
};

const findMatchingProviders = async (city: string, serviceCatalogItemId: string) => {
  return prisma.serviceProvider.findMany({
    where: {
      status: SERVICE_STATUS.VERIFIED,
      city: { equals: city, mode: 'insensitive' },
      offerings: { some: { serviceCatalogItemId } },
    },
    select: { id: true, userId: true },
  });
};

const seedOrders = async (
  customers: { id: string; fullName: string }[],
  vehicleIds: string[],
  catalogItems: { id: string }[],
): Promise<void> => {
  const offerings = await prisma.serviceOffering.findMany({
    where: { serviceProvider: { status: SERVICE_STATUS.VERIFIED } },
    select: { serviceCatalogItemId: true, serviceProvider: { select: { city: true } } },
  });
  if (offerings.length === 0) return;

  let created = 0;
  const attempts = customers.length * 2;

  for (let index = 0; index < attempts; index += 1) {
    const customer = customers[index % customers.length];
    const offering = randomItem(offerings);
    const catalogItem = catalogItems.find((item) => item.id === offering.serviceCatalogItemId) ?? randomItem(catalogItems);
    const city = offering.serviceProvider.city;
    const matches = await findMatchingProviders(city, catalogItem.id);
    if (matches.length === 0) continue;

    // Taqsimot: ~40% COMPLETED, ~25% IN_PROGRESS, ~20% NEW, ~15% CANCELLED — real ko'rinish uchun.
    const roll = Math.random();
    const status = roll < 0.4 ? ORDER_STATUS.COMPLETED : roll < 0.65 ? ORDER_STATUS.IN_PROGRESS : roll < 0.85 ? ORDER_STATUS.NEW : ORDER_STATUS.CANCELLED;
    const accepted = status === ORDER_STATUS.COMPLETED || status === ORDER_STATUS.IN_PROGRESS ? randomItem(matches) : null;

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        userVehicleId: vehicleIds.length ? randomItem(vehicleIds) : undefined,
        serviceCatalogItemId: catalogItem.id,
        problemDescription: faker.lorem.sentence(),
        city,
        phone: faker.phone.number({ style: 'international' }),
        status,
        acceptedServiceProviderId: accepted?.id,
        recipients: { create: matches.map((provider) => ({ serviceProviderId: provider.id })) },
      },
    });

    if (status === ORDER_STATUS.COMPLETED && accepted) {
      await prisma.review.create({
        data: {
          orderId: order.id,
          userId: customer.id,
          serviceProviderId: accepted.id,
          rating: faker.number.int({ min: 3, max: 5 }),
          comment: faker.lorem.sentence(),
        },
      });

      const aggregate = await prisma.review.aggregate({ where: { serviceProviderId: accepted.id }, _avg: { rating: true }, _count: true });
      await prisma.serviceProvider.update({
        where: { id: accepted.id },
        data: { ratingAvg: aggregate._avg.rating ?? 0, ratingCount: aggregate._count },
      });

      await prisma.notification.create({
        data: { userId: accepted.userId, type: NOTIFICATION_TYPE.REVIEW_RECEIVED, orderId: order.id },
      });
    }

    if (accepted) {
      await prisma.notification.create({
        data: { userId: accepted.userId, type: NOTIFICATION_TYPE.ORDER_RECEIVED, orderId: order.id, readAt: faker.datatype.boolean() ? new Date() : null },
      });
      await prisma.notification.create({
        data: { userId: customer.id, type: NOTIFICATION_TYPE.ORDER_ACCEPTED, orderId: order.id, readAt: faker.datatype.boolean() ? new Date() : null },
      });
    }

    created += 1;
  }

  console.info(`[seed] ${created} orders ready (with matching reviews/notifications)`);
};

const seedTuningOrders = async (customers: { id: string }[], vehicleIds: string[], catalogItems: { id: string; slug: string }[]): Promise<void> => {
  const tuningItems = catalogItems.filter((item) => item.slug.startsWith('stage') || item.slug === 'eco-tune' || item.slug === 'custom-tune');
  if (tuningItems.length === 0) return;

  const tuners = await prisma.tunerProfile.findMany({ where: { status: SERVICE_STATUS.VERIFIED }, select: { id: true, userId: true } });
  if (tuners.length === 0) return;

  const statuses: TUNING_ORDER_STATUS[] = [
    TUNING_ORDER_STATUS.NEW,
    TUNING_ORDER_STATUS.IN_PROGRESS,
    TUNING_ORDER_STATUS.WAITING_FOR_LOG,
    TUNING_ORDER_STATUS.READY,
    TUNING_ORDER_STATUS.COMPLETED,
    TUNING_ORDER_STATUS.COMPLETED,
  ];

  let created = 0;
  let customerCursor = 0;

  for (const tuner of tuners) {
    for (const status of statuses) {
      const customer = customers[customerCursor % customers.length];
      customerCursor += 1;

      const order = await prisma.tuningOrder.create({
        data: {
          tunerId: tuner.id,
          userId: customer.id,
          userVehicleId: vehicleIds.length ? randomItem(vehicleIds) : undefined,
          serviceCatalogItemId: randomItem(tuningItems).id,
          problemDescription: faker.lorem.sentence(),
          status,
          ...(status === TUNING_ORDER_STATUS.COMPLETED
            ? {
                powerBeforeHp: faker.number.int({ min: 150, max: 250 }),
                powerAfterHp: faker.number.int({ min: 260, max: 340 }),
                torqueBeforeNm: faker.number.int({ min: 250, max: 400 }),
                torqueAfterNm: faker.number.int({ min: 410, max: 550 }),
                fuelConsumptionBefore: faker.number.float({ min: 9, max: 12, fractionDigits: 1 }),
                fuelConsumptionAfter: faker.number.float({ min: 7, max: 9, fractionDigits: 1 }),
                resultsVerified: true,
              }
            : {}),
        },
      });

      if (status === TUNING_ORDER_STATUS.WAITING_FOR_LOG || status === TUNING_ORDER_STATUS.READY || status === TUNING_ORDER_STATUS.COMPLETED) {
        await prisma.ecuFile.create({
          data: {
            tuningOrderId: order.id,
            kind: ECU_FILE_KIND.ORIGINAL,
            storageKey: `ecu-file/demo/${order.id}-original.bin`,
            originalName: 'original.bin',
            software: 'Bosch EDC17',
            uploadedById: tuner.userId,
          },
        });
      }

      if (status === TUNING_ORDER_STATUS.COMPLETED) {
        await prisma.ecuFile.create({
          data: {
            tuningOrderId: order.id,
            kind: ECU_FILE_KIND.MODIFIED,
            storageKey: `ecu-file/demo/${order.id}-modified.bin`,
            originalName: 'stage1.bin',
            software: 'Bosch EDC17',
            uploadedById: tuner.userId,
          },
        });
      }

      await prisma.notification.create({ data: { userId: tuner.userId, type: NOTIFICATION_TYPE.TUNING_ORDER_RECEIVED } });

      created += 1;
    }
  }

  console.info(`[seed] ${created} tuning orders ready (har bir tuner uchun to'liq kanban)`);
};

/** Bitta mijozga PRO obuna + PAID to'lov yozuvi — obuna UI'sini bo'sh holatda emas ko'rish uchun. */
const seedSubscription = async (customer: { id: string }): Promise<void> => {
  const periodEnd = new Date();
  periodEnd.setDate(periodEnd.getDate() + 30);

  const subscription = await prisma.subscription.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id, plan: SUBSCRIPTION_PLAN.PRO, status: SUBSCRIPTION_STATUS.ACTIVE, currentPeriodEnd: periodEnd },
  });

  const existingPayment = await prisma.payment.findFirst({ where: { subscriptionId: subscription.id } });
  if (existingPayment) return;

  await prisma.payment.create({
    data: {
      userId: customer.id,
      subscriptionId: subscription.id,
      plan: SUBSCRIPTION_PLAN.PRO,
      provider: PAYMENT_PROVIDER.PAYME,
      providerTransactionId: faker.string.alphanumeric(24),
      amount: 99_000,
      status: PAYMENT_STATUS.PAID,
    },
  });

  console.info('[seed] 1 demo subscription + payment ready');
};

const seedBroadcastNotification = async (customers: { id: string }[], adminId: string | undefined): Promise<void> => {
  if (!adminId || customers.length === 0) return;

  const message = {
    uz: "Smart ECU'ga xush kelibsiz! Yangi Stage 2 xizmati qo'shildi.",
    ru: 'Добро пожаловать в Smart ECU! Добавлена новая услуга Stage 2.',
    en: 'Welcome to Smart ECU! A new Stage 2 service has been added.',
  };

  await prisma.notification.createMany({
    data: customers.map((customer) => ({ userId: customer.id, type: NOTIFICATION_TYPE.ADMIN_BROADCAST, broadcastMessage: message })),
  });

  await prisma.auditLog.create({
    data: { actorId: adminId, action: 'NOTIFICATION_BROADCAST_SENT', targetType: 'Notification', metadata: { role: 'ALL', recipientCount: customers.length } },
  });

  console.info(`[seed] broadcast notification sent to ${customers.length} customers`);
};

const seedDemoData = async (): Promise<void> => {
  const marker = await prisma.user.findUnique({ where: { email: 'customer1@smartecu.local' } });
  if (marker) {
    console.info('[seed] demo data already present — skipping');
    return;
  }

  const admin = await prisma.user.findFirst({ where: { role: USER_ROLE.ADMIN } });
  const brands = await prisma.brand.findMany({ select: { id: true } });
  const engineOptions = await prisma.engineOption.findMany({ select: { id: true } });
  const catalogItems = await prisma.serviceCatalogItem.findMany({ select: { id: true, slug: true } });

  const context: DemoContext = {
    customers: [],
    brandIds: brands.map((brand) => brand.id),
    engineOptionIds: engineOptions.map((engine) => engine.id),
    catalogItems,
    admin: admin ? { id: admin.id } : null,
  };

  context.customers = await seedCustomers(8);
  await seedServiceProviders(3, context.brandIds, context.catalogItems);
  await seedTuners(3, context.brandIds);

  const vehicleIds = await seedCustomerVehicles(context.customers, context.engineOptionIds);

  await seedOrders(context.customers, vehicleIds, context.catalogItems);
  await seedTuningOrders(context.customers, vehicleIds, context.catalogItems);
  await seedSubscription(context.customers[0]);
  await seedBroadcastNotification(context.customers, context.admin?.id);

  console.info('[seed] demo data ready — all demo accounts use password: ' + DEMO_PASSWORD);
};

const main = async (): Promise<void> => {
  await seedAdmin();
  await seedServiceCatalog();

  if (config.stage !== 'production') {
    await seedVehicleCatalog();
    await seedAdditionalVehicleCatalog();
    await seedDemoData();
  }
};

main()
  .catch((error) => {
    console.error('[seed] error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
