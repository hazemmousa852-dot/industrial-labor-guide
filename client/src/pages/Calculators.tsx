/**
 * ستايل "دفتر المراجع العمالي" — Editorial Ledger
 * صفحة الحاسبات المستقلة: الأوفر تايم + الإجازة المرضية — بدون أي شرح تعليمي
 * خلفيات ورقية كريمية، أخضر زيتي للصناعي / أزرق ليلي للتجاري
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Coins,
  FileCheck,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

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

/* ---------- عدّاد متحرك للنتائج ---------- */
function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
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
   أنواع المنشآت وأحكامها
================================================================= */
const ESTABLISHMENTS = [
  {
    value: "industrial",
    label: "منشأة صناعية",
    color: C.teal,
    note: "قرار 289/2025: 8 ساعات فعلية كحد أقصى يومياً، 48 أسبوعياً",
    maxDaily: 8,
    maxWeekly: 48,
    dailyOvertimeCap: null as number | null,
    weeklyOvertimeCap: null as number | null,
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

/* =================================================================
   حاسبة الأوفر تايم
================================================================= */
function OvertimeCalculator() {
  const [salary, setSalary] = useState(8000);
  const [estKey, setEstKey] = useState<EstKey>("industrial");
  const [dayHours, setDayHours] = useState(2);
  const [nightHours, setNightHours] = useState(1);

  const est = ESTABLISHMENTS.find((e) => e.value === estKey) ?? ESTABLISHMENTS[0];
  const rate = salary / 26 / 8;
  const totalExtra = dayHours + nightHours;
  const dayCapHit = est.dailyOvertimeCap !== null && dayHours > est.dailyOvertimeCap;
  const weekCapHit = est.weeklyOvertimeCap !== null && totalExtra > est.weeklyOvertimeCap;

  const dayComp = dayHours * rate * 1.35;
  const nightComp = nightHours * rate * 1.7;
  const total = dayComp + nightComp;

  return (
    <div className="rounded-3xl border-2 bg-white p-6 shadow-sm md:p-8" style={{ borderColor: C.teal }}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: C.teal }}>
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">حاسبة العمل الإضافي (الأوفر تايم)</h3>
          <p className="text-sm text-muted-foreground">معاملات: النهار ×1.35 — الليل ×1.70 (الفاصل الساعة 6م)</p>
        </div>
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
          <Label className="mb-2 block font-semibold">ساعات نهارية (بعد نهاية الورد وقبل 6م): <span className="font-mono-ar">{dayHours} ساعة</span></Label>
          <Slider value={[dayHours]} min={0} max={8} step={0.5} onValueChange={(v) => setDayHours(v[0])} style={{ accentColor: C.teal }} />
        </div>
        <div>
          <Label className="mb-2 block font-semibold">ساعات ليلية (بعد 6م): <span className="font-mono-ar">{nightHours} ساعة</span></Label>
          <Slider value={[nightHours]} min={0} max={8} step={0.5} onValueChange={(v) => setNightHours(v[0])} style={{ accentColor: C.navy }} />
        </div>

        {(dayCapHit || weekCapHit) && (
          <div className="flex items-start gap-2 rounded-xl border-2 p-3 text-sm font-semibold leading-relaxed" style={{ borderColor: C.amber, background: C.amberLight, color: C.amber }}>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              {dayCapHit &&
                `في الأعمال التجهيزية والحراسة والنظافة (قرار 292/2025) الحد الأقصى للإضافي ساعتان في اليوم — وأنت أدخلت ${dayHours} ساعة نهارية.`}
              {" "}
              {weekCapHit &&
                `مجموع الساعات الإضافية (${totalExtra.toFixed(1)}) تجاوز الحد الأسبوعي ${est.weeklyOvertimeCap} ساعة بقرار 292/2025.`}
            </span>
          </div>
        )}

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
    </div>
  );
}

/* =================================================================
   حاسبة الإجازة المرضية
================================================================= */
type SickKind = "industrial" | "commercial";

function SickLeaveCalculator() {
  const [wage, setWage] = useState(8000);
  const [months, setMonths] = useState(1);
  const [kind, setKind] = useState<SickKind>("industrial");

  const detail = useMemo(() => {
    let total = 0;
    const steps: { label: string; amount: number; pct: string }[] = [];
    if (kind === "industrial") {
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
    <div className="rounded-3xl border-2 bg-white p-6 shadow-sm md:p-8" style={{ borderColor: C.navy }}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: C.navy }}>
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">حاسبة الإجازة المرضية</h3>
          <p className="text-sm text-muted-foreground">التعويض عن أجر الإجازة من التأمينات الاجتماعية</p>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <Label className="mb-2 block font-semibold">الأجر التأميني الشهري: <span className="font-mono-ar">{wage} جنيه</span></Label>
          <Slider value={[wage]} min={2000} max={20000} step={500} onValueChange={(v) => setWage(v[0])} style={{ accentColor: C.teal }} />
        </div>
        <div>
          <Label className="mb-2 block font-semibold">نوع المنشأة</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as SickKind)}>
            <SelectTrigger className="w-full bg-white text-right">
              <SelectValue placeholder="اختر نوع المنشأة" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="industrial">منشأة صناعية — الشهر الأول 100% ثم 75% لحد 9 شهور</SelectItem>
              <SelectItem value="commercial">منشأة تجارية — أول 3 شهور 75% ثم 85% لحد 6 شهور</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block font-semibold">مدة الإجازة المرضية: <span className="font-mono-ar">{months} شهر</span></Label>
          <Slider value={[months]} min={1} max={12} step={1} onValueChange={(v) => setMonths(v[0])} style={{ accentColor: C.teal }} />
        </div>

        {kind === "industrial" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.teal, background: C.tealLight }}>
              <p className="font-display text-sm font-bold">الشهر الأول</p>
              <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.teal }}>100%</p>
            </div>
            <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.navy, background: C.navyLight }}>
              <p className="font-display text-sm font-bold">الشهور 2 – 9</p>
              <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.navy }}>75%</p>
            </div>
            <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.amber, background: C.amberLight }}>
              <p className="font-display text-sm font-bold">بعد ذلك</p>
              <p className="font-display mt-1 text-sm font-bold" style={{ color: C.amber }}>بدون أجر</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.navy, background: C.navyLight }}>
              <p className="font-display text-sm font-bold">أول 3 شهور</p>
              <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.navy }}>75%</p>
            </div>
            <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.amber, background: C.amberLight }}>
              <p className="font-display text-sm font-bold">الشهور 4 – 6</p>
              <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.amber }}>85%</p>
            </div>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border p-4 text-sm" style={{ background: C.cream }}>
          <p className="font-semibold text-muted-foreground">التفصيل:</p>
          {detail.steps.map((s) => (
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
            <AnimatedNumber value={detail.total} /> جنيه
          </span>
        </div>
      </div>
    </div>
  );
}

/* =================================================================
   الصفحة
================================================================= */
export default function Calculators() {
  return (
    <div className="min-h-screen paper-grain" style={{ background: C.cream }}>
      {/* شريط علوي بسيط */}
      <header className="border-b bg-white/90 py-4 backdrop-blur-xl">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md border-2" style={{ borderColor: C.teal, background: C.tealLight }}>
              <img src="/manus-storage/logo_mark_b4337a50.png" alt="شعار الدليل" className="h-9 w-9 object-contain" />
            </div>
            <div className="leading-none">
              <span className="font-display block text-lg font-black tracking-tight" style={{ color: C.teal }}>حاسبات دليل العمل</span>
              <span className="font-mono-ar block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">أوفر تايم · إجازة مرضية</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors hover:bg-white" style={{ borderColor: C.teal, color: C.teal }}>
              <ArrowRight className="h-4 w-4" />
              ارجع للدليل
            </Link>
          </nav>
        </div>
      </header>

      <main className="container pb-20 pt-10">
        <div className="mb-10">
          <p className="font-mono-ar mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: C.amberLight, color: C.amber }}>
            أدوات حسابية · جرّب بأرقامك
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-black leading-[1.25] md:text-5xl">
            حاسبات <span style={{ color: C.teal }}>الأجر الإضافي</span> والإجازة المرضية
          </h1>
        </div>

        <div className="space-y-10">
          <div id="overtime">
            <OvertimeCalculator />
          </div>
          <div id="sick">
            <SickLeaveCalculator />
          </div>
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-3xl border-2 p-5 text-sm leading-relaxed" style={{ borderColor: C.teal, background: C.tealLight }}>
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" style={{ color: C.teal }} />
          <p>
            هذه الحاسبات لأغراض تعليمية وتقريبية فقط — للتأكد من الاستحقاقات الرسمية،
            راجع إدارة الموارد البشرية بالمنشأة أو مكتب التأمينات الاجتماعية التابع لك.
            للشرح التفصيلي للموضوع رجع لـ <Link href="/" className="font-bold underline" style={{ color: C.teal }}>الدليل الكامل</Link>.
          </p>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <img src="/manus-storage/logo_mark_b4337a50.png" alt="" className="h-9 w-9 object-contain" />
          <p className="font-mono-ar text-xs">حاسبات تعليمية · بدون أرقام مواد قانونية</p>
        </div>
      </footer>
    </div>
  );
}
