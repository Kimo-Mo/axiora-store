// Root layout is a minimal pass-through.
//
// `<html>` / `<body>` (with lang/dir, fonts, and all providers) live in
// `app/[locale]/layout.tsx` — nested layouts cannot render them, and every
// page in this app is locale-prefixed (see specs/002-localization-rtl).
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
