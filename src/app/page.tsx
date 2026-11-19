"use client";

import { useEffect, useRef, useState } from "react";
import { SITE } from "@/site.config";
import { CATEGORIES, REVIEWS, FEATURES, won, minPrice, type Item } from "@/data";

/* 법카 플라워 — 오피스/B2B 톤(흰 배경·로즈핑크 포인트·네이비 텍스트, 산세리프).
   '용도로 찾기' → 카테고리 카탈로그(데스크톱 사이드 메뉴 / 모바일 세그먼트 탭).
   상품을 누르면 '금액 상이' 안내 팝업을 먼저 띄우고, 확인 시 전화로 연결합니다. */

const SECTIONS = [
  { id: "purpose", label: "용도로 찾기" },
  { id: "catalog", label: "전체 상품" },
  { id: "process", label: "주문 절차" },
  { id: "reviews", label: "이용 후기" },
  { id: "contact", label: "전화 상담" },
];

/* 용도 → 카테고리(key 는 data.ts CATEGORIES 의 key) */
const PURPOSES = [
  { label: "개업·취임 축하", sub: "축하화환", key: "축하화환", icon: "ribbon" },
  { label: "조문·장례", sub: "근조화환", key: "근조화환", icon: "lily" },
  { label: "사무실 개업·이전", sub: "관엽화분", key: "관엽화분", icon: "plant" },
  { label: "승진·영전", sub: "동·서양란", key: "동서양란", icon: "orchid" },
  { label: "기념일·생일", sub: "꽃다발", key: "꽃다발", icon: "bouquet" },
  { label: "감사·병문안", sub: "꽃바구니", key: "꽃바구니", icon: "basket" },
] as const;

type IconName = (typeof PURPOSES)[number]["icon"];

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.3 21 3 12.7 3 3c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1.1l-2.2 2.1z" />
    </svg>
  );
}

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PurposeIcon({ name }: { name: IconName }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true" {...p}>
      {name === "ribbon" && (
        <>
          <circle cx="12" cy="9" r="5" />
          <circle cx="12" cy="9" r="2" />
          <path d="M9 13.5 7 21l5-2.5 5 2.5-2-7.5" />
        </>
      )}
      {name === "lily" && (
        <>
          <path d="M12 3c2 3 2 6 0 9-2-3-2-6 0-9z" />
          <path d="M12 12c-3-1-5-3-6-6 3 0 5 2 6 6zM12 12c3-1 5-3 6-6-3 0-5 2-6 6z" />
          <path d="M12 12v9" />
        </>
      )}
      {name === "plant" && (
        <>
          <path d="M7 15h10l-1.5 6h-7z" />
          <path d="M12 15V8M12 10c-3 0-5-2-5-5 3 0 5 2 5 5zM12 12c3 0 5-2 5-5-3 0-5 2-5 5z" />
        </>
      )}
      {name === "orchid" && (
        <>
          <path d="M8 16h8l-1 5H9z" />
          <path d="M12 16c0-5 2-9 6-11" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="12" cy="10" r="1.8" />
        </>
      )}
      {name === "bouquet" && (
        <>
          <circle cx="9" cy="7" r="2.5" />
          <circle cx="15" cy="7" r="2.5" />
          <circle cx="12" cy="4.5" r="2" />
          <path d="M7 11h10l-5 10z" />
        </>
      )}
      {name === "basket" && (
        <>
          <path d="M4 11h16l-2 9H6z" />
          <path d="M7 11a5 5 0 0 1 10 0" />
          <path d="M9 14v3M12 14v3M15 14v3" />
        </>
      )}
    </svg>
  );
}

const STEP_ICONS = ["01", "02", "03"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catKey, setCatKey] = useState<string>(CATEGORIES[0].key);
  const [notice, setNotice] = useState<Item | null>(null);
  const catalogRef = useRef<HTMLElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tel = `tel:${SITE.phoneHref}`;

  // 팝업이 열려 있는 동안 배경 스크롤 잠금 + ESC 로 닫기
  useEffect(() => {
    if (!notice) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNotice(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [notice]);

  // 모바일 탭: 선택된 탭이 보이도록 가로 스크롤
  useEffect(() => {
    const box = tabsRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-key="${catKey}"]`);
    if (box && el) {
      box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
    }
  }, [catKey]);

  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pick = (key: string) => {
    setCatKey(key);
    window.setTimeout(() => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const cat = CATEGORIES.find((c) => c.key === catKey) ?? CATEGORIES[0];
  const total = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      {/* 헤더 */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-b border-[var(--line)]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between gap-3">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={`${SITE.name} 홈으로`}
            className="flex items-center gap-2.5 min-w-0"
          >
            {SITE.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={SITE.logo} alt="" className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 object-contain" />
            )}
            <span className="hidden min-[400px]:flex flex-col items-start leading-tight">
              <span className="text-[17px] sm:text-lg font-bold text-[var(--navy)]">{SITE.name}</span>
              <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.18em] text-[var(--rose)]">
                FLOWER DELIVERY
              </span>
            </span>
          </button>

          <ul className="hidden lg:flex items-center gap-0.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className="px-3.5 py-3 text-[15px] font-medium text-[var(--muted)] hover:text-[var(--navy)] transition"
                >
                  {s.label}
                </button>
              </li>
            ))}
            <li className="ml-3">
              <a
                href={tel}
                className="flex items-center gap-2 h-11 px-5 rounded-lg bg-[var(--rose)] text-white text-[15px] font-semibold hover:bg-[var(--rose-dark)] transition"
              >
                <PhoneIcon className="w-4 h-4" />
                <span className="tabular-nums">{SITE.phone}</span>
              </a>
            </li>
          </ul>

          <div className="lg:hidden flex items-center gap-1.5 shrink-0">
            <a
              href={tel}
              className="flex items-center gap-1.5 h-11 px-3.5 rounded-lg bg-[var(--rose)] text-white text-sm font-semibold"
            >
              <PhoneIcon className="w-4 h-4" />
              <span className="tabular-nums">{SITE.phone}</span>
            </a>
            <button
              className="w-11 h-11 rounded-lg border border-[var(--line)] flex flex-col items-center justify-center gap-1.5"
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={`block w-5 h-0.5 bg-[var(--navy)] transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[var(--navy)] transition ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-[var(--navy)] transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </nav>
        {menuOpen && (
          <ul className="lg:hidden border-t border-[var(--line)] bg-white px-4 py-2 anim-fade">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className="w-full flex items-center justify-between px-2 py-3.5 text-base font-medium text-[var(--navy)] border-b border-[var(--line)] last:border-0"
                >
                  {s.label}
                  <Arrow className="w-4 h-4 text-[var(--muted)]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </header>

      <main className="flex-1 pt-[68px] sm:pt-[76px]">
        {/* 용도로 찾기 — 첫 화면 */}
        <section id="purpose" className="bg-[var(--surface)] border-b border-[var(--line)] px-4 sm:px-6 pt-5 pb-6 sm:pt-12 sm:pb-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 sm:gap-6 mb-4 sm:mb-8">
              <div>
                <p className="text-[12px] sm:text-sm font-semibold text-[var(--rose)]">어떤 자리에 보내시나요?</p>
                <h1 className="mt-1 text-[22px] sm:text-4xl font-bold text-[var(--navy)] leading-tight break-keep">
                  용도를 고르면 맞는 상품을 바로 보여드려요
                </h1>
              </div>
              <p className="text-[13px] sm:text-[15px] text-[var(--muted)] break-keep">
                전국 당일배송 · 365일 전화 상담 · 총 {total}종
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {PURPOSES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => pick(p.key)}
                  className="group flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-4 min-h-[60px] p-3 sm:p-5 rounded-xl bg-white border border-[var(--line)] text-left hover:border-[var(--rose)] hover:shadow-[0_6px_20px_-10px_rgba(214,69,122,.45)] transition"
                >
                  <span className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-[var(--rose-soft)] text-[var(--rose)] flex items-center justify-center">
                    <PurposeIcon name={p.icon} />
                  </span>
                  <span className="min-w-0 flex-1 w-full">
                    <span className="block text-[14px] sm:text-base font-semibold text-[var(--navy)] leading-snug break-keep">
                      {p.label}
                    </span>
                    <span className="mt-0.5 flex items-center justify-between text-[12px] sm:text-sm text-[var(--muted)]">
                      {p.sub}
                      <Arrow className="hidden sm:block w-4 h-4 text-[var(--rose)] opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition" />
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 카탈로그 */}
        <section id="catalog" ref={catalogRef} className="px-4 sm:px-6 py-8 sm:py-14">
          <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
            {/* 데스크톱 사이드 메뉴 */}
            <aside className="hidden lg:block">
              <div className="sticky top-[100px]">
                <p className="px-3 mb-3 text-xs font-semibold tracking-[0.14em] text-[var(--muted)]">CATEGORY</p>
                <ul className="space-y-1">
                  {CATEGORIES.map((c) => {
                    const on = c.key === catKey;
                    return (
                      <li key={c.key}>
                        <button
                          onClick={() => setCatKey(c.key)}
                          aria-current={on ? "true" : undefined}
                          className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition ${
                            on
                              ? "bg-[var(--navy)] text-white"
                              : "text-[var(--navy)] hover:bg-[var(--surface)]"
                          }`}
                        >
                          <span className="font-semibold text-[15px]">{c.name}</span>
                          <span className={`text-xs tabular-nums ${on ? "text-white/70" : "text-[var(--muted)]"}`}>
                            {c.items.length}종
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <a
                  href={tel}
                  className="mt-6 block rounded-xl border border-[var(--line)] p-4 hover:border-[var(--rose)] transition"
                >
                  <span className="block text-xs text-[var(--muted)]">찾는 상품이 없으신가요?</span>
                  <span className="mt-1 flex items-center gap-1.5 text-lg font-bold text-[var(--navy)] tabular-nums">
                    <PhoneIcon className="w-4 h-4 text-[var(--rose)]" />
                    {SITE.phone}
                  </span>
                </a>
              </div>
            </aside>

            <div className="min-w-0">
              {/* 모바일·태블릿 세그먼트 탭 */}
              <div className="lg:hidden sticky top-[68px] sm:top-[76px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 bg-white/95 backdrop-blur border-b border-[var(--line)]">
                <div ref={tabsRef} role="tablist" aria-label="카테고리" className="no-scrollbar relative flex gap-1 overflow-x-auto p-1 rounded-xl bg-[var(--surface)]">
                  {CATEGORIES.map((c) => {
                    const on = c.key === catKey;
                    return (
                      <button
                        key={c.key}
                        data-key={c.key}
                        role="tab"
                        aria-selected={on}
                        onClick={() => setCatKey(c.key)}
                        className={`shrink-0 h-11 px-4 rounded-lg text-[14px] font-semibold whitespace-nowrap transition ${
                          on ? "bg-white text-[var(--rose)] shadow-sm" : "text-[var(--muted)]"
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 lg:mt-0 flex flex-wrap items-end justify-between gap-2 pb-4 border-b border-[var(--line)]">
                <div>
                  <h2 className="text-xl sm:text-3xl font-bold text-[var(--navy)]">{cat.name}</h2>
                  <p className="mt-1 text-[13px] sm:text-[15px] text-[var(--muted)] break-keep">{cat.desc}</p>
                </div>
                <p className="text-[13px] sm:text-sm text-[var(--muted)]">
                  <span className="font-semibold text-[var(--navy)]">{cat.items.length}종</span> ·{" "}
                  <span className="tabular-nums">{won(minPrice(cat))}~</span>
                </p>
              </div>

              <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8">
                {cat.items.map((it) => (
                  <li key={`${it.folder}-${it.name}`}>
                    <button onClick={() => setNotice(it)} className="group w-full text-left">
                      <span className="block relative aspect-square overflow-hidden rounded-xl bg-[var(--surface)] border border-[var(--line)]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/${it.folder}/${it.name}.jpg`}
                          alt={it.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                        />
                        {cat.key === "동서양란" && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/90 text-[11px] font-semibold text-[var(--navy)]">
                            {it.folder}
                          </span>
                        )}
                      </span>
                      <span className="block mt-2.5 text-[14px] sm:text-[15px] font-medium text-[var(--navy)] leading-snug break-keep">
                        {it.name}
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-[15px] sm:text-base font-bold text-[var(--rose)] tabular-nums">
                          {won(it.price)}~
                        </span>
                        <span className="shrink-0 w-8 h-8 rounded-full bg-[var(--rose-soft)] text-[var(--rose)] flex items-center justify-center group-hover:bg-[var(--rose)] group-hover:text-white transition">
                          <PhoneIcon className="w-3.5 h-3.5" />
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              <p className="mt-8 text-[12px] sm:text-sm text-[var(--muted)] break-keep">
                * 상품 사진은 예시이며, 제품별 금액은 상이할 수 있습니다. 정확한 금액은 상담 시 안내해 드립니다.
              </p>
            </div>
          </div>
        </section>

        {/* 주문 절차 + 서비스 */}
        <section id="process" className="px-4 sm:px-6 py-14 sm:py-24 bg-[var(--surface)] border-y border-[var(--line)]">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-semibold text-[var(--rose)]">주문 절차</p>
            <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-[var(--navy)] break-keep">
              세 단계면 주문이 끝납니다
            </h2>

            <ol className="mt-8 sm:mt-12 grid md:grid-cols-3 gap-3 md:gap-0 md:rounded-2xl md:overflow-hidden md:border md:border-[var(--line)]">
              {[
                { t: "용도·상품 고르기", d: "보내실 자리에 맞는 상품을 위 카탈로그에서 확인하세요." },
                { t: "전화로 주문·상담", d: `${SITE.phone} 로 전화 주시면 상담사가 금액·리본 문구·배송지를 확인해 드립니다.` },
                { t: "전국 당일 제작·배송", d: "현지 플로리스트가 직접 제작해 받는 분께 전해드립니다." },
              ].map((s, i) => (
                <li
                  key={s.t}
                  className="relative bg-white p-6 sm:p-8 rounded-2xl md:rounded-none border border-[var(--line)] md:border-0 md:border-r md:last:border-r-0"
                >
                  <span className="text-[13px] font-bold tracking-[0.12em] text-[var(--rose)] tabular-nums">
                    STEP {STEP_ICONS[i]}
                  </span>
                  <h3 className="mt-2 text-lg sm:text-xl font-bold text-[var(--navy)]">{s.t}</h3>
                  <p className="mt-2 text-[14px] sm:text-[15px] text-[var(--muted)] leading-relaxed break-keep">{s.d}</p>
                  {i < 2 && (
                    <span className="hidden md:flex absolute top-1/2 -right-4 z-10 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--rose)] text-white items-center justify-center">
                      <Arrow className="w-4 h-4" />
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <dl className="mt-8 sm:mt-10 grid sm:grid-cols-3 gap-px bg-[var(--line)] rounded-2xl overflow-hidden border border-[var(--line)]">
              {FEATURES.map((f) => (
                <div key={f.t} className="bg-white px-6 py-5 flex items-start gap-3">
                  <span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-[var(--rose)] text-white flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <dt className="font-bold text-[var(--navy)]">{f.t}</dt>
                    <dd className="mt-0.5 text-[14px] text-[var(--muted)] break-keep">{f.d}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 후기 */}
        <section id="reviews" className="px-4 sm:px-6 py-14 sm:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-[var(--rose)]">이용 후기</p>
                <h2 className="mt-1 text-2xl sm:text-4xl font-bold text-[var(--navy)] break-keep">
                  보내신 분들의 이야기
                </h2>
              </div>
              <p className="text-sm text-[var(--muted)]">
                <span className="text-[var(--rose)]">★★★★★</span> 고객 후기 {REVIEWS.length}건
              </p>
            </div>

            <div className="mt-8 sm:mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {REVIEWS.map((r) => (
                <figure key={r.name} className="rounded-xl border border-[var(--line)] p-5 sm:p-6 border-l-4 border-l-[var(--rose)]">
                  <h3 className="font-bold text-[var(--navy)] break-keep">{r.title}</h3>
                  <blockquote className="mt-2 text-[14px] sm:text-[15px] text-[var(--muted)] leading-relaxed break-keep">
                    {r.body}
                  </blockquote>
                  <figcaption className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span>{r.name} 고객님</span>
                    <span className="text-[var(--rose)] tracking-[0.15em]">★★★★★</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 전화 상담 */}
        <section id="contact" className="px-4 sm:px-6 pb-14 sm:pb-24">
          <div className="max-w-7xl mx-auto rounded-2xl bg-[var(--navy)] text-white px-6 py-10 sm:px-14 sm:py-14 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-sm font-semibold text-[#f6a9c4]">전화 상담 · 365일</p>
              <h2 className="mt-2 text-2xl sm:text-4xl font-bold leading-snug break-keep">
                급한 화환도, 단체 주문도
                <br className="hidden sm:block" /> 전화 한 통이면 됩니다
              </h2>
              <p className="mt-3 text-[14px] sm:text-base text-white/70 break-keep">
                기업·단체 주문도 전화로 편하게 상담해 드립니다. 상품 선택부터 리본 문구까지 함께 정리해 드려요.
              </p>
            </div>
            <a
              href={tel}
              className="flex items-center justify-center gap-3 h-16 sm:h-[72px] px-6 sm:px-10 rounded-xl bg-[var(--rose)] hover:bg-[var(--rose-dark)] transition text-xl sm:text-2xl font-bold tabular-nums"
            >
              <PhoneIcon className="w-6 h-6" />
              {SITE.phone}
            </a>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-[var(--line)] px-4 sm:px-6 pt-10 pb-24 sm:pb-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-3">
            {SITE.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={SITE.logo} alt={SITE.name} className="w-16 h-16 object-contain" />
            )}
            <div>
              <p className="font-bold text-[var(--navy)]">{SITE.name}</p>
              <p className="text-[13px] text-[var(--muted)]">전국 당일 꽃배달 · 전화 주문 전용</p>
            </div>
          </div>
          <div className="text-[13px] text-[var(--muted)] sm:text-right">
            <a href={tel} className="inline-flex items-center gap-1.5 min-h-11 font-semibold text-[var(--navy)] tabular-nums">
              <PhoneIcon className="w-4 h-4 text-[var(--rose)]" />
              대표번호 {SITE.phone}
            </a>
            <p>© {SITE.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 모바일 하단 고정 전화 바 */}
      <a
        href={tel}
        className="lg:hidden fixed bottom-3 left-3 right-3 z-40 h-14 rounded-xl bg-[var(--navy)] text-white flex items-center justify-center gap-2 text-base font-semibold shadow-[0_10px_30px_-8px_rgba(27,37,64,.55)]"
      >
        <PhoneIcon className="w-5 h-5 text-[#f6a9c4]" />
        전화 주문 <span className="tabular-nums">{SITE.phone}</span>
      </a>

      {/* 상품 안내 팝업 */}
      {notice && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#0e1426]/55 p-0 sm:p-6 anim-fade"
          onClick={() => setNotice(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden anim-sheet"
          >
            <div className="flex items-center gap-4 p-5 border-b border-[var(--line)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/${notice.folder}/${notice.name}.jpg`}
                alt=""
                className="w-16 h-16 rounded-lg object-cover border border-[var(--line)] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--rose)]">선택하신 상품</p>
                <h3 id="notice-title" className="text-lg font-bold text-[var(--navy)] break-keep">
                  {notice.name}
                </h3>
                <p className="text-sm text-[var(--muted)] tabular-nums">{won(notice.price)}~</p>
              </div>
            </div>
            <div className="p-5">
              <p className="rounded-lg bg-[var(--rose-soft)] px-4 py-3 text-[15px] leading-relaxed text-[var(--navy)] break-keep">
                {SITE.priceNotice}
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                대표번호 <span className="font-semibold text-[var(--navy)] tabular-nums">{SITE.phone}</span>
              </p>
              <div className="mt-5 grid grid-cols-[1fr_1.6fr] gap-2">
                <button
                  onClick={() => setNotice(null)}
                  className="h-12 rounded-lg border border-[var(--line)] text-[15px] font-medium text-[var(--muted)] hover:bg-[var(--surface)] transition"
                >
                  취소
                </button>
                <a
                  href={tel}
                  onClick={() => setNotice(null)}
                  autoFocus
                  className="h-12 rounded-lg bg-[var(--rose)] hover:bg-[var(--rose-dark)] text-white text-[15px] font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneIcon className="w-4 h-4" />
                  전화 연결
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
