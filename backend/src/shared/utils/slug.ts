const ARABIC_TRANSLITERATION_MAP: Record<string, string> = {
  "ا": "a",
  "أ": "a",
  "إ": "i",
  "آ": "a",
  "ب": "b",
  "ت": "t",
  "ث": "th",
  "ج": "j",
  "ح": "h",
  "خ": "kh",
  "د": "d",
  "ذ": "th",
  "ر": "r",
  "ز": "z",
  "س": "s",
  "ش": "sh",
  "ص": "s",
  "ض": "d",
  "ط": "t",
  "ظ": "z",
  "ع": "a",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ك": "k",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ه": "h",
  "ة": "a",
  "و": "w",
  "ؤ": "w",
  "ي": "y",
  "ئ": "y",
  "ى": "a",
  "ء": "a",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function transliterateArabic(input: string): string {
  return input
    .split("")
    .map((char) => ARABIC_TRANSLITERATION_MAP[char] ?? char)
    .join("");
}

function slugifyText(input: string): string {
  const transliterated = transliterateArabic(input);
  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function containsArabic(input: string): boolean {
  return /[؀-ۿ]/.test(input);
}

export interface SlugInput {
  nameEn?: string;
  nameAr?: string;
  fallback?: string;
}

/**
 * Generate a URL-safe slug, preferring the English name.
 * Falls back to Arabic transliteration when no English name is available.
 */
export function generateSlug(input: string | SlugInput): string {
  if (typeof input === "string") {
    return slugifyText(input);
  }

  const english = input.nameEn?.trim();
  if (english && !containsArabic(english)) {
    const slug = slugifyText(english);
    if (slug) {
      return slug;
    }
  } else if (english) {
    const slug = slugifyText(english);
    if (slug) {
      return slug;
    }
  }

  const arabic = input.nameAr?.trim();
  if (arabic) {
    const slug = slugifyText(arabic);
    if (slug) {
      return slug;
    }
  }

  if (input.fallback) {
    return slugifyText(input.fallback);
  }

  return "";
}

export default generateSlug;
