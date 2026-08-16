/*
 * ستايل "دفتر المراجع العمالي" — Editorial Ledger
 * خلفيات ورقية كريمية، أخضر زيتي للصناعي / أزرق ليلي للتجاري
 * أرقام أقسام ضخمة + شارات VS + حاسبات تفاعلية مع تفصيل الحساب خطوة بخطوة
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Factory,
  Building2,
  Clock,
  Briefcase,
  Syringe,
  Sun,
  Moon,
  FileCheck,
  Coins,
  Landmark,
  HandCoins,
  ChevronDown,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Scale,
  Waves,
  ShieldCheck,
  HardHat,
  Truck,
  Ship,
  Stethoscope,
  Anchor,
  Pill,
  Wheat,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ---------- ألوان العلامة ---------- */
const C = {
  teal: "#1e6f5c",
  tealLight: "#e9f3ef",
  navy: "#1f3a4d",
  navyLight: "#e8eef3",
  amber: "#d4912a",
  amberLight: "#fef5e3",
  cream: "#faf8f4",
};

/* ---------- hook: fade-up عند الظهور ---------- */
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function FadeUp({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`fade-up ${inView ? "in-view" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

function Section({
  num,
  label,
  title,
  children,
  style,
}: {
  num: string;
  label: string;
  title: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24" style={style}>
      {/* رقم الهامش التحريري — يمين الشاشة (حافة القراءة العربية) */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -top-10 right-0 select-none text-[8rem] leading-none font-black opacity-[0.06] md:text-[12rem]"
        style={{ color: C.teal }}
      >
        {num}
      </span>
      <div className="relative">
        <div
          className="mb-10 hidden h-1 w-24 md:block"
          style={{ background: C.amber }}
        />
        <div className="md:flex md:items-end md:justify-between md:gap-8">
          <h2 className="font-display max-w-2xl text-3xl font-extrabold leading-snug md:text-5xl md:leading-[1.15]">
            {title}
          </h2>
          <p
            className="font-mono-ar mt-3 shrink-0 rounded-sm border px-3 py-1.5 text-sm font-semibold tracking-widest md:mt-0"
            style={{ borderColor: C.amber, color: C.amber }}
          >
            {label}
          </p>
        </div>
        <div className="mt-6 h-px w-full" style={{ background: C.teal + "33" }} />
        <FadeUp>{children}</FadeUp>
      </div>
    </section>
  );
}

/* ---------- عدّاد متحرك للنتائج ---------- */
function AnimatedNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    const dur = 350;
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="font-mono-ar">{display.toFixed(decimals)}</span>;
}

/* =================================================================
   الهيرو
================================================================= */
function Hero() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b bg-white/90 py-2 backdrop-blur-xl" : "border-transparent bg-transparent py-4"
        }`}
        style={{ borderColor: scrolled ? "oklch(0.89 0.012 95)" : "transparent" }}
      >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-md border-2"
              style={{ borderColor: C.teal, background: C.tealLight }}
            >
              <img src="/manus-storage/logo_mark_b4337a50.png" alt="شعار الدليل" className="h-9 w-9 object-contain" />
            </div>
            <div className="leading-none">
              <span className="font-display block text-lg font-black tracking-tight" style={{ color: C.teal }}>دليل العمل</span>
              <span className="font-mono-ar block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">مرجع عمالي عملي</span>
            </div>
          </div>
          <nav className="hidden gap-6 md:flex">
            {[
              ["#compare", "الفرق بين المنشآت"],
              ["#hours", "ساعات التواجد"],
              ["#decisions", "قرارات 2025"],
              ["#overtime", "العمل الإضافي"],
              ["#sick", "الإجازة المرضية"],
            ].map(([href, t]) => (
              <a key={href} href={href} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary">
                {t}
              </a>
            ))}
          </nav>
          <a
            href="#overtime"
            className="rounded-full px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
            style={{ backgroundColor: C.teal }}
          >
            جرّب الحاسبة
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden pb-10 pt-32 md:pt-40">
        <img src="/manus-storage/hero_editorial_7f87fe06.png" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, oklch(0.975 0.008 90 / 0.72) 0%, oklch(0.975 0.008 90 / 0.88) 45%, oklch(0.975 0.008 90) 100%)` }}
        />
        <div className="container relative">
          <p className="font-mono-ar mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: C.amberLight, color: C.amber }}>
            دليل عملي مبسط · بدون نصوص قوانين
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-black leading-[1.25] md:text-6xl">
            الفرق بين المنشآت
            <span style={{ color: C.teal }}> الصناعية </span>
            وغير الصناعية
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground md:text-xl">
            ساعات العمل، تعويض العمل الإضافي، والإجازات المرضية — شرح كامل مع أمثلة
            عملية محسوبة خطوة بخطوة، زي ما بيتشرّح في المحاضرة بالظبط.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full px-8 text-base font-bold text-white shadow-lg hover:opacity-95"
              style={{ backgroundColor: C.teal }}
            >
              <a href="#compare" className="flex items-center gap-2">
                ابدأ الشرح <ChevronDown className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-2 bg-white/90 px-8 text-base font-bold backdrop-blur">
              <a href="#overtime">حاسبة الأوفر تايم</a>
            </Button>
          </div>
          <div className="mt-12 grid max-w-3xl grid-cols-3 gap-4">
            {[
              ["7 + 1", "ساعات الصناعي"],
              ["8 + 1", "ساعات التجاري"],
              ["×1.35 / ×1.70", "معاملات الأوفر"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border bg-white/90 p-4 text-center shadow-sm backdrop-blur">
                <p className="font-mono-ar text-lg font-bold md:text-2xl" style={{ color: C.teal }}>{v}</p>
                <p className="mt-1 text-xs text-muted-foreground md:text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* =================================================================
   القسم الأول: الفرق بين المنشآت
================================================================= */
function Compare() {
  return (
    <Section num="01" label="أولاً · التعريف" title="إيه الفرق بين المنشآت الصناعية وغير الصناعية؟">
      <div className="grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* بطاقة صناعية */}
        <div
          className="relative overflow-hidden rounded-lg border-2 bg-white p-7 transition-transform duration-300 hover:-translate-y-1"
          style={{ borderColor: C.teal, boxShadow: "4px 4px 0 0 oklch(0.48 0.08 168 / 0.12)" }}
        >
          <div className="mb-5 flex items-center justify-between rounded-2xl px-5 py-3 text-white" style={{ backgroundColor: C.teal }}>
            <span className="font-display text-xl font-bold">منشآت صناعية</span>
            <Factory className="h-6 w-6" />
          </div>
          <p className="mb-4 leading-relaxed text-foreground/85">
            الأماكن اللي فيها <strong>شغل تصنيع وإنتاج</strong>، يعني فيه تحويل مواد خام لمنتج نهائي.
            زي: مصانع الحديد والصلب، المصانع الغذائية، مصانع السيارات، ومصانع الأدوية.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: C.tealLight }}>
              <Clock className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.teal }} />
              <p>
                <strong>ساعات العمل:</strong> 7 ساعات فعلية + ساعة راحة ={" "}
                <span className="font-mono-ar font-bold" style={{ color: C.teal }}>8 ساعات تواجُد</span>
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: C.tealLight }}>
              <Syringe className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.teal }} />
              <p>
                <strong>الإجازات المرضية:</strong> الشهر الأول أجر كامل 100%، بعدها 8 شهور بـ75%،
                وآخر 3 شهور بدون أجر وبعدها لجنة طبية.
              </p>
            </div>
          </div>
        </div>

        {/* شارة VS */}
        <div className="flex items-center justify-center self-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 bg-white font-display text-lg font-black shadow-md"
            style={{ borderColor: C.amber, color: C.navy }}
          >
            VS
          </div>
        </div>

        {/* بطاقة تجارية */}
        <div
          className="relative overflow-hidden rounded-lg border-2 bg-white p-7 transition-transform duration-300 hover:-translate-y-1"
          style={{ borderColor: C.navy, boxShadow: "4px 4px 0 0 oklch(0.32 0.05 250 / 0.15)" }}
        >
          <div className="mb-5 flex items-center justify-between rounded-2xl px-5 py-3 text-white" style={{ backgroundColor: C.navy }}>
            <span className="font-display text-xl font-bold">منشآت غير صناعية (تجارية)</span>
            <Building2 className="h-6 w-6" />
          </div>
          <p className="mb-4 leading-relaxed text-foreground/85">
            الأماكن اللي <strong>مش فيها تحويل مواد خام</strong>. زي: البنوك، المكاتب،
            الفنادق، المحلات التجارية، والمدارس.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: C.navyLight }}>
              <Clock className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.navy }} />
              <p>
                <strong>ساعات العمل:</strong> 8 ساعات فعلية + ساعة راحة ={" "}
                <span className="font-mono-ar font-bold" style={{ color: C.navy }}>9 ساعات تواجُد</span>
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-xl p-3" style={{ background: C.navyLight }}>
              <Syringe className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.navy }} />
              <p>
                <strong>الإجازات المرضية:</strong> أول 3 شهور بـ75%، ثم ثاني 3 شهور بـ85%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* خلاصة سريعة */}
      <div className="mt-10 grid gap-4 border-t-2 pt-8 md:grid-cols-3" style={{ borderColor: C.teal + "44" }}>
        {[
          { icon: Factory, title: "القاعدة اللي تفكر بيها", text: "لو فيه تصنيع وتحويل مواد = صناعية، حتى لو شكلها مكتب أو مخزن تابع للمصنع.", color: C.teal },
          { icon: Clock, title: "الفرق العملي في اليوم", text: "الصناعي يطلع قبل التجاري بساعة — 8 ساعات تواجُد مقابل 9.", color: C.teal },
          { icon: Briefcase, title: "ليه الفرق ده؟", text: "شغل المصانع شاق وأخطر، فالقانون عوّض الصناعي بساعات أقل وتعويض مرضي أكبر.", color: C.amber },
        ].map(({ icon: Icon, title, text, color }, i) => (
          <FadeUp key={title} delay={i * 70} className="flex flex-col gap-3 rounded-2xl p-5" style={{ background: color === C.teal ? C.tealLight : C.amberLight }}>
            <Icon className="h-6 w-6" style={{ color }} />
            <h3 className="font-display text-lg font-bold">{title}</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}

/* =================================================================
   القسم الثاني: ساعات التواجد
================================================================= */
function Hours() {
  const rows = [
    { type: "صناعية", work: 7, rest: 1, total: 8, color: C.teal },
    { type: "غير صناعية (تجارية)", work: 8, rest: 1, total: 9, color: C.navy },
  ];
  return (
    <Section num="02" label="ثانياً · ساعات التواجد" title="ساعات التواجد اليومية — الحساب سهل" style={{ background: "#fff" }}>
      <div className="overflow-hidden rounded-3xl border shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr style={{ background: C.tealLight }}>
              {["نوع المنشأة", "ساعات العمل الفعلية", "مدة الراحة", "إجمالي التواجُد"].map((h) => (
                <th key={h} className="font-display px-5 py-4 text-sm font-bold" style={{ color: C.teal }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.type} className={`border-t transition-colors hover:bg-secondary ${i === 0 ? "" : ""}`} style={i === 0 ? { background: C.tealLight + "55" } : { background: C.navyLight + "55" }}>
                <td className="px-5 py-4 font-bold">{r.type}</td>
                <td className="px-5 py-4"><span className="font-mono-ar">{r.work}</span> ساعات</td>
                <td className="px-5 py-4"><span className="font-mono-ar">{r.rest}</span> ساعة</td>
                <td className="px-5 py-4">
                  <span className="font-mono-ar rounded-full px-3 py-1 text-sm font-bold text-white" style={{ backgroundColor: r.color }}>
                    {r.total} ساعات
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* شرح شرط الراحة: لا تعمل أكثر من 5 ساعات متصلة */}
      <div className="mt-6 grid gap-4 rounded-2xl border-2 bg-white p-6 md:grid-cols-2" style={{ borderColor: C.amber }}>
            <div className="mb-2 flex items-center gap-2 md:col-span-2">
              <Clock className="h-5 w-5" style={{ color: C.amber }} />
              <h3 className="font-display text-lg font-bold">
                شرط الراحة: لا يجوز العمل أكثر من <span className="font-mono-ar font-black" style={{ color: C.amber }}>5 ساعات متصلة</span> دون راحة
              </h3>
            </div>

            {rows.map((r) => {
              const segments: { hours: number; isLast: boolean; idx: number }[] = [];
              // أقسام الشغل بحد أقصى 5 ساعات متصلة، بعدها راحة 1 ساعة (باستثناء آخر قسم لا يحتاج راحة بعده)
              let remaining = r.work;
              let segIndex = 0;
              while (remaining > 0) {
                const segHours = Math.min(remaining, 5);
                segments.push({ hours: segHours, isLast: remaining - segHours <= 0, idx: segIndex });
                remaining -= segHours;
                segIndex++;
              }
              return (
                <div key={r.type} className="space-y-3">
                  <p className="font-display text-lg font-bold" style={{ color: r.color }}>
                    {r.type}: إجمالي التواجُد <span className="font-mono-ar">{r.total}</span> ساعات
                  </p>
                  {/* المخطط الزمني */}
                  <div className="flex flex-wrap items-stretch gap-2">
                    {segments.map((seg) => (
                      <div key={seg.idx} className="flex flex-1 items-stretch gap-2 min-w-[200px]">
                        <div className="flex flex-1 gap-1">
                          {Array.from({ length: seg.hours }).map((_, i) => (
                            <div
                              key={i}
                              className="h-10 flex-1 rounded-sm text-center text-[11px] font-semibold leading-[2.5rem] text-white"
                              style={{ backgroundColor: r.color }}
                            >
                              شغل
                            </div>
                          ))}
                        </div>
                        {seg.isLast ? null : (
                          <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-sm border-2 border-dashed"
                            style={{ borderColor: C.amber, color: C.amber }}>
                            <span className="text-[10px] font-semibold">راحة</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {r.type === "صناعية"
                      ? "7 ساعات فعلي تُقسَّم على فترتين (5 ساعات ثم 2 ساعة) بينهما ساعة راحة — التواجد الكلي 8 ساعات."
                      : "8 ساعات فعلي تُقسَّم على فترتين (5 ساعات ثم 3 ساعات) بينهما ساعة راحة — التواجد الكلي 9 ساعات في المنشأة."}
                  </p>
                  <p className="font-mono-ar text-xs font-semibold" style={{ color: C.amber }}>
                    {r.type === "صناعية" ? "5 شغل + 1 راحة + 2 شغل = 8 ساعات تواجُد" : "5 شغل + 1 راحة + 3 شغل = 9 ساعات تواجُد"}
                  </p>
                </div>
              );
            })}
          </div>
    </Section>
  );
}

/* =================================================================
   قسم قرارات وزارة العمل 2025
================================================================= */
function Decisions() {
  return (
    <Section num="03" label="القرارات الوزارية · 2025" title="القرارات الوزارية الأربعة الجديدة" style={{ background: "#fff" }}>
      <FadeUp>
        <p className="max-w-3xl text-lg leading-relaxed text-foreground/85">
          في ديسمبر 2025 صدرت أربعة قرارات من وزارة العمل رقم 288 – 289 – 290 – 292،
          وكل قرار بيحكم حاجة معينة في اليوم العملي. هنا ملخص كل قرار مع تطبيقه العملي.
        </p>
      </FadeUp>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {[
          {
            no: "289/2025",
            title: "ساعات العمل في المنشآت الصناعية",
            icon: Factory,
            color: C.teal,
            intro: "لا يجوز تشغيل العامل تشغيلاً فعلياً أكثر من 8 ساعات يومياً و48 ساعة أسبوعياً — وفترات الراحة مش محسوبة منها.",
            detail: (
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• ساعات العمل الفعلية = 8 ساعات يومياً / 48 ساعة أسبوعياً كحد أقصى.</li>
                <li>• فترات الطعام والراحة لا تدخل ضمن ساعات العمل الفعلية.</li>
                <li>• لو عقد العمل أو اللائحة فيه مزايا أفضل للعمال، بتتقيد بالمزايا الأفضل.</li>
                <li>• صاحب العمل يقدر يزيد الساعات لمواجهة ضرورات غير عادية — بضوابط المادة 121 (موافقة وإعلاء الحد).</li>
              </ul>
            ),
            app: "تطبيق عملي: عامل في مصنع حديد شغال من 8 الصبح — أقصى ساعة فعلي يوصلها 4 العصر (مع ساعة راحة)، ولو عدى كده يبقى أوفر تايم ×1.35 أو ×1.70.",
            accTitle: "تفاصيل القرار 289",
            accItems: [
              ["الحد اليومي", "8 ساعات فعلي — لا تدخل فيها الراحة"],
              ["الحد الأسبوعي", "48 ساعة فعلي"],
              ["تجاوز الحد", "بموافقة وفق المادة 121 من قانون العمل"],
            ],
          },
          {
            no: "288/2025",
            title: "العمل دون فترة راحة والأعمال المرهقة",
            icon: Waves,
            color: C.amber,
            intro: "لا يشتغل أي عامل أكثر من 5 ساعات متصلة دون راحة — ومجموع فترات الراحة مش أقل من ساعة.",
            detail: (
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• القاعدة: فترة أو أكثر للراحة/الطعام لا تقل في مجموعها عن ساعة.</li>
                <li>• الاستثناءات: المخابز، المستشفيات، الصيدليات، الموانئ والمطارات، توصيل الطلبات والنقل التشاركي وغيرها (14 فئة).</li>
                <li>• في الاستثناءات: الراحة تتعوض بفترة تعويضية، ومشروبات/أكل خفيف أثناء الشغل، والحد الأقصى المتصل 6 ساعات (5 للسائقين).</li>
                <li>• الأعمال المرهقة (أفران صهر، لحام، دوكو، رصاص، أسبست…) الراحة بتُحسب من ساعات العمل الفعلية.</li>
              </ul>
            ),
            app: "تطبيق عملي: حتى في الاستثناءات، السائق مش هيقود أكتر من 5 ساعات متصلة — والحد المطلق لأي عامل 6 ساعات متصلة مهما كانت الظروف.",
            accTitle: "تفاصيل القرار 288",
            accItems: [
              ["قاعدة الراحة", "راحة ساعة+ يومياً، و5 ساعات عمل متصلة كحد أقصى"],
              ["الحد المطلق المتصل", "6 ساعات في الحالات الاستثنائية — 5 للسائقين"],
              ["الأعمال المرهقة", "راحتها تُحسب من ساعات العمل الفعلية"],
            ],
          },
          {
            no: "290/2025",
            title: "الأعمال المتقطعة بطبيعتها (تواجُد حتى 12 ساعة)",
            icon: Truck,
            color: "#5a4e91",
            intro: "فئات معينة بطبيعة شغلها متقطع — يجوز تواجدها حتى 12 ساعة يومياً، مع أجر إضافي عن الساعات الزائدة.",
            detail: (
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• القاعدة العامة: التواجد لا يتجاوز 10 ساعات يومياً.</li>
                <li>• الأعمال المتقطعة (7 فئات): النقل (مياه/سكك/بر/جو)، مستودعات المحاصيل الزراعية، ربط البواخر وإصلاح السفن، الرعاية الصحية الطارئة، النقل بفترات انتظار بين الرحلات، الدعم الفني الرقمي المتقطع، مراكز البيانات.</li>
                <li>• التزام صاحب العمل بأجر إضافي عن الساعات الزائدة عن الأصلية (مادة 121).</li>
                <li>• إلزام صاحب العمل بسجل ورقي أو إلكتروني يرصد ساعات العمل الأصلية والإضافية والراحة والتواجد.</li>
              </ul>
            ),
            app: "تطبيق عملي: سائق نقل ركاب بطبيعته شغله متقطع — يجوز يتواجد 12 ساعة، لكن ساعات شغله الفعلية هي اللي بتتحسب أوفر تايم — والسجل الورقي إلزامي لو اتجاوز 10 ساعات.",
            accTitle: "تفاصيل القرار 290",
            accItems: [
              ["الحد العام للتواجد", "10 ساعات يومياً"],
              ["حد الأعمال المتقطعة", "12 ساعة يومياً"],
              ["الساعات الزائدة", "أجر إضافي + سجل ورقي/إلكتروني إلزامي"],
            ],
          },
          {
            no: "292/2025",
            title: "التجهيزية والتكميلية والحراسة والنظافة",
            icon: ShieldCheck,
            color: C.navy,
            intro: "أعمال التحضير والتشغيل بعد الورد والحراسة والنظافة لها نظام خاص: 48 ساعة أسبوعياً وأضافي 12 ساعة بحد أقصى ساعتين يومياً.",
            detail: (
              <ul className="space-y-2 text-sm leading-relaxed">
                <li>• التجهيزية: تجهيز الماكينات والأفران والمواد الخام وبيئة العمل قبل بدء الورود.</li>
                <li>• التكميلية: صيانة خلل مفاجئ، أعمال لا يجوز وقفها (بترول، طاقة، مراكز بيانات)، إتمام شحن/تفريغ، إنهاء عمليات.</li>
                <li>• الحراسة: الخفراء، الإطفاء، أنظمة الأمن والمراقبة الإلكترونية والسيبرانية.</li>
                <li>• النظافة: تنظيف وتعقيم الأماكن قبل الشغل أو بعده.</li>
              </ul>
            ),
            app: "تطبيق عملي: حارس أمن في شركة: 48 ساعة فعلي أسبوعياً + إضافي 12 ساعة كحد أقصى (ساعتين يومياً) — لو عدى الساعتين دول، التجاوز مش مشروع إلا بقرار استثنائي.",
            accTitle: "تفاصيل القرار 292",
            accItems: [
              ["الحد الأسبوعي الفعلي", "48 ساعة فعلي"],
              ["حد الأوفر تايم الأسبوعي", "12 ساعة أسبوعياً"],
              ["حد الأوفر تايم اليومي", "ساعتان كحد أقصى يومياً"],
            ],
          },
        ].map((d, i) => {
          const Icon = d.icon;
          return (
            <FadeUp key={d.no} delay={i * 70} className="flex flex-col rounded-3xl border-2 bg-white p-6 transition-transform duration-300 hover:-translate-y-1" style={{ borderColor: d.color }}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ backgroundColor: d.color }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold">{d.title}</p>
                    <span className="font-mono-ar text-xs font-bold tracking-widest" style={{ color: d.color }}>قرار رقم {d.no}</span>
                  </div>
                </div>
              </div>
              <p className="mb-3 leading-relaxed text-foreground/85">{d.intro}</p>
              {d.detail}
              <div className="mt-3 rounded-2xl p-3 text-sm font-semibold leading-relaxed" style={{ background: d.color + "15", color: d.color }}>
                {d.app}
              </div>
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value={d.no}>
                  <AccordionTrigger className="px-1 text-sm font-bold" style={{ color: d.color }}>
                    {d.accTitle} — جدول النقاط
                  </AccordionTrigger>
                  <AccordionContent className="px-1">
                    <table className="w-full text-right text-sm">
                      <tbody>
                        {d.accItems.map(([k, v]) => (
                          <tr key={k} className="border-b last:border-0">
                            <td className="py-1.5 pr-1 font-semibold text-muted-foreground">{k}</td>
                            <td className="py-1.5 pr-1">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </FadeUp>
          );
        })}
      </div>
      <FadeUp className="mt-8 flex items-start gap-3 rounded-3xl border-2 p-5 text-sm leading-relaxed" style={{ borderColor: C.teal, background: C.tealLight }}>
        <Scale className="mt-0.5 h-6 w-6 shrink-0" style={{ color: C.teal }} />
        <p>
          <strong>ملاحظة منهجية:</strong> هذه القرارات صدرت بعد المحاضرة، وهي بتحدّث الحد اليومي للمنشآت الصناعية
          إلى 8 ساعات فعلي (قرار 289). في الدليل ده بقينا على منهج المحاضرة (7 فعلي + 1 راحة = 8 تواجُد)،
          والقرارات الجديدة موضحة فوق عشان تعرف آخر تحديث.
        </p>
      </FadeUp>
    </Section>
  );
}

/* =================================================================
   القسم الثالث: الأوفر تايم
================================================================= */
/* أنواع المنشآت وأحكامها في الأوفر تايم */
const ESTABLISHMENTS = [
  {
    value: "industrial",
    label: "منشأة صناعية",
    color: C.teal,
    note: "قرار 289/2025: 8 ساعات فعلية كحد أقصى يومياً، 48 أسبوعياً",
    maxDaily: 8,
    maxWeekly: 48,
    dailyOvertimeCap: null,
    weeklyOvertimeCap: null,
  },
  {
    value: "commercial",
    label: "منشأة غير صناعية (تجارية)",
    color: C.navy,
    note: "8 ساعات فعلية + ساعة راحة = 9 ساعات تواجُد يومياً",
    maxDaily: 8,
    maxWeekly: 48,
    dailyOvertimeCap: null,
    weeklyOvertimeCap: null,
  },
  {
    value: "intermittent",
    label: "عمل متقطع بطبيعته",
    color: "#5a4e91",
    note: "قرار 290/2025: تواجُد حتى 12 ساعة، مع أجر إضافي عن الزيادة",
    maxDaily: 12,
    maxWeekly: null,
    dailyOvertimeCap: null,
    weeklyOvertimeCap: null,
  },
  {
    value: "prep",
    label: "تجهيزية / حراسة / نظافة",
    color: C.amber,
    note: "قرار 292/2025: 48 ساعة فعلي أسبوعياً، إضافي 12 أسبوعياً بحد أقصى ساعتين/يوم",
    maxDaily: 8,
    maxWeekly: 48,
    dailyOvertimeCap: 2,
    weeklyOvertimeCap: 12,
  },
] as const;

type EstKey = (typeof ESTABLISHMENTS)[number]["value"];

function Overtime() {
  const [salary, setSalary] = useState(8000);
  const [estKey, setEstKey] = useState<EstKey>("industrial");
  const [dayHours, setDayHours] = useState(2);
  const [nightHours, setNightHours] = useState(1);

  const est = ESTABLISHMENTS.find((e) => e.value === estKey) ?? ESTABLISHMENTS[0];

  // قيمة الساعة = الأجر الشهري ÷ 26 يوم عمل ÷ 8 ساعات
  const rate = salary / 26 / 8;

  const totalExtra = dayHours + nightHours;
  const dayCapHit = est.dailyOvertimeCap !== null && dayHours > est.dailyOvertimeCap;
  const weekCapHit = est.weeklyOvertimeCap !== null && totalExtra > est.weeklyOvertimeCap;

  const dayComp = dayHours * rate * 1.35;
  const nightComp = nightHours * rate * 1.7;
  const total = dayComp + nightComp;

  return (
    <Section num="03" label="ثالثاً · العمل الإضافي" title="تعويض الأوفر تايم — النهار غير الليل">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* شرح المعادلة */}
        <FadeUp className="space-y-6">
          <div className="overflow-hidden rounded-3xl shadow-md">
            <img src="/manus-storage/illust_overtime_ef0dd9d8.png" alt="توضيح العمل الإضافي" className="h-52 w-full object-cover md:h-64" />
          </div>
          <p className="leading-relaxed text-foreground/85">
            لو موظف خلّص ورده الرسمي وفضّل شغال، ده اسمه <strong>عمل إضافي</strong>،
            ولكل ساعة فيه معاملة زيادة فوق قيمة الساعة الأساسية — والمعاملة بتفرق
            حسب وقت الشغل.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border-2 p-4" style={{ borderColor: C.teal, background: C.tealLight }}>
              <Sun className="h-9 w-9 shrink-0" style={{ color: C.teal }} />
              <div>
                <p className="font-display font-bold">النهار (قبل 6م)</p>
                <p className="font-mono-ar text-2xl font-black" style={{ color: C.teal }}>× 1.35</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border-2 p-4" style={{ borderColor: C.navy, background: C.navyLight }}>
              <Moon className="h-9 w-9 shrink-0" style={{ color: C.navy }} />
              <div>
                <p className="font-display font-bold">الليل (بعد 6م)</p>
                <p className="font-mono-ar text-2xl font-black" style={{ color: C.navy }}>× 1.70</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-4 text-sm leading-relaxed" style={{ background: C.amberLight }}>
            <div className="mb-2 flex items-center gap-2 font-bold" style={{ color: C.amber }}>
              <AlertTriangle className="h-4 w-4" /> نقطة فاصلة مهمة
            </div>
            الساعة 6م هي خط الفاصل: أي ساعة شغل قبلها تُحتسب نهارية ×1.35، وأي
            ساعة بعدها تُحتسب ليلية ×1.70. لو الشغل الإضافي عجّز خط الـ6م يبقى
            بتقسمه نص نص.
          </div>
        </FadeUp>

        {/* الحاسبة */}
        <FadeUp delay={120} className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <Coins className="h-6 w-6" style={{ color: C.teal }} />
            <h3 className="font-display text-xl font-bold">حاسبة الأوفر تايم — جرّب بأرقامك</h3>
          </div>
          <div className="space-y-5">
            <div>
              <Label className="mb-2 block font-semibold">الأجر الشهري (جنيه): <span className="font-mono-ar">{salary} جنيه</span></Label>
              <Slider value={[salary]} min={2000} max={40000} step={250} onValueChange={(v) => setSalary(v[0])} style={{ accentColor: C.teal }} />
            </div>
            <div>
              <Label className="mb-2 block font-semibold">نوع المنشأة / طبيعة العمل</Label>
              <Select value={estKey} onValueChange={(v) => setEstKey(v as EstKey)}>
                <SelectTrigger className="w-full bg-white text-right">
                  <SelectValue placeholder="اختر نوع المنشأة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  {ESTABLISHMENTS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-2 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed" style={{ background: est.color + "18", color: est.color }}>
                <FileCheck className="mt-0.5 h-4 w-4 shrink-0" />
                {est.note}
              </p>
              <p className="mt-2 rounded-xl border bg-white p-3 text-center text-sm" style={{ borderColor: C.amber, background: C.amberLight }}>
                قيمة الساعة = {salary} ÷ 26 يوم ÷ 8 ساعات ={" "}
                <span className="font-mono-ar font-black" style={{ color: est.color }}>{rate.toFixed(2)} جنيه/ساعة</span>
              </p>
            </div>
            <div>
              <Label className="mb-2 block font-semibold">ساعات نهارية (بعد نهاية الورد + قبل 6م): <span className="font-mono-ar">{dayHours} ساعة</span></Label>
              <Slider value={[dayHours]} min={0} max={8} step={0.5} onValueChange={(v) => setDayHours(v[0])} style={{ accentColor: C.teal }} />
            </div>
            <div>
              <Label className="mb-2 block font-semibold">ساعات ليلية (بعد 6م): <span className="font-mono-ar">{nightHours} ساعة</span></Label>
              <Slider value={[nightHours]} min={0} max={8} step={0.5} onValueChange={(v) => setNightHours(v[0])} style={{ accentColor: C.navy }} />
            </div>

            {/* تنبيهات حدود الإضافي */}
            {(dayCapHit || weekCapHit) && (
              <div className="flex items-start gap-2 rounded-xl border-2 p-3 text-sm font-semibold leading-relaxed" style={{ borderColor: C.amber, background: C.amberLight, color: C.amber }}>
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  {dayCapHit &&
                    `في الأعمال التجهيزية والحراسة والنظافة (قرار 292/2025) الحد الأقصى للإضافي ساعتان في اليوم الواحد — وأنت أدخلت ${dayHours} ساعة نهارية.`}
                  {" "}
                  {weekCapHit &&
                    `مجموع ساعاتك الإضافية (${totalExtra.toFixed(1)}) تجاوز الحد الأسبوعي ${est.weeklyOvertimeCap} ساعة المقررة بقرار 292/2025.`}
                </span>
              </div>
            )}

            {/* تفصيل الحساب */}
            <div className="space-y-2 rounded-2xl border p-4 text-sm" style={{ background: C.cream }}>
              <p className="font-semibold text-muted-foreground">الحساب خطوة بخطوة:</p>
              <p>
                <span className="font-mono-ar">{dayHours}</span> ساعة نهارية × {rate.toFixed(2)} جنيه × 1.35 ={" "}
                <span className="font-mono-ar font-bold" style={{ color: C.teal }}>{dayComp.toFixed(2)}</span> جنيه
              </p>
              <p>
                <span className="font-mono-ar">{nightHours}</span> ساعة ليلية × {rate.toFixed(2)} جنيه × 1.70 ={" "}
                <span className="font-mono-ar font-bold" style={{ color: C.navy }}>{nightComp.toFixed(2)}</span> جنيه
              </p>
            </div>

            <div className="flex items-center justify-between rounded-2xl px-5 py-4 text-white shadow-md" style={{ background: C.teal }}>
              <span className="font-display font-bold">التعويض المستحق:</span>
              <span className="font-mono-ar text-2xl font-black">
                <AnimatedNumber value={total} /> جنيه
              </span>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* مثال خالد */}
      <FadeUp className="mt-10 rounded-3xl border-2 p-6 md:p-8" style={{ borderColor: C.navy }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-black text-white" style={{ background: C.navy }}>
            خ
          </div>
          <h3 className="font-display text-xl font-bold">المثال التطبيقي: الأستاذ خالد</h3>
          <span className="font-mono-ar rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: C.amber }}>
            مثال المحاضرة
          </span>
        </div>
        <p className="mt-4 leading-relaxed text-foreground/85">
          ورد الأستاذ خالد الرسمي بيخلص الساعة 4م، واتفضل شغال لحد 7م. قيمة ساعته
          الأساسية 100 جنيه. الفترة من 4م لـ6م نهارية، ومن 6م لـ7م ليلية:
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl p-4 text-center" style={{ background: C.tealLight }}>
            <p className="text-sm text-muted-foreground">نهاري (4م → 6م)</p>
            <p className="font-mono-ar mt-1 text-xl font-black" style={{ color: C.teal }}>2 × 100 × 1.35 = 270</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: C.navyLight }}>
            <p className="text-sm text-muted-foreground">ليلي (6م → 7م)</p>
            <p className="font-mono-ar mt-1 text-xl font-black" style={{ color: C.navy }}>1 × 100 × 1.70 = 170</p>
          </div>
          <div className="rounded-2xl p-4 text-center text-white" style={{ background: C.teal }}>
            <p className="text-sm opacity-90">الإجمالي</p>
            <p className="font-mono-ar mt-1 text-xl font-black">270 + 170 = 440 جنيه</p>
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}

/* =================================================================
   القسم الرابع: الإجازة المرضية
================================================================= */
function SickLeave() {
  const [wage, setWage] = useState(8000);
  const [months, setMonths] = useState(1);
  const [kind, setKind] = useState<"industrial" | "commercial">("industrial");

  const detail = useMemo(() => {
    let total = 0;
    const steps: { label: string; amount: number; pct: string }[] = [];
    if (kind === "industrial") {
      // صناعية: الشهر الأول 100%، ثم 8 شهور بـ75%، بعدها بدون أجر + لجنة طبية
      if (months >= 1) {
        total += wage;
        steps.push({ label: "الشهر الأول", amount: wage, pct: "100%" });
      }
      const rest = Math.min(months - 1, 8);
      if (rest > 0) {
        const sub = rest * wage * 0.75;
        total += sub;
        steps.push({ label: `الشهور 2 حتى ${Math.min(9, months)}`, amount: sub, pct: "75%" });
      }
      if (months > 9) {
        steps.push({ label: "بعد الشهر التاسع", amount: 0, pct: "بدون أجر — لجنة طبية" });
      }
    } else {
      // تجارية: أول 3 شهور 75%، ثاني 3 شهور 85%
      const first = Math.min(months, 3);
      const second = Math.min(Math.max(months - 3, 0), 3);
      if (first > 0) {
        const sub = first * wage * 0.75;
        total += sub;
        steps.push({ label: `أول ${first} ${first === 1 ? "شهر" : "شهور"}`, amount: sub, pct: "75%" });
      }
      if (second > 0) {
        const sub = second * wage * 0.85;
        total += sub;
        steps.push({ label: `الشهور 4 حتى ${Math.min(6, months)}`, amount: sub, pct: "85%" });
      }
      if (months > 6) {
        steps.push({ label: "بعد الشهر السادس", amount: 0, pct: "ينتهي الحق في التعويض" });
      }
    }
    return { total, steps };
  }, [wage, months, kind]);

  const kindColor = kind === "industrial" ? C.teal : C.navy;
  const kindName = kind === "industrial" ? "منشأة صناعية" : "منشأة تجارية";

  return (
    <Section num="04" label="رابعاً · الإجازة المرضية" title="الإجازة المرضية — حسب نوع المنشأة">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* الشريط الزمني */}
        <FadeUp className="space-y-6">
          <p className="leading-relaxed text-foreground/85">
            لو موظف أتصاب بمرض وخلّى إجازة مرضية، التأمينات الاجتماعية بتصرف له تعويض
            عن أجره بنسب مختلفة حسب مدة الإجازة — ونسب التعويض بتختلف بين المنشآت
            الصناعية والتجارية.
          </p>
          {kind === "industrial" ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: C.teal, background: C.tealLight }}>
                <div className="font-mono-ar mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white" style={{ background: C.teal }}>1</div>
                <p className="font-display font-bold">الشهر الأول</p>
                <p className="font-mono-ar mt-1 text-3xl font-black" style={{ color: C.teal }}>100%</p>
                <p className="mt-1 text-xs text-muted-foreground">أجر كامل</p>
              </div>
              <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: C.navy, background: C.navyLight }}>
                <div className="font-mono-ar mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white" style={{ background: C.navy }}>2</div>
                <p className="font-display font-bold">الشهور 2 – 9</p>
                <p className="font-mono-ar mt-1 text-3xl font-black" style={{ color: C.navy }}>75%</p>
                <p className="mt-1 text-xs text-muted-foreground">بحد أقصى 8 شهور</p>
              </div>
              <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: C.amber, background: C.amberLight }}>
                <div className="font-mono-ar mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white" style={{ background: C.amber }}>3</div>
                <p className="font-display font-bold">بعد ذلك</p>
                <p className="font-display mt-1 text-lg font-bold" style={{ color: C.amber }}>بدون أجر</p>
                <p className="mt-1 text-xs text-muted-foreground">ثم قرار اللجنة الطبية</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: C.navy, background: C.navyLight }}>
                <div className="font-mono-ar mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white" style={{ background: C.navy }}>1</div>
                <p className="font-display font-bold">أول 3 شهور</p>
                <p className="font-mono-ar mt-1 text-3xl font-black" style={{ color: C.navy }}>75%</p>
                <p className="mt-1 text-xs text-muted-foreground">من الأجر</p>
              </div>
              <div className="rounded-2xl border-2 p-5 text-center" style={{ borderColor: C.amber, background: C.amberLight }}>
                <div className="font-mono-ar mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-black text-white" style={{ background: C.amber }}>2</div>
                <p className="font-display font-bold">الشهور 4 – 6</p>
                <p className="font-mono-ar mt-1 text-3xl font-black" style={{ color: C.amber }}>85%</p>
                <p className="mt-1 text-xs text-muted-foreground">بعد كده ينتهي التعويض</p>
              </div>
            </div>
          )}
          <div className="overflow-hidden rounded-3xl shadow-md">
            <img src="/manus-storage/illust_sick_leave_afd77f1c.png" alt="توضيح الإجازة المرضية" className="h-48 w-full object-cover md:h-56" />
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 font-display font-bold" style={{ color: C.teal }}>
              <ClipboardList className="h-5 w-5" /> إجراءات المطالبة للتأمينات
            </div>
            <ol className="space-y-3">
              {[
                "تقديم شهادة مرضية معتمدة من الجهة الطبية.",
                "إخطار صاحب العمل وتحرير نموذج الإجازة المرضية.",
                "إخطار مكتب التأمينات الاجتماعية التابع للمنشأة.",
                "التأمينات بتصرف التعويض للموظف بالنسب المذكورة فوق.",
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-3 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.teal }} />
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </FadeUp>

        {/* حاسبة أحمد */}
        <FadeUp delay={120} className="space-y-5">
          <div className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full font-display text-base font-black text-white" style={{ background: C.teal }}>أ</div>
              <div>
                <h3 className="font-display text-xl font-bold">مثال الموظف أحمد</h3>
                <p className="text-sm text-muted-foreground">أجر تأميني 8000 جنيه — حرّك وشوف النتيجة</p>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block font-semibold">الأجر التأميني الشهري: <span className="font-mono-ar">{wage} جنيه</span></Label>
                <Slider value={[wage]} min={2000} max={20000} step={500} onValueChange={(v) => setWage(v[0])} style={{ accentColor: C.teal }} />
              </div>
              <div>
                <Label className="mb-2 block font-semibold">نوع المنشأة</Label>
                <Select value={kind} onValueChange={(v) => setKind(v as "industrial" | "commercial")}>
                  <SelectTrigger className="w-full bg-white text-right">
                    <SelectValue placeholder="اختر نوع المنشأة" />
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    <SelectItem value="industrial">منشأة صناعية</SelectItem>
                    <SelectItem value="commercial">منشأة غير صناعية (تجارية)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block font-semibold">مدة الإجازة المرضية: <span className="font-mono-ar">{months} شهر</span></Label>
                <Slider value={[months]} min={1} max={12} step={1} onValueChange={(v) => setMonths(v[0])} style={{ accentColor: C.teal }} />
              </div>
              <div className="space-y-2 rounded-2xl border p-4 text-sm" style={{ background: C.cream }}>
                <p className="font-semibold text-muted-foreground">التفصيل:</p>
                {detail.steps.map((s: { label: string; amount: number; pct: string }) => (
                  <p key={s.label}>
                    {s.label} ({s.pct}): <span className="font-mono-ar font-bold">{s.amount.toFixed(0)}</span> جنيه
                  </p>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                النظام المطبق: <strong style={{ color: kindColor }}>{kindName}</strong> —
                {kind === "industrial"
                  ? " الشهر الأول 100% ثم 75% لحد 9 شهور"
                  : " أول 3 شهور 75% ثم 85% لحد 6 شهور"}
              </p>
              <div className="flex items-center justify-between rounded-2xl px-5 py-4 text-white shadow-md" style={{ background: kindColor }}>
                <span className="font-display font-bold">إجمالي التعويض:</span>
                <span className="font-mono-ar text-2xl font-black">
                  <AnimatedNumber value={detail.total} decimals={0} /> جنيه
                </span>
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible className="rounded-3xl border bg-white shadow-sm">
            <AccordionItem value="q1">
              <AccordionTrigger className="px-5 font-bold">لماذا الشهر الأول 100%؟</AccordionTrigger>
              <AccordionContent className="px-5 text-sm leading-relaxed">
                أول شهر بيكون في بداية المرض والقرار الطبي مش واضع بعد، فالقانون
                ضمن للمريض أجره الكامل حتى يقدّر وضعه الصحي. من الشهر الثاني بتقل
                النسبة لـ75% لأن التعويض بقى على عاتق التأمينات.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="px-5 font-bold">إيه دور اللجنة الطبية؟</AccordionTrigger>
              <AccordionContent className="px-5 text-sm leading-relaxed">
                لو الإجازة اتعدت تسعة شهور، بيحصل تحويل للموظف على المعاش المرضي أو
                يتقرر إنه قدر يرجع شغله، وده حسب حالة المريض الصحية اللي بتقررها
                اللجنة الطبية المختصة.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="px-5 font-bold">التجاري يعوَّض إزاي؟</AccordionTrigger>
              <AccordionContent className="px-5 text-sm leading-relaxed">
                في المنشآت غير الصناعية (التجارية) المعادلة مختلفة خالص: أول 3 شهور
                بـ75% من الأجر، وثاني 3 شهور بـ85%. مفيش شهر بأجر كامل، ومفيش مرحلة
                8 شهور — النظام أقصر وأقل تعويضًا.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FadeUp>
      </div>
    </Section>
  );
}

/* =================================================================
   قسم المقارنة الشاملة + الفوتر
================================================================= */
function Summary() {
  const rows = [
    { item: "طبيعة النشاط", ind: "تصنيع وتحويل مواد خام", com: "خدمة وتجارة بدون تحويل مواد" },
    { item: "ساعات العمل الفعلية", ind: "7 ساعات", com: "8 ساعات" },
    { item: "ساعة الراحة", ind: "1 ساعة", com: "1 ساعة" },
    { item: "إجمالي التواجُد اليومي", ind: "8 ساعات", com: "9 ساعات" },
    { item: "الشهر الأول مرضي", ind: "100% من الأجر", com: "75% من الأجر" },
    { item: "المراحل التالية", ind: "8 شهور بـ75% ثم بدون أجر", com: "3 شهور بـ85%" },
    { item: "معامل الأوفر تايم", ind: "نهار ×1.35 / ليل ×1.70", com: "نهار ×1.35 / ليل ×1.70" },
  ];
  return (
    <section className="py-16" style={{ background: "#fff" }}>
      <div className="container">
        <FadeUp>
          <p className="font-mono-ar mb-2 text-sm font-semibold tracking-widest" style={{ color: C.amber }}>
            الخلاصة · جدول واحد يرجعلك كله
          </p>
          <h2 className="font-display mb-8 max-w-2xl text-3xl font-extrabold leading-snug md:text-4xl">
            المقارنة الشاملة في لمحة
          </h2>
        </FadeUp>
        <FadeUp className="overflow-hidden rounded-3xl border shadow-sm">
          <table className="w-full text-right">
            <thead>
              <tr>
                <th className="font-display px-5 py-4 text-sm font-bold text-muted-foreground">البند</th>
                <th className="font-display px-5 py-4 text-sm font-bold text-white" style={{ background: C.teal }}>صناعية</th>
                <th className="font-display px-5 py-4 text-sm font-bold text-white" style={{ background: C.navy }}>غير صناعية (تجارية)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.item} className={`border-t text-sm ${i % 2 === 0 ? "bg-secondary/60" : "bg-white"}`}>
                  <td className="px-5 py-3 font-semibold">{r.item}</td>
                  <td className="px-5 py-3" style={{ background: C.tealLight + "66" }}>{r.ind}</td>
                  <td className="px-5 py-3" style={{ background: C.navyLight + "66" }}>{r.com}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </FadeUp>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="container flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
        <img src="/manus-storage/logo_mark_b4337a50.png" alt="" className="h-9 w-9 object-contain" />
        <p>دليل عملي للفرق بين المنشآت الصناعية وغير الصناعية — ساعات العمل، الأوفر تايم، والإجازات المرضية.</p>
        <p className="font-mono-ar text-xs">بدون أرقام مواد قانونية · للأمثلة التعليمية فقط</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen paper-grain" style={{ background: C.cream }}>
      <Hero />
      <div id="compare" className="container">
        <Compare />
      </div>
      <div id="hours" style={{ background: "#fff" }}>
        <div className="container">
          <Hours />
        </div>
      </div>
      <div id="decisions" style={{ background: "#fff" }}>
        <div className="container">
          <Decisions />
        </div>
      </div>
      <div id="overtime" className="container">
        <Overtime />
      </div>
      <div id="sick" style={{ background: "#fff" }}>
        <div className="container">
          <SickLeave />
        </div>
      </div>
      <Summary />
      <Footer />
    </div>
  );
}
