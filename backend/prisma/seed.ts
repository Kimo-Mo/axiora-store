import bcrypt from "bcrypt";
import { Prisma, PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";

const prisma = new PrismaClient();

const decimal = (value: number | string): Prisma.Decimal =>
  new Prisma.Decimal(value);

interface SeedCategory {
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  sortOrder: number;
  children: Array<{ nameAr: string; nameEn: string; slug: string; sortOrder: number }>;
}

const CATEGORIES: SeedCategory[] = [
  {
    nameAr: "الموبايلات والتابلت",
    nameEn: "Mobiles & Tablets",
    slug: "mobiles-tablets",
    descriptionAr: "أحدث الهواتف الذكية والأجهزة اللوحية",
    descriptionEn: "Latest smartphones and tablets",
    sortOrder: 1,
    children: [
      { nameAr: "هواتف ذكية", nameEn: "Smartphones", slug: "smartphones", sortOrder: 1 },
      { nameAr: "تابلت", nameEn: "Tablets", slug: "tablets", sortOrder: 2 },
    ],
  },
  {
    nameAr: "إكسسوارات الموبايل",
    nameEn: "Mobile Accessories",
    slug: "mobile-accessories",
    descriptionAr: "جرابات وشواحن وكابلات",
    descriptionEn: "Cases, chargers and cables",
    sortOrder: 2,
    children: [
      { nameAr: "جرابات وحماية", nameEn: "Cases & Covers", slug: "cases-covers", sortOrder: 1 },
      { nameAr: "شواحن وكابلات", nameEn: "Chargers & Cables", slug: "chargers-cables", sortOrder: 2 },
    ],
  },
  {
    nameAr: "الصوتيات",
    nameEn: "Audio",
    slug: "audio",
    descriptionAr: "سماعات رأس ومكبرات صوت",
    descriptionEn: "Headphones and speakers",
    sortOrder: 3,
    children: [
      { nameAr: "سماعات رأس", nameEn: "Headphones", slug: "headphones", sortOrder: 1 },
      { nameAr: "مكبرات صوت", nameEn: "Speakers", slug: "speakers", sortOrder: 2 },
    ],
  },
  {
    nameAr: "الأجهزة القابلة للارتداء",
    nameEn: "Wearables",
    slug: "wearables",
    descriptionAr: "ساعات ذكية وأساور رياضية",
    descriptionEn: "Smartwatches and fitness bands",
    sortOrder: 4,
    children: [
      { nameAr: "ساعات ذكية", nameEn: "Smartwatches", slug: "smartwatches", sortOrder: 1 },
      { nameAr: "أساور رياضية", nameEn: "Fitness Bands", slug: "fitness-bands", sortOrder: 2 },
    ],
  },
  {
    nameAr: "إكسسوارات السيارات",
    nameEn: "Car Accessories",
    slug: "car-accessories",
    descriptionAr: "شواحن سيارة وحوامل",
    descriptionEn: "Car chargers and holders",
    sortOrder: 5,
    children: [
      { nameAr: "شواحن سيارة", nameEn: "Car Chargers", slug: "car-chargers", sortOrder: 1 },
      { nameAr: "حوامل موبايل", nameEn: "Car Holders", slug: "car-holders", sortOrder: 2 },
    ],
  },
  {
    nameAr: "إلكترونيات أخرى",
    nameEn: "Other Electronics",
    slug: "other-electronics",
    descriptionAr: "شاشات وإكسسوارات كمبيوتر",
    descriptionEn: "TVs and computer accessories",
    sortOrder: 6,
    children: [
      { nameAr: "شاشات", nameEn: "TVs", slug: "tvs", sortOrder: 1 },
      { nameAr: "إكسسوارات كمبيوتر", nameEn: "Computer Accessories", slug: "computer-accessories", sortOrder: 2 },
    ],
  },
];

const BRANDS = [
  { nameAr: "آبل", nameEn: "Apple", slug: "apple" },
  { nameAr: "سامسونج", nameEn: "Samsung", slug: "samsung" },
  { nameAr: "سوني", nameEn: "Sony", slug: "sony" },
  { nameAr: "أنكر", nameEn: "Anker", slug: "anker" },
  { nameAr: "جي بي إل", nameEn: "JBL", slug: "jbl" },
  { nameAr: "شاومي", nameEn: "Xiaomi", slug: "xiaomi" },
];

interface SeedProduct {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  brandSlug: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  image: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  specs: Array<{ keyAr: string; keyEn: string; valueAr: string; valueEn: string }>;
}

const PRODUCTS: SeedProduct[] = [
  {
    nameAr: "آيفون 15 برو ماكس 256 جيجا",
    nameEn: "iPhone 15 Pro Max 256GB",
    slug: "iphone-15-pro-max-256gb",
    sku: "APL-IP15PM-256",
    shortDescriptionAr: "تيتانيوم، شاشة 6.7 بوصة، شريحة A17 Pro",
    shortDescriptionEn: "Titanium, 6.7-inch display, A17 Pro chip",
    brandSlug: "apple",
    categorySlug: "smartphones",
    price: 79999,
    compareAtPrice: 84999,
    stockQuantity: 25,
    image: "https://res.cloudinary.com/demo/image/upload/iphone-15-pro-max.jpg",
    isFeatured: true,
    isBestSeller: true,
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "6.7 بوصة", valueEn: "6.7 inch" },
      { keyAr: "التخزين", keyEn: "Storage", valueAr: "256 جيجابايت", valueEn: "256GB" },
    ],
  },
  {
    nameAr: "سامسونج جالاكسي S24 ألترا 512 جيجا",
    nameEn: "Samsung Galaxy S24 Ultra 512GB",
    slug: "samsung-galaxy-s24-ultra-512gb",
    sku: "SAM-S24U-512",
    shortDescriptionAr: "قلم S Pen، كاميرا 200 ميجابكسل، ذكاء اصطناعي",
    shortDescriptionEn: "S Pen, 200MP camera, Galaxy AI",
    brandSlug: "samsung",
    categorySlug: "smartphones",
    price: 72999,
    stockQuantity: 30,
    image: "https://res.cloudinary.com/demo/image/upload/galaxy-s24-ultra.jpg",
    isFeatured: true,
    isBestSeller: true,
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "6.8 بوصة", valueEn: "6.8 inch" },
      { keyAr: "التخزين", keyEn: "Storage", valueAr: "512 جيجابايت", valueEn: "512GB" },
    ],
  },
  {
    nameAr: "شاومي ريدمي نوت 13 برو 256 جيجا",
    nameEn: "Xiaomi Redmi Note 13 Pro 256GB",
    slug: "xiaomi-redmi-note-13-pro-256gb",
    sku: "XIA-RN13P-256",
    shortDescriptionAr: "كاميرا 200 ميجابكسل، شحن سريع 67 واط",
    shortDescriptionEn: "200MP camera, 67W fast charging",
    brandSlug: "xiaomi",
    categorySlug: "smartphones",
    price: 14999,
    compareAtPrice: 16999,
    stockQuantity: 50,
    image: "https://res.cloudinary.com/demo/image/upload/redmi-note-13-pro.jpg",
    isNew: true,
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "6.67 بوصة", valueEn: "6.67 inch" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "5100 مللي أمبير", valueEn: "5100 mAh" },
    ],
  },
  {
    nameAr: "سوني WH-1000XM5 بخاصية إلغاء الضوضاء",
    nameEn: "Sony WH-1000XM5 Noise Cancelling",
    slug: "sony-wh-1000xm5",
    sku: "SNY-WH1000XM5-BLK",
    shortDescriptionAr: "إلغاء ضوضاء رائد، بطارية 30 ساعة",
    shortDescriptionEn: "Industry-leading noise cancelling, 30h battery",
    brandSlug: "sony",
    categorySlug: "headphones",
    price: 18999,
    stockQuantity: 40,
    image: "https://res.cloudinary.com/demo/image/upload/sony-wh1000xm5.jpg",
    isFeatured: true,
    specs: [
      { keyAr: "نوع الاتصال", keyEn: "Connectivity", valueAr: "بلوتوث 5.2", valueEn: "Bluetooth 5.2" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "30 ساعة", valueEn: "30 hours" },
    ],
  },
  {
    nameAr: "آبل إيربودز برو الجيل الثاني",
    nameEn: "Apple AirPods Pro 2nd Generation",
    slug: "apple-airpods-pro-2",
    sku: "APL-APP2-USBC",
    shortDescriptionAr: "إلغاء ضوضاء مضاعف، علبة MagSafe",
    shortDescriptionEn: "2x noise cancelling, MagSafe case",
    brandSlug: "apple",
    categorySlug: "headphones",
    price: 12999,
    stockQuantity: 60,
    image: "https://res.cloudinary.com/demo/image/upload/airpods-pro-2.jpg",
    isBestSeller: true,
    specs: [
      { keyAr: "الشريحة", keyEn: "Chip", valueAr: "شريحة H2", valueEn: "H2 chip" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "IP54", valueEn: "IP54" },
    ],
  },
  {
    nameAr: "جي بي إل فليب 6 بلوتوث",
    nameEn: "JBL Flip 6 Bluetooth Speaker",
    slug: "jbl-flip-6",
    sku: "JBL-FLIP6-BLK",
    shortDescriptionAr: "صوت قوي، مقاومة للماء IP67",
    shortDescriptionEn: "Powerful sound, IP67 waterproof",
    brandSlug: "jbl",
    categorySlug: "speakers",
    price: 7499,
    compareAtPrice: 8999,
    stockQuantity: 45,
    image: "https://res.cloudinary.com/demo/image/upload/jbl-flip-6.jpg",
    specs: [
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "12 ساعة", valueEn: "12 hours" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "IP67", valueEn: "IP67" },
    ],
  },
  {
    nameAr: "آبل واتش سيريس 9 مقاس 45 مم",
    nameEn: "Apple Watch Series 9 GPS 45mm",
    slug: "apple-watch-series-9-45mm",
    sku: "APL-AWS9-45",
    shortDescriptionAr: "شريحة S9، إيماءة النقر المزدوج",
    shortDescriptionEn: "S9 chip, Double Tap gesture",
    brandSlug: "apple",
    categorySlug: "smartwatches",
    price: 24999,
    stockQuantity: 35,
    image: "https://res.cloudinary.com/demo/image/upload/apple-watch-s9.jpg",
    isNew: true,
    isFeatured: true,
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Display", valueAr: "45 مم", valueEn: "45mm" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "50 متر", valueEn: "50m" },
    ],
  },
  {
    nameAr: "أنكر باور بانك 20000 مللي أمبير",
    nameEn: "Anker PowerCore 20000mAh Power Bank",
    slug: "anker-powercore-20000",
    sku: "ANK-PC20K-BLK",
    shortDescriptionAr: "شحن سريع 22.5 واط، منفذا USB",
    shortDescriptionEn: "22.5W fast charging, dual USB ports",
    brandSlug: "anker",
    categorySlug: "chargers-cables",
    price: 2499,
    stockQuantity: 120,
    image: "https://res.cloudinary.com/demo/image/upload/anker-powercore.jpg",
    isBestSeller: true,
    specs: [
      { keyAr: "السعة", keyEn: "Capacity", valueAr: "20000 مللي أمبير", valueEn: "20000 mAh" },
      { keyAr: "قدرة الشحن", keyEn: "Output", valueAr: "22.5 واط", valueEn: "22.5W" },
    ],
  },
  {
    nameAr: "شاحن سيارة أنكر 53 واط بمنفذين",
    nameEn: "Anker 53W Dual-Port Car Charger",
    slug: "anker-53w-car-charger",
    sku: "ANK-CC53W-DUAL",
    shortDescriptionAr: "شحن سريع للسيارة بمنفذي USB-C و USB-A",
    shortDescriptionEn: "Fast car charging with USB-C and USB-A",
    brandSlug: "anker",
    categorySlug: "car-chargers",
    price: 899,
    stockQuantity: 200,
    image: "https://res.cloudinary.com/demo/image/upload/anker-car-charger.jpg",
    specs: [
      { keyAr: "قدرة الشحن", keyEn: "Output", valueAr: "53 واط", valueEn: "53W" },
      { keyAr: "المنافذ", keyEn: "Ports", valueAr: "USB-C + USB-A", valueEn: "USB-C + USB-A" },
    ],
  },
  {
    nameAr: "شاشة سامسونج 55 بوصة كريستال 4K",
    nameEn: 'Samsung 55" Crystal 4K Smart TV',
    slug: "samsung-55-crystal-4k-tv",
    sku: "SAM-55CU7000-4K",
    shortDescriptionAr: "دقة 4K، نظام تايزن الذكي",
    shortDescriptionEn: "4K UHD, Tizen smart platform",
    brandSlug: "samsung",
    categorySlug: "tvs",
    price: 32999,
    compareAtPrice: 36999,
    stockQuantity: 12,
    image: "https://res.cloudinary.com/demo/image/upload/samsung-55-4k.jpg",
    isFeatured: true,
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "55 بوصة", valueEn: "55 inch" },
      { keyAr: "الدقة", keyEn: "Resolution", valueAr: "4K UHD", valueEn: "4K UHD" },
    ],
  },
  {
    nameAr: "ماوس لوجيتك MX Master 3S",
    nameEn: "Logitech MX Master 3S Mouse",
    slug: "logitech-mx-master-3s",
    sku: "LOG-MXM3S-GRF",
    shortDescriptionAr: "تتبع دقيق 8000 DPI، تمرير هادئ",
    shortDescriptionEn: "8K DPI tracking, quiet scrolling",
    brandSlug: "sony",
    categorySlug: "computer-accessories",
    price: 5999,
    stockQuantity: 70,
    image: "https://res.cloudinary.com/demo/image/upload/mx-master-3s.jpg",
    specs: [
      { keyAr: "الدقة", keyEn: "DPI", valueAr: "8000 DPI", valueEn: "8000 DPI" },
      { keyAr: "الاتصال", keyEn: "Connectivity", valueAr: "بلوتوث + USB", valueEn: "Bluetooth + USB" },
    ],
  },
  {
    nameAr: "حامل موبايل مغناطيسي للسيارة",
    nameEn: "Magnetic Car Phone Holder",
    slug: "magnetic-car-phone-holder",
    sku: "ANK-CARMAG-HOLD",
    shortDescriptionAr: "تثبيت مغناطيسي قوي لفتحة التكييف",
    shortDescriptionEn: "Strong magnetic air-vent mount",
    brandSlug: "anker",
    categorySlug: "car-holders",
    price: 549,
    stockQuantity: 150,
    image: "https://res.cloudinary.com/demo/image/upload/car-holder.jpg",
    specs: [
      { keyAr: "التثبيت", keyEn: "Mount", valueAr: "فتحة التكييف", valueEn: "Air vent" },
      { keyAr: "التوافق", keyEn: "Compatibility", valueAr: "جميع الهواتف", valueEn: "Universal" },
    ],
  },
];

const SHIPPING_ZONES = [
  { governorate: "Cairo", zone: "Zone A", deliveryFee: 50, estimatedDays: 2 },
  { governorate: "Giza", zone: "Zone A", deliveryFee: 55, estimatedDays: 2 },
  { governorate: "Alexandria", zone: "Zone B", deliveryFee: 65, estimatedDays: 3 },
];

async function main(): Promise<void> {
  // 1. Admin user (idempotent via email upsert)
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { passwordHash, role: "ADMIN" },
    create: {
      email: env.ADMIN_EMAIL,
      username: "admin",
      fullName: "Axiora Admin",
      passwordHash,
      role: "ADMIN",
      phoneVerified: true,
    },
  });
  // eslint-disable-next-line no-console
  console.log("Seeded admin user:", env.ADMIN_EMAIL);

  // 2. Categories (top-level + children, idempotent via slug upsert)
  for (const category of CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        nameAr: category.nameAr,
        nameEn: category.nameEn,
        slug: category.slug,
        descriptionAr: category.descriptionAr,
        descriptionEn: category.descriptionEn,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });

    for (const child of category.children) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          nameAr: child.nameAr,
          nameEn: child.nameEn,
          parentId: parent.id,
          sortOrder: child.sortOrder,
          isActive: true,
        },
        create: {
          nameAr: child.nameAr,
          nameEn: child.nameEn,
          slug: child.slug,
          parentId: parent.id,
          sortOrder: child.sortOrder,
          isActive: true,
        },
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log("Seeded categories");

  // 3. Brands (idempotent via slug upsert)
  for (const brand of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { nameAr: brand.nameAr, nameEn: brand.nameEn, isActive: true },
      create: { nameAr: brand.nameAr, nameEn: brand.nameEn, slug: brand.slug, isActive: true },
    });
  }
  // eslint-disable-next-line no-console
  console.log("Seeded brands");

  // 4. Products with default variants, images, specifications
  for (const product of PRODUCTS) {
    const brand = await prisma.brand.findUnique({ where: { slug: product.brandSlug } });
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
    if (!brand || !category) {
      throw new Error(`Missing brand or category for product ${product.slug}`);
    }

    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        shortDescriptionAr: product.shortDescriptionAr,
        shortDescriptionEn: product.shortDescriptionEn,
        brandId: brand.id,
        categoryId: category.id,
        isActive: true,
        isFeatured: product.isFeatured ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isNew: product.isNew ?? false,
      },
      create: {
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        slug: product.slug,
        sku: product.sku,
        shortDescriptionAr: product.shortDescriptionAr,
        shortDescriptionEn: product.shortDescriptionEn,
        brandId: brand.id,
        categoryId: category.id,
        currency: "EGP",
        isActive: true,
        isFeatured: product.isFeatured ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isNew: product.isNew ?? false,
      },
    });

    await prisma.productVariant.upsert({
      where: { sku: product.sku },
      update: {
        price: decimal(product.price),
        compareAtPrice: product.compareAtPrice !== undefined ? decimal(product.compareAtPrice) : null,
        stockQuantity: product.stockQuantity,
        isDefault: true,
        isActive: true,
      },
      create: {
        productId: created.id,
        sku: product.sku,
        price: decimal(product.price),
        compareAtPrice: product.compareAtPrice !== undefined ? decimal(product.compareAtPrice) : null,
        stockQuantity: product.stockQuantity,
        reservedQuantity: 0,
        isDefault: true,
        isActive: true,
      },
    });

    // Images: reset to a single primary image for idempotency
    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    await prisma.productImage.create({
      data: {
        productId: created.id,
        url: product.image,
        alt: product.nameEn,
        sortOrder: 0,
        isPrimary: true,
      },
    });

    // Specifications: reset for idempotency
    await prisma.productSpecification.deleteMany({ where: { productId: created.id } });
    await prisma.productSpecification.createMany({
      data: product.specs.map((spec, index) => ({
        productId: created.id,
        keyAr: spec.keyAr,
        keyEn: spec.keyEn,
        valueAr: spec.valueAr,
        valueEn: spec.valueEn,
        sortOrder: index,
      })),
    });
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${PRODUCTS.length} products`);

  // 5. Shipping zones (idempotent: update existing governorate rows or create)
  for (const zone of SHIPPING_ZONES) {
    const existing = await prisma.shippingZone.findFirst({
      where: { governorate: zone.governorate },
    });
    if (existing) {
      await prisma.shippingZone.update({
        where: { id: existing.id },
        data: {
          zone: zone.zone,
          deliveryFee: decimal(zone.deliveryFee),
          estimatedDays: zone.estimatedDays,
          isActive: true,
        },
      });
    } else {
      await prisma.shippingZone.create({
        data: {
          governorate: zone.governorate,
          zone: zone.zone,
          deliveryFee: decimal(zone.deliveryFee),
          estimatedDays: zone.estimatedDays,
          isActive: true,
        },
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log("Seeded shipping zones");

  // 6. Application settings (idempotent via key upsert)
  await prisma.setting.upsert({
    where: { key: "COD_FEE" },
    update: { value: { amount: 30 } },
    create: { key: "COD_FEE", value: { amount: 30 } },
  });
  await prisma.setting.upsert({
    where: { key: "FREE_SHIPPING_THRESHOLD" },
    update: { value: { amount: 1000 } },
    create: { key: "FREE_SHIPPING_THRESHOLD", value: { amount: 1000 } },
  });
  await prisma.setting.upsert({
    where: { key: "LOW_STOCK_THRESHOLD" },
    update: { value: { quantity: 5 } },
    create: { key: "LOW_STOCK_THRESHOLD", value: { quantity: 5 } },
  });
  // eslint-disable-next-line no-console
  console.log("Seeded settings");
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
