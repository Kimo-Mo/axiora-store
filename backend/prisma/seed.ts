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
  { nameAr: "لوجيتك", nameEn: "Logitech", slug: "logitech" },
];

/**
 * Variant dimensions. Seeded as shared rows so the storefront selector reads
 * "اللون / Color" and "سعة التخزين / Storage" rather than a per-product label.
 */
const ATTRIBUTES = [
  { slug: "color", nameAr: "اللون", nameEn: "Color" },
  { slug: "storage", nameAr: "سعة التخزين", nameEn: "Storage" },
  { slug: "size", nameAr: "المقاس", nameEn: "Size" },
];

interface SeedVariant {
  sku: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  /** Deliberately spans the three public bands: >5 hides, 1-5 shows, 0 blocks. */
  stockQuantity: number;
  isDefault?: boolean;
  attributes: Array<{ slug: string; valueAr: string; valueEn: string }>;
}

interface SeedProduct {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  descriptionAr: string;
  descriptionEn: string;
  warranty: string;
  brandSlug: string;
  categorySlug: string;
  image: string;
  /** Additional gallery images; the first is always primary. */
  gallery?: string[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  variants: SeedVariant[];
  specs: Array<{ keyAr: string; keyEn: string; valueAr: string; valueEn: string }>;
}

const PRODUCTS: SeedProduct[] = [
  {
    nameAr: "آيفون 15 برو ماكس",
    nameEn: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    sku: "APL-IP15PM-MASTER",
    shortDescriptionAr: "هيكل تيتانيوم، شاشة 6.7 بوصة، شريحة A17 Pro",
    shortDescriptionEn: "Titanium design, 6.7-inch display, A17 Pro chip",
    descriptionAr:
      "آيفون 15 برو ماكس يحمل شريحة A17 Pro بحجم 3 نانومتر، وهيكلاً من التيتانيوم Degree 5، كاميرا ثلاثية 48 ميجابكسل، ونظام كاميرا Action للتسجيل حتى 120 إطاراً في الثانية. البطارية تدوم طوال اليوم مع الشحن السريع عبر USB-C.",
    descriptionEn:
      "iPhone 15 Pro Max pairs the 3nm A17 Pro chip with a Grade 5 titanium frame, a 48MP triple-camera system, and Action mode for 120fps capture. The all-day battery charges fast over USB-C.",
    warranty: "ضمان أبل الرسمي لمدة عام / 1 Year Apple Official Warranty",
    brandSlug: "apple",
    categorySlug: "smartphones",
    image: "https://res.cloudinary.com/demo/image/upload/iphone-15-pro-max.jpg",
    gallery: [
      "https://res.cloudinary.com/demo/image/upload/iphone-15-pro-max-back.jpg",
      "https://res.cloudinary.com/demo/image/upload/iphone-15-pro-max-camera.jpg",
    ],
    isFeatured: true,
    isBestSeller: true,
    variants: [
      {
        sku: "APL-IP15PM-256-NAT",
        price: 79999,
        compareAtPrice: 84999,
        costPrice: 72000,
        stockQuantity: 25,
        isDefault: true,
        attributes: [
          { slug: "color", valueAr: "تيتانيوم طبيعي", valueEn: "Natural Titanium" },
          { slug: "storage", valueAr: "256 جيجابايت", valueEn: "256 GB" },
        ],
      },
      {
        sku: "APL-IP15PM-512-BLU",
        price: 91999,
        costPrice: 84000,
        stockQuantity: 12,
        attributes: [
          { slug: "color", valueAr: "تيتانيوم أزرق", valueEn: "Blue Titanium" },
          { slug: "storage", valueAr: "512 جيجابايت", valueEn: "512 GB" },
        ],
      },
      {
        // Low-stock band: the storefront shows "Only 3 left!" here.
        sku: "APL-IP15PM-256-BLK",
        price: 79999,
        stockQuantity: 3,
        attributes: [
          { slug: "color", valueAr: "تيتانيوم أسود", valueEn: "Black Titanium" },
          { slug: "storage", valueAr: "256 جيجابايت", valueEn: "256 GB" },
        ],
      },
      {
        // Out-of-stock band: Add to Cart is disabled for this SKU.
        sku: "APL-IP15PM-1TB-WHT",
        price: 109999,
        stockQuantity: 0,
        attributes: [
          { slug: "color", valueAr: "تيتانيوم أبيض", valueEn: "White Titanium" },
          { slug: "storage", valueAr: "1 تيرابايت", valueEn: "1 TB" },
        ],
      },
    ],
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "6.7 بوصة Super Retina XDR", valueEn: "6.7-inch Super Retina XDR" },
      { keyAr: "المعالج", keyEn: "Processor", valueAr: "شريحة A17 Pro", valueEn: "A17 Pro chip" },
      { keyAr: "الكاميرا", keyEn: "Camera", valueAr: "48 + 12 + 12 ميجابكسل", valueEn: "48 + 12 + 12 MP" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "4441 مللي أمبير", valueEn: "4441 mAh" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "IP68", valueEn: "IP68" },
    ],
  },
  {
    nameAr: "سامسونج جالاكسي S24 ألترا",
    nameEn: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    sku: "SAM-S24U-MASTER",
    shortDescriptionAr: "قلم S Pen، كاميرا 200 ميجابكسل، Galaxy AI",
    shortDescriptionEn: "S Pen, 200MP camera, Galaxy AI",
    descriptionAr:
      "جالاكسي S24 ألترا يقود فئته الرائدة: شاشة 6.8 بوصة بمعدل تحديث 120 هرتز، كاميرا رئيسية 200 ميجابكسل بتقريب بصري 5x، وقلم S Pen مدمج. يجمع Galaxy AI على الجهاز بين الترجمة الفورية وتلخيص النصوص.",
    descriptionEn:
      "The Galaxy S24 Ultra is the class leader: a 6.8-inch 120Hz display, a 200MP main camera with 5x optical zoom, and the built-in S Pen. On-device Galaxy AI handles live translation and text summarisation.",
    warranty: "ضمان سامسونج الرسمي لمدة عام / 1 Year Samsung Official Warranty",
    brandSlug: "samsung",
    categorySlug: "smartphones",
    image: "https://res.cloudinary.com/demo/image/upload/galaxy-s24-ultra.jpg",
    gallery: ["https://res.cloudinary.com/demo/image/upload/galaxy-s24-ultra-pen.jpg"],
    isFeatured: true,
    isBestSeller: true,
    variants: [
      {
        sku: "SAM-S24U-256-BLK",
        price: 72999,
        costPrice: 65000,
        stockQuantity: 30,
        isDefault: true,
        attributes: [
          { slug: "color", valueAr: "أسود تيتانيوم", valueEn: "Titanium Black" },
          { slug: "storage", valueAr: "256 جيجابايت", valueEn: "256 GB" },
        ],
      },
      {
        sku: "SAM-S24U-512-VIO",
        price: 80999,
        compareAtPrice: 86999,
        costPrice: 74000,
        stockQuantity: 5,
        attributes: [
          { slug: "color", valueAr: "بنفسجي تيتانيوم", valueEn: "Titanium Violet" },
          { slug: "storage", valueAr: "512 جيجابايت", valueEn: "512 GB" },
        ],
      },
    ],
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "6.8 بوصة Dynamic AMOLED 2X", valueEn: "6.8-inch Dynamic AMOLED 2X" },
      { keyAr: "المعالج", keyEn: "Processor", valueAr: "Snapdragon 8 Gen 3", valueEn: "Snapdragon 8 Gen 3" },
      { keyAr: "الكاميرا", keyEn: "Camera", valueAr: "200 ميجابكسل", valueEn: "200 MP" },
      { keyAr: "قلم", keyEn: "Stylus", valueAr: "S Pen مدمج", valueEn: "Built-in S Pen" },
    ],
  },
  {
    nameAr: "شاومي ريدمي نوت 13 برو",
    nameEn: "Xiaomi Redmi Note 13 Pro",
    slug: "xiaomi-redmi-note-13-pro",
    sku: "XIA-RN13P-MASTER",
    shortDescriptionAr: "كاميرا 200 ميجابكسل، شحن سريع 67 واط",
    shortDescriptionEn: "200MP camera, 67W fast charging",
    descriptionAr:
      "ريدمي نوت 13 برو يقدّم كاميرا 200 ميجابكسل وشحناً سريعاً بقدرة 67 واط، مع شاشة AMOLED بمعدل تحديث 120 هرتز وبطارية 5100 مللي أمبير. قيمة استثنائية في فئة الفئة المتوسطة.",
    descriptionEn:
      "The Redmi Note 13 Pro delivers a 200MP camera and 67W charging on a 120Hz AMOLED panel, backed by a 5100 mAh battery. Genuinely strong value at the mid tier.",
    warranty: "ضمان شاومي لمدة 18 شهراً / 18 Month Xiaomi Warranty",
    brandSlug: "xiaomi",
    categorySlug: "smartphones",
    image: "https://res.cloudinary.com/demo/image/upload/redmi-note-13-pro.jpg",
    isNew: true,
    variants: [
      {
        sku: "XIA-RN13P-256-BLU",
        price: 14999,
        compareAtPrice: 16999,
        costPrice: 12500,
        stockQuantity: 50,
        isDefault: true,
        attributes: [
          { slug: "color", valueAr: "أزرق", valueEn: "Blue" },
          { slug: "storage", valueAr: "256 جيجابايت", valueEn: "256 GB" },
        ],
      },
      {
        sku: "XIA-RN13P-512-BLK",
        price: 17499,
        costPrice: 15000,
        stockQuantity: 2,
        attributes: [
          { slug: "color", valueAr: "أسود", valueEn: "Black" },
          { slug: "storage", valueAr: "512 جيجابايت", valueEn: "512 GB" },
        ],
      },
    ],
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "6.67 بوصة AMOLED", valueEn: "6.67-inch AMOLED" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "5100 مللي أمبير", valueEn: "5100 mAh" },
      { keyAr: "الشحن", keyEn: "Charging", valueAr: "67 واط سلكي", valueEn: "67W wired" },
    ],
  },
  {
    nameAr: "سوني WH-1000XM5",
    nameEn: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    sku: "SNY-WH1000XM5-MASTER",
    shortDescriptionAr: "إلغاء ضوضاء رائد، بطارية 30 ساعة",
    shortDescriptionEn: "Industry-leading noise cancelling, 30h battery",
    descriptionAr:
      "سماعة WH-1000XM5 بثمانية ميكروفونات وإلغاء ضوضاء تكيفي يتكيف مع surroundings كل خطوة. تدعم LDAC و Multipoint، مع بطارية تدوم 30 ساعة والشحن السريع الذي يعطي 3 ساعات تشغيل في 3 دقائق.",
    descriptionEn:
      "The WH-1000XM5 pairs eight microphones with adaptive noise cancelling that adjusts to your surroundings step by step. LDAC and Multipoint are supported, the battery runs 30 hours, and a 3-minute charge yields 3 hours of playback.",
    warranty: "ضمان سوني لمدة عام / 1 Year Sony Warranty",
    brandSlug: "sony",
    categorySlug: "headphones",
    image: "https://res.cloudinary.com/demo/image/upload/sony-wh1000xm5.jpg",
    gallery: ["https://res.cloudinary.com/demo/image/upload/sony-wh1000xm5-folded.jpg"],
    isFeatured: true,
    variants: [
      {
        sku: "SNY-WH1000XM5-BLK",
        price: 18999,
        costPrice: 16000,
        stockQuantity: 40,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "أسود", valueEn: "Black" }],
      },
      {
        sku: "SNY-WH1000XM5-SLV",
        price: 18999,
        compareAtPrice: 21499,
        costPrice: 16000,
        stockQuantity: 4,
        attributes: [{ slug: "color", valueAr: "فضي", valueEn: "Silver" }],
      },
    ],
    specs: [
      { keyAr: "نوع الاتصال", keyEn: "Connectivity", valueAr: "بلوتوث 5.2", valueEn: "Bluetooth 5.2" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "30 ساعة", valueEn: "30 hours" },
      { keyAr: "الوزن", keyEn: "Weight", valueAr: "250 جرام", valueEn: "250 g" },
    ],
  },
  {
    nameAr: "آبل إيربودز برو الجيل الثاني",
    nameEn: "Apple AirPods Pro 2nd Generation",
    slug: "apple-airpods-pro-2",
    sku: "APL-APP2-MASTER",
    shortDescriptionAr: "إلغاء ضوضاء مضاعف، علبة MagSafe",
    shortDescriptionEn: "2x noise cancelling, MagSafe case",
    descriptionAr:
      "إيربودز برو الجيل الثاني بشريحة H2 التي تقدم ضعف capabilities إلغاء الضوضاء السابقة، مع عزل الصوت وسمة التكيف في الوقت الحقيقي. علبة MagSafe تتcharges لاسلكياً عبر Qi.",
    descriptionEn:
      "AirPods Pro (2nd generation) run on the H2 chip, delivering twice the noise cancelling of the previous generation, plus Adaptive Audio and Conversation Awareness. The MagSafe case charges wirelessly over Qi.",
    warranty: "ضمان أبل الرسمي لمدة عام / 1 Year Apple Official Warranty",
    brandSlug: "apple",
    categorySlug: "headphones",
    image: "https://res.cloudinary.com/demo/image/upload/airpods-pro-2.jpg",
    isBestSeller: true,
    variants: [
      {
        sku: "APL-APP2-USBC",
        price: 12999,
        costPrice: 11000,
        stockQuantity: 60,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "أبيض", valueEn: "White" }],
      },
    ],
    specs: [
      { keyAr: "الشريحة", keyEn: "Chip", valueAr: "شريحة H2", valueEn: "H2 chip" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "IP54", valueEn: "IP54" },
      { keyAr: "عمر البطارية", keyEn: "Battery Life", valueAr: "30 ساعة مع العلبة", valueEn: "30 hours with case" },
    ],
  },
  {
    nameAr: "جي بي إل فليب 6",
    nameEn: "JBL Flip 6",
    slug: "jbl-flip-6",
    sku: "JBL-FLIP6-MASTER",
    shortDescriptionAr: "صوت قوي، مقاومة للماء IP67",
    shortDescriptionEn: "Powerful sound, IP67 waterproof",
    descriptionAr:
      "مكبر JBL فليب 6 بصوت 30 واط ومقاومة IP67 للماء والغبار، مع خاصية PartyBoost لربط عدة مكبرات معاً. يعمل 12 ساعة على شحنة واحدة.",
    descriptionEn:
      "The JBL Flip 6 delivers 30W of sound in an IP67 dust- and waterproof body, with PartyBoost for linking multiple speakers. Twelve hours of playback per charge.",
    warranty: "ضمان جي بي إل لمدة عام / 1 Year JBL Warranty",
    brandSlug: "jbl",
    categorySlug: "speakers",
    image: "https://res.cloudinary.com/demo/image/upload/jbl-flip-6.jpg",
    variants: [
      {
        sku: "JBL-FLIP6-BLK",
        price: 7499,
        compareAtPrice: 8999,
        costPrice: 6000,
        stockQuantity: 45,
        isDefault: true,
        attributes: [
          { slug: "color", valueAr: "أسود", valueEn: "Black" },
          { slug: "size", valueAr: "متوسط", valueEn: "Medium" },
        ],
      },
      {
        sku: "JBL-FLIP6-BLU",
        price: 7499,
        stockQuantity: 6,
        attributes: [
          { slug: "color", valueAr: "أزرق", valueEn: "Blue" },
          { slug: "size", valueAr: "متوسط", valueEn: "Medium" },
        ],
      },
    ],
    specs: [
      { keyAr: "القدرة", keyEn: "Output", valueAr: "30 واط", valueEn: "30 W" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "12 ساعة", valueEn: "12 hours" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "IP67", valueEn: "IP67" },
    ],
  },
  {
    nameAr: "آبل واتش سيريس 9",
    nameEn: "Apple Watch Series 9",
    slug: "apple-watch-series-9",
    sku: "APL-AWS9-MASTER",
    shortDescriptionAr: "شريحة S9، إيماءة النقر المزدوج",
    shortDescriptionEn: "S9 chip, Double Tap gesture",
    descriptionAr:
      "ساعة آبلWatch سيريس 9 بشريحة S9 المتقدمة وإيماءة النقر المزدوج التي تفتحapplications بأصبع واحد. مقاومة للماء حتى 50 متراً، وأكثر من 1000 تتبع صحي.",
    descriptionEn:
      "The Apple Watch Series 9 pairs the advanced S9 chip with the Double Tap gesture that opens an app with a single finger tap. Water resistant to 50m, with over 1,000 health data points tracked.",
    warranty: "ضمان أبل الرسمي لمدة عام / 1 Year Apple Official Warranty",
    brandSlug: "apple",
    categorySlug: "smartwatches",
    image: "https://res.cloudinary.com/demo/image/upload/apple-watch-s9.jpg",
    isNew: true,
    isFeatured: true,
    variants: [
      {
        sku: "APL-AWS9-45-MID",
        price: 24999,
        stockQuantity: 35,
        isDefault: true,
        attributes: [
          { slug: "size", valueAr: "45 مم", valueEn: "45 mm" },
          { slug: "color", valueAr: "رمادي", valueEn: "Midnight" },
        ],
      },
      {
        sku: "APL-AWS9-41-MID",
        price: 22999,
        compareAtPrice: 25999,
        costPrice: 20000,
        stockQuantity: 1,
        attributes: [
          { slug: "size", valueAr: "41 مم", valueEn: "41 mm" },
          { slug: "color", valueAr: "رمادي", valueEn: "Midnight" },
        ],
      },
    ],
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Display", valueAr: "45 مم", valueEn: "45 mm" },
      { keyAr: "مقاومة الماء", keyEn: "Water Resistance", valueAr: "50 متر", valueEn: "50 m" },
      { keyAr: "الاتصال", keyEn: "Connectivity", valueAr: "GPS + Wi-Fi + Bluetooth", valueEn: "GPS + Wi-Fi + Bluetooth" },
    ],
  },
  {
    nameAr: "أنكر باور بانك 20000",
    nameEn: "Anker PowerCore 20000",
    slug: "anker-powercore-20000",
    sku: "ANK-PC20K-MASTER",
    shortDescriptionAr: "شحن سريع 22.5 واط، منفذا USB",
    shortDescriptionEn: "22.5W fast charging, dual USB ports",
    descriptionAr:
      "بطارية متنقلة من أنكر بسعة 20000 مللي أمبير وشحن سريع 22.5 واط، مع منفذَي USBwisely يمكن استخدامهما معاً. تحمي.PowerIQ من الشحن الزائد وارتفاع الحرارة.",
    descriptionEn:
      "The Anker PowerCore 20000 packs 20,000 mAh and 22.5W fast charging into two ports you can use at once. PowerIQ guards against overcharging and overheating.",
    warranty: "ضمان أنكر 18 شهراً / 18 Month Anker Warranty",
    brandSlug: "anker",
    categorySlug: "chargers-cables",
    image: "https://res.cloudinary.com/demo/image/upload/anker-powercore.jpg",
    isBestSeller: true,
    variants: [
      {
        sku: "ANK-PC20K-BLK",
        price: 2499,
        stockQuantity: 120,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "أسود", valueEn: "Black" }],
      },
      {
        sku: "ANK-PC20K-WHT",
        price: 2499,
        costPrice: 1800,
        stockQuantity: 8,
        attributes: [{ slug: "color", valueAr: "أبيض", valueEn: "White" }],
      },
    ],
    specs: [
      { keyAr: "السعة", keyEn: "Capacity", valueAr: "20000 مللي أمبير", valueEn: "20000 mAh" },
      { keyAr: "قدرة الشحن", keyEn: "Output", valueAr: "22.5 واط", valueEn: "22.5 W" },
      { keyAr: "المنافذ", keyEn: "Ports", valueAr: "منفذا USB", valueEn: "Dual USB" },
    ],
  },
  {
    nameAr: "شاحن سيارة أنكر 53 واط",
    nameEn: "Anker 53W Dual-Port Car Charger",
    slug: "anker-53w-car-charger",
    sku: "ANK-CC53W-MASTER",
    shortDescriptionAr: "شحن سريع للسيارة بمنفذي USB-C و USB-A",
    shortDescriptionEn: "Fast car charging with USB-C and USB-A",
    descriptionAr:
      "شاحن سيارة من أنكر بقدرة 53 واط يجمع منفذ USB-C بقدرة 30 واط ومنفذ USB-A بقدرة 23 واط. حجم صغير لا يحجب مقبس Cigarette lighter، مع حماية من الحرارة الزائدة.",
    descriptionEn:
      "The Anker 53W car charger combines a 30W USB-C port with a 23W USB-A port. It is small enough not to block the cigarette-lighter socket and includes overheat protection.",
    warranty: "ضمان أنكر 18 شهراً / 18 Month Anker Warranty",
    brandSlug: "anker",
    categorySlug: "car-chargers",
    image: "https://res.cloudinary.com/demo/image/upload/anker-car-charger.jpg",
    variants: [
      {
        sku: "ANK-CC53W-DUAL",
        price: 899,
        stockQuantity: 200,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "أسود", valueEn: "Black" }],
      },
    ],
    specs: [
      { keyAr: "قدرة الشحن", keyEn: "Output", valueAr: "53 واط", valueEn: "53 W" },
      { keyAr: "المنافذ", keyEn: "Ports", valueAr: "USB-C + USB-A", valueEn: "USB-C + USB-A" },
    ],
  },
  {
    nameAr: "شاشة سامسونج 55 بوصة كريستال 4K",
    nameEn: 'Samsung 55" Crystal 4K Smart TV',
    slug: "samsung-55-crystal-4k-tv",
    sku: "SAM-55CU7000-MASTER",
    shortDescriptionAr: "دقة 4K، نظام تايزن الذكي",
    shortDescriptionEn: "4K UHD, Tizen smart platform",
    descriptionAr:
      "شاشة سامسونج 55 بوصة بدقة 4K ومعالج Neo QLED بمعدل تحديث 120 هرتز لألعاب smoother. نظام Tizen الذكي مع مساعد Bixby وصوت 40 واط.",
    descriptionEn:
      "A 55-inch 4K panel driven by a Neo QLED processor at 120Hz for smoother gaming. The Tizen platform brings Bixby voice control and 40W audio.",
    warranty: "ضمان سامسونج لمدة عامين / 2 Year Samsung Warranty",
    brandSlug: "samsung",
    categorySlug: "tvs",
    image: "https://res.cloudinary.com/demo/image/upload/samsung-55-4k.jpg",
    isFeatured: true,
    variants: [
      {
        sku: "SAM-55CU7000-STD",
        price: 32999,
        compareAtPrice: 36999,
        costPrice: 29000,
        stockQuantity: 12,
        isDefault: true,
        attributes: [{ slug: "size", valueAr: "55 بوصة", valueEn: "55 inch" }],
      },
    ],
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "55 بوصة", valueEn: "55 inch" },
      { keyAr: "الدقة", keyEn: "Resolution", valueAr: "4K UHD", valueEn: "4K UHD" },
      { keyAr: "الصوت", keyEn: "Audio", valueAr: "40 واط", valueEn: "40 W" },
    ],
  },
  {
    nameAr: "ماوس لوجيتك MX Master 3S",
    nameEn: "Logitech MX Master 3S",
    slug: "logitech-mx-master-3s",
    sku: "LOG-MXM3S-MASTER",
    shortDescriptionAr: "تتبع دقيق 8000 DPI، تمرير هادئ",
    shortDescriptionEn: "8K DPI tracking, quiet scrolling",
    descriptionAr: "ماوس لوجيتك MX Master 3S بتتبع 8000 DPI وتصميم مريح للاستخدام الطويل، مع تمرير مغناطيسي هادئ وزر مخصص لاستدعاء أدوات الذكاء الاصطناعي.",
    descriptionEn:
      "The Logitech MX Master 3S tracks at 8,000 DPI with an ergonomic shape built for long sessions, adding near-silent magnetic scrolling and a one-press AI key.",
    warranty: "ضمان لوجيتك لمدة عامين / 2 Year Logitech Warranty",
    brandSlug: "logitech",
    categorySlug: "computer-accessories",
    image: "https://res.cloudinary.com/demo/image/upload/mx-master-3s.jpg",
    variants: [
      {
        sku: "LOG-MXM3S-GRF",
        price: 5999,
        stockQuantity: 70,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "رمادي", valueEn: "Graphite" }],
      },
      {
        sku: "LOG-MXM3S-WHT",
        price: 5999,
        compareAtPrice: 6799,
        costPrice: 5000,
        stockQuantity: 3,
        attributes: [{ slug: "color", valueAr: "أبيض", valueEn: "White" }],
      },
    ],
    specs: [
      { keyAr: "الدقة", keyEn: "DPI", valueAr: "8000 DPI", valueEn: "8000 DPI" },
      { keyAr: "الاتصال", keyEn: "Connectivity", valueAr: "بلوتوث + USB", valueEn: "Bluetooth + USB" },
      { keyAr: "البطارية", keyEn: "Battery", valueAr: "70 يوماً", valueEn: "70 days" },
    ],
  },
  {
    nameAr: "حامل موبايل مغناطيسي للسيارة",
    nameEn: "Magnetic Car Phone Holder",
    slug: "magnetic-car-phone-holder",
    sku: "ANK-CARMAG-MASTER",
    shortDescriptionAr: "تثبيت مغناطيسي قوي لفتحة التكييف",
    shortDescriptionEn: "Strong magnetic air-vent mount",
    descriptionAr:
      "حامل مغناطيسي بقدرة 12 نيوتن يثبّت الهواتف حتى 7 بوصة على فتحة التكييف، ويدور 360 درجة للاستخدام في الوضع الأفقي والعمودي.",
    descriptionEn:
      "A 12-newton magnetic mount that holds phones up to 7 inches on the air vent and rotates a full 360 degrees for landscape or portrait viewing.",
    warranty: "ضمان أنكر 18 شهراً / 18 Month Anker Warranty",
    brandSlug: "anker",
    categorySlug: "car-holders",
    image: "https://res.cloudinary.com/demo/image/upload/car-holder.jpg",
    variants: [
      {
        sku: "ANK-CARMAG-BLK",
        price: 549,
        costPrice: 350,
        stockQuantity: 150,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "أسود", valueEn: "Black" }],
      },
    ],
    specs: [
      { keyAr: "قوة التثبيت", keyEn: "Mount Strength", valueAr: "12 نيوتن", valueEn: "12 N" },
      { keyAr: "التوافق", keyEn: "Compatibility", valueAr: "جميع الهواتف حتى 7 بوصة", valueEn: "All phones up to 7 inches" },
    ],
  },
  {
    nameAr: "تابلت آيباد النسخة العاشرة",
    nameEn: "Apple iPad 10th Generation",
    slug: "apple-ipad-10th-gen",
    sku: "APL-IPAD10-MASTER",
    shortDescriptionAr: "شريحة A14، تصميم كامل الشاشة",
    shortDescriptionEn: "A14 chip, full-screen design",
    descriptionAr:
      "آيباد الجيل العاشر بشريحة A14 وشاشة Liquid كاملة التحيز، وكاميرا أمامية أفقية للمكالمات مع Center Stage. يدعم Apple Pencil و Magic Keyboard.",
    descriptionEn:
      "The 10th-generation iPad runs the A14 chip on an edge-to-edge Liquid display, with a landscape front camera and Center Stage that follows you on video calls. It supports Apple Pencil and Magic Keyboard.",
    warranty: "ضمان أبل الرسمي لمدة عام / 1 Year Apple Official Warranty",
    brandSlug: "apple",
    categorySlug: "tablets",
    image: "https://res.cloudinary.com/demo/image/upload/ipad-10.jpg",
    isNew: true,
    variants: [
      {
        sku: "APL-IPAD10-64-BLU",
        price: 16999,
        stockQuantity: 22,
        isDefault: true,
        attributes: [
          { slug: "color", valueAr: "أزرق", valueEn: "Blue" },
          { slug: "storage", valueAr: "64 جيجابايت", valueEn: "64 GB" },
        ],
      },
      {
        sku: "APL-IPAD10-256-SLV",
        price: 22999,
        compareAtPrice: 25499,
        costPrice: 20000,
        stockQuantity: 0,
        attributes: [
          { slug: "color", valueAr: "فضي", valueEn: "Silver" },
          { slug: "storage", valueAr: "256 جيجابايت", valueEn: "256 GB" },
        ],
      },
    ],
    specs: [
      { keyAr: "حجم الشاشة", keyEn: "Screen Size", valueAr: "10.9 بوصة Liquid", valueEn: "10.9-inch Liquid" },
      { keyAr: "المعالج", keyEn: "Processor", valueAr: "شريحة A14 Bionic", valueEn: "A14 Bionic chip" },
      { keyAr: "التوافق", keyEn: "Compatibility", valueAr: "Apple Pencil (1st gen)", valueEn: "Apple Pencil (1st gen)" },
    ],
  },
  {
    nameAr: "كيبلanker braided USB-C 2 متر",
    nameEn: "Anker Braided USB-C Cable 2m",
    slug: "anker-braided-usbc-cable-2m",
    sku: "ANK-CBL2M-BLK",
    shortDescriptionAr: "نايلون مجدول متين، شحن 60 واط",
    shortDescriptionEn: "Braided nylon, 60W charging",
    descriptionAr:
      "كيبل من أنكر بطول مترين بغلاف نايلون مجدول يتحمل أكثر من 25,000 انثناءة، ويدعم الشحن حتى 60 واط ونقل البيانات 480 ميجابت مع-enhanced chips.",
    descriptionEn:
      "A two-metre Anker cable with a braided nylon jacket tested past 25,000 bends, supporting 60W charging and 480 Mbps data with E-marker chips.",
    warranty: "ضمان أنكر 18 شهراً / 18 Month Anker Warranty",
    brandSlug: "anker",
    categorySlug: "chargers-cables",
    image: "https://res.cloudinary.com/demo/image/upload/usb-c-cable.jpg",
    variants: [
      {
        sku: "ANK-CBL2M-BLK",
        price: 349,
        compareAtPrice: 449,
        costPrice: 200,
        stockQuantity: 250,
        isDefault: true,
        attributes: [
          { slug: "color", valueAr: "أسود", valueEn: "Black" },
          { slug: "size", valueAr: "2 متر", valueEn: "2 m" },
        ],
      },
    ],
    specs: [
      { keyAr: "الطول", keyEn: "Length", valueAr: "2 متر", valueEn: "2 m" },
      { keyAr: "القدرة", keyEn: "Power", valueAr: "60 واط", valueEn: "60 W" },
    ],
  },
  {
    nameAr: "جراب سيليكون لآيفون 15",
    nameEn: "iPhone 15 Silicone Case",
    slug: "iphone-15-silicone-case",
    sku: "APL-CASE15-CLR",
    shortDescriptionAr: "سيليكون ناعم، حماية من السقوط",
    shortDescriptionEn: "Soft silicone, military-grade drop protection",
    descriptionAr:
      "جراب سيليكون لآيفون 15 بحواف مرتفعة والكاميرا محمية بالكامل، مع بطانة داخلية من الألياف. متوافق مع MagSafe ويأتي بملمس ناعم مقاوم لبقعة الإصبع.",
    descriptionEn:
      "A silicone case for the iPhone 15 with raised edges and full camera coverage over a microfibre lining. MagSafe compatible, soft to the touch, and resistant to fingerprint smudging.",
    warranty: "ضمان أبل الرسمي لمدة عام / 1 Year Apple Official Warranty",
    brandSlug: "apple",
    categorySlug: "cases-covers",
    image: "https://res.cloudinary.com/demo/image/upload/iphone-15-case.jpg",
    variants: [
      {
        sku: "APL-CASE15-STN",
        price: 1299,
        costPrice: 800,
        stockQuantity: 90,
        isDefault: true,
        attributes: [{ slug: "color", valueAr: "أزرق داكن", valueEn: "Deep Blue" }],
      },
      {
        sku: "APL-CASE15-SLV",
        price: 1299,
        stockQuantity: 0,
        attributes: [{ slug: "color", valueAr: "رمادي", valueEn: "Silver" }],
      },
    ],
    specs: [
      { keyAr: "المادة", keyEn: "Material", valueAr: "سيليكون", valueEn: "Silicone" },
      { keyAr: "التوافق", keyEn: "Compatibility", valueAr: "iPhone 15 / 15 Pro", valueEn: "iPhone 15 / 15 Pro" },
    ],
  },
];

const SHIPPING_ZONES = [
  { governorate: "cairo", zone: "Zone A", deliveryFee: 50, estimatedDays: 2 },
  { governorate: "giza", zone: "Zone A", deliveryFee: 55, estimatedDays: 2 },
  { governorate: "alexandria", zone: "Zone B", deliveryFee: 65, estimatedDays: 3 },
];

/**
 * Remove catalogue rows this seed no longer declares.
 *
 * `upsert` only touches slugs that are still present, so editing this file
 * (renaming a product, dropping one) would otherwise leave the old row behind and
 * the storefront would show two copies of the same thing.
 *
 * Rows with commercial history are preserved rather than reset: `OrderItem` keeps
 * no foreign key to `Product`, only a `skuSnapshot`, so a product that appears in
 * any order is left in place. Deleting it would silently rewrite what an existing
 * order says was bought.
 */
async function pruneUndeclaredCatalogueRows(): Promise<void> {
  const declaredProductSlugs = PRODUCTS.map((product) => product.slug);
  const declaredBrandSlugs = BRANDS.map((brand) => brand.slug);
  const declaredCategorySlugs = [
    ...CATEGORIES.map((category) => category.slug),
    ...CATEGORIES.flatMap((category) => category.children.map((child) => child.slug)),
  ];

  const orderedSkus = (await prisma.orderItem.findMany({ select: { skuSnapshot: true } })).map(
    (item) => item.skuSnapshot,
  );
  const orderedProductSlugs = PRODUCTS.filter((product) => orderedSkus.includes(product.sku)).map(
    (product) => product.slug,
  );

  const products = await prisma.product.deleteMany({
    where: {
      slug: { notIn: [...declaredProductSlugs, ...orderedProductSlugs] },
    },
  });

  const brands = await prisma.brand.deleteMany({
    where: { slug: { notIn: declaredBrandSlugs }, products: { none: {} } },
  });

  // Only leaves are removed. The taxonomy this seed writes is two levels deep, so
  // anything deeper is real data rather than a leftover, and leaving it in place
  // costs nothing but an unused row.
  const categories = await prisma.category.deleteMany({
    where: {
      slug: { notIn: declaredCategorySlugs },
      products: { none: {} },
      children: { none: {} },
    },
  });

  if (products.count || brands.count || categories.count) {
    // eslint-disable-next-line no-console
    console.log(
      `Pruned stale catalogue rows: ${products.count} products, ${categories.count} categories, ${brands.count} brands`,
    );
  }
}

async function main(): Promise<void> {
  await pruneUndeclaredCatalogueRows();

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

  // 4. Shared variant dimensions. Upserted before any variant references them so
  // the storefront selector shows one consistent bilingual label ("اللون / Color")
  // rather than a per-product wording.
  for (const attribute of ATTRIBUTES) {
    await prisma.productAttribute.upsert({
      where: { slug: attribute.slug },
      update: { nameAr: attribute.nameAr, nameEn: attribute.nameEn },
      create: attribute,
    });
  }
  const attributeIds = new Map(
    (await prisma.productAttribute.findMany({ select: { id: true, slug: true } })).map((row) => [row.slug, row.id]),
  );
  // eslint-disable-next-line no-console
  console.log(`Seeded ${ATTRIBUTES.length} variant dimensions`);

  // 5. Products with their variants, images, and specifications.
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
        sku: product.sku,
        shortDescriptionAr: product.shortDescriptionAr,
        shortDescriptionEn: product.shortDescriptionEn,
        descriptionAr: product.descriptionAr,
        descriptionEn: product.descriptionEn,
        warranty: product.warranty,
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
        descriptionAr: product.descriptionAr,
        descriptionEn: product.descriptionEn,
        warranty: product.warranty,
        brandId: brand.id,
        categoryId: category.id,
        currency: "EGP",
        isActive: true,
        isFeatured: product.isFeatured ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isNew: product.isNew ?? false,
      },
    });

    // Variants are replaced wholesale rather than upserted. The product's variant
    // set is authored here, so an edit to the array should be reflected exactly —
    // leaving a stale SKU behind would show a selector option with no image and an
    // orphaned price.
    await prisma.productVariant.deleteMany({ where: { productId: created.id } });

    for (const variant of product.variants) {
      const variantRow = await prisma.productVariant.create({
        data: {
          productId: created.id,
          sku: variant.sku,
          price: decimal(variant.price),
          compareAtPrice: variant.compareAtPrice === undefined ? null : decimal(variant.compareAtPrice),
          costPrice: variant.costPrice === undefined ? null : decimal(variant.costPrice),
          stockQuantity: variant.stockQuantity,
          reservedQuantity: 0,
          isDefault: variant.isDefault ?? false,
          isActive: true,
        },
        select: { id: true },
      });

      if (variant.attributes.length > 0) {
        await prisma.productAttributeValue.createMany({
          data: variant.attributes.map((assignment) => {
            const attributeId = attributeIds.get(assignment.slug);
            if (!attributeId) {
              throw new Error(`Variant ${variant.sku} references unknown attribute "${assignment.slug}"`);
            }
            return {
              attributeId,
              variantId: variantRow.id,
              valueAr: assignment.valueAr,
              valueEn: assignment.valueEn,
            };
          }),
        });
      }
    }

    // Images: reset so a removed gallery entry does not survive a re-seed. The
    // first entry is always primary, which is the one the product card shows.
    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    await prisma.productImage.createMany({
      data: [product.image, ...(product.gallery ?? [])].map((url, index) => ({
        productId: created.id,
        url,
        alt: index === 0 ? product.nameEn : `${product.nameEn} — ${index + 1}`,
        sortOrder: index,
        isPrimary: index === 0,
      })),
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
  console.log(
    `Seeded ${PRODUCTS.length} products with ${PRODUCTS.reduce((total, product) => total + product.variants.length, 0)} variants`,
  );

  // 6. Shipping zones (idempotent: update existing governorate rows or create).
  // Governorate identity is a canonical lowercase slug (research.md D-7); legacy
  // display-cased rows ("Cairo") are migrated to their slug in place.
  for (const zone of SHIPPING_ZONES) {
    const existing = await prisma.shippingZone.findFirst({
      where: { governorate: { equals: zone.governorate, mode: "insensitive" } },
    });
    if (existing) {
      await prisma.shippingZone.update({
        where: { id: existing.id },
        data: {
          governorate: zone.governorate,
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
  await prisma.shippingZone.deleteMany({
    where: { governorate: { notIn: SHIPPING_ZONES.map((zone) => zone.governorate) } },
  });
  // eslint-disable-next-line no-console
  console.log("Seeded shipping zones");

  // 7. Application settings (idempotent via key upsert)
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
