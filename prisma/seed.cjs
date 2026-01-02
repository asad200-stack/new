/* eslint-disable no-console */
const bcrypt = require("bcryptjs");
const { PrismaClient, StoreRole } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

function toSlug(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const demoEmail = "owner@demo.com";
  const demoPassword = "Demo12345!";
  const demoStoreName = "Demo Store";
  const demoStoreSlug = "demo-store";

  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Demo Owner",
      passwordHash,
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: demoStoreSlug },
    update: { name: demoStoreName },
    create: {
      name: demoStoreName,
      slug: demoStoreSlug,
      settings: {
        create: {
          primaryColor: "#2563eb",
          fontFamily: "system-ui",
          layoutStyle: "GRID",
          enableArabic: true,
          defaultLocale: "EN",
        },
      },
      stats: {
        create: {},
      },
    },
  });

  await prisma.storeMembership.upsert({
    where: { storeId_userId: { storeId: store.id, userId: user.id } },
    update: { role: StoreRole.OWNER },
    create: { storeId: store.id, userId: user.id, role: StoreRole.OWNER },
  });

  const category = await prisma.category.upsert({
    where: { storeId_slug: { storeId: store.id, slug: "featured" } },
    update: { name: "Featured" },
    create: { storeId: store.id, name: "Featured", slug: "featured" },
  });

  const tag = await prisma.tag.upsert({
    where: { storeId_slug: { storeId: store.id, slug: "sale" } },
    update: { name: "Sale" },
    create: { storeId: store.id, name: "Sale", slug: "sale" },
  });

  const products = [
    {
      name: "Wireless Headphones",
      sku: "WH-001",
      originalPrice: 12999,
      discountedPrice: 9999,
      discountEnabled: true,
      currency: "USD",
      stockQty: 25,
      isActive: true,
    },
    {
      name: "Smart Watch",
      sku: "SW-002",
      originalPrice: 8999,
      discountedPrice: null,
      discountEnabled: false,
      currency: "USD",
      stockQty: 15,
      isActive: true,
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({
      where: { storeId: store.id, sku: p.sku },
      select: { id: true, name: true },
    });

    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: p.name,
            description: "Seed product description.",
            specs: "Seed specs.",
            currency: p.currency,
            originalPrice: p.originalPrice,
            discountedPrice: p.discountedPrice,
            discountEnabled: p.discountEnabled,
            stockQty: p.stockQty,
            isActive: p.isActive,
            categoryId: category.id,
          },
        })
      : await prisma.product.create({
          data: {
            storeId: store.id,
            name: p.name,
            sku: p.sku,
            description: "Seed product description.",
            specs: "Seed specs.",
            currency: p.currency,
            originalPrice: p.originalPrice,
            discountedPrice: p.discountedPrice,
            discountEnabled: p.discountEnabled,
            stockQty: p.stockQty,
            isActive: p.isActive,
            categoryId: category.id,
            tags: { create: [{ tagId: tag.id }] },
          },
        });

    console.log(`Seeded product: ${product.name}`);
  }

  console.log("\nSeed complete:");
  console.log(`- Demo owner: ${demoEmail} / ${demoPassword}`);
  console.log(`- Demo store slug: ${demoStoreSlug}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


