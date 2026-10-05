import { Link } from '@/i18n/navigation';
import { CategoryCardsSection } from '@/components/features/home/CategoryCardsSection';

/*
 * REPLACEMENT LIST (all content below is synthetic — user to replace):
 * - Hero offer: headline, discount value, CTA targets
 * - DEAL_ROWS: product names, was/now prices, discount %, hrefs, stock states
 * - TICKER_ITEMS: trust claims (COD, warranty, shipping copy)
 * - Product imagery: no real photos on hand; rows are type-only by design
 *
 * The category section is real: it is driven by the live catalogue through
 * `CategoryCardsSection`, not the synthetic `PLATFORMS` list that preceded it.
 */

const DEAL_ROWS = [
  { item: 'Wireless Earbuds Pro', drop: '-35%', was: '2,499', now: '1,624', state: 'is-deal', stateLabel: 'Deal', href: '/store?search=earbuds' },
  { item: '20W GaN Wall Charger', drop: '-25%', was: '899', now: '674', state: 'is-deal', stateLabel: 'Deal', href: '/store?search=charger' },
  { item: '10,000mAh Power Bank', drop: '-20%', was: '1,499', now: '1,199', state: 'is-live', stateLabel: 'Live', href: '/store?search=power+bank' },
  { item: 'Smart Watch S2', drop: '-15%', was: '4,999', now: '4,249', state: 'is-live', stateLabel: 'Live', href: '/store?search=watch' },
  { item: 'Braided USB-C Cable 2m', drop: '-40%', was: '349', now: '209', state: 'is-stock', stateLabel: 'In stock', href: '/store?search=cable' },
];

const TICKER_ITEMS = [
  'Cash on delivery across Egypt',
  'Verified-phone checkout',
  'Governorate-based shipping',
  'Genuine products, clear warranty',
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 py-8 md:gap-12 md:py-12">
      {/* ── Concourse hero board ── */}
      <section className="board" aria-label="Today's top offer">
        <div className="board-head">
          <span>Axiora · Cairo concourse</span>
          <span className="deal-status is-live">● Live</span>
        </div>
        <div className="flex flex-col gap-6 p-6 md:p-10">
          <p lang="ar" dir="rtl" className="text-end font-display text-4xl leading-[1.15] font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl text-[#f2f2f2]">
            خصومات الموبايلات والإكسسوارات حتى ٤٠٪
          </p>
          <div className="flex flex-wrap items-center gap-3" aria-label="Offer highlight">
            <span className="flap text-2xl md:text-3xl">UP TO 40% OFF</span>
            <span className="text-white/70 text-sm">Mobile deals, rewritten daily. Prices include VAT.</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/store?is_popular=true"
              className="bg-[#ffb000] text-black inline-flex h-12 items-center rounded-lg px-7 font-display text-sm font-bold tracking-[0.14em] uppercase transition-colors hover:bg-[#ffc233]">
              Shop the drops
            </Link>
            <Link
              href="/store"
              className="border-white/25 text-[#f2f2f2] inline-flex h-12 items-center rounded-lg border px-7 font-display text-sm font-bold tracking-[0.14em] uppercase transition-colors hover:bg-white/10">
              All platforms
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live deal rows ── */}
      <section className="board" aria-label="Live deal rows">
        <div className="board-head">
          <span>Live departures · price drops</span>
          <Link href="/store" className="deal-status is-live underline-offset-4 hover:underline">
            Full board →
          </Link>
        </div>
        <div>
          {DEAL_ROWS.map((row, i) => (
            <Link
              key={row.item}
              href={row.href}
              className="deal-row cascade-in"
              style={{ animationDelay: `${i * 90}ms` }}>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-[15px] font-semibold text-[#f2f2f2]">{row.item}</span>
                <span className="tnum text-white/60 text-xs">
                  <span className="line-through">{row.was} EGP</span>
                  {' → '}
                  <span className="text-[#f2f2f2] font-bold">{row.now} EGP</span>
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="flap text-sm" aria-label={`Discount ${row.drop}`}>{row.drop}</span>
                <span className={`deal-status ${row.state}`}>{row.stateLabel}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Category platforms ── */}
      <section aria-label="Shop by category">
        <CategoryCardsSection />
      </section>

      {/* ── Trust ticker ── */}
      <div className="ticker" aria-label="Why shop with Axiora">
        <div className="ticker-track font-display text-xs font-bold tracking-[0.16em] uppercase">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="flex items-center gap-10" aria-hidden={i >= TICKER_ITEMS.length}>
              <span>{t}</span>
              <span className="text-live" aria-hidden="true">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
