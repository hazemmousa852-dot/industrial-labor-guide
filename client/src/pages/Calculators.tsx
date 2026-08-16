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
  const rate = salary / 30 / 8;
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
          <p className="text-sm text-muted-foreground">معاملات: الساعات النهارية ×1.35 — الساعات الليلية ×1.70</p>
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
                        قيمة الساعة = {salary} ÷ 30 يوم (الشهر القانوني = 30 يوم) ÷ 8 ساعات ={
" "}
            <span className="font-mono-ar font-black" style={{ color: est.color }}>{rate.toFixed(2)} جنيه/ساعة</span>
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block font-semibold">الساعات النهارية (عدد الساعات):</Label>
            <input
              type="number"
              min={0}
              max={12}
              step={0.5}
              value={dayHours}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setDayHours(isNaN(n) || n < 0 ? 0 : Math.min(n, 12));
              }}
              className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.45_0.09_165)]"
              style={{ borderColor: C.teal + "66" }}
            />
            <p className="mt-1 text-xs text-muted-foreground">الساعات الإضافية اللي شغلتها في النهار بعد نهاية وردك</p>
          </div>
          <div>
            <Label className="mb-2 block font-semibold">الساعات الليلية (عدد الساعات):</Label>
            <input
              type="number"
              min={0}
              max={12}
              step={0.5}
              value={nightHours}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setNightHours(isNaN(n) || n < 0 ? 0 : Math.min(n, 12));
              }}
              className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.35_0.05_250)]"
              style={{ borderColor: C.navy + "66" }}
            />
            <p className="mt-1 text-xs text-muted-foreground">الساعات الإضافية اللي شغلتها في الفترة الليلية</p>
          </div>
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

type SickLaw = "new" | "old";

function SickLeaveCalculator() {
  const [wage, setWage] = useState(8000);
  const [days, setDays] = useState(30);
  const [kind, setKind] = useState<SickKind>("industrial");
  const [law, setLaw] = useState<SickLaw>("new");
  const months = days / 30;

  const detail = useMemo(() => {
    let total = 0;
    const steps: { label: string; amount: number; pct: string }[] = [];
    if (kind === "industrial") {
      if (law === "new") {
        // م 131 قانون العمل 14/2025 (ساري من 1/9/2025): كل 3 سنوات خدمة
        // 3 شهور بأجر كامل + 6 شهور بـ 85% + 3 شهور بـ 75% (شريطة تقرير الجهة الطبية باحتمال الشفاء)
        const a = Math.min(days / 30, 3);
        const b = Math.min(Math.max(days / 30 - 3, 0), 6);
        const c = Math.min(Math.max(days / 30 - 9, 0), 3);
        if (a > 0) { const sub = a * wage; total += sub; steps.push({ label: `الشهور 1 – 3 (بأجر كامل)`, amount: sub, pct: "100%" }); }
        if (b > 0) { const sub = b * wage * 0.85; total += sub; steps.push({ label: `الشهور 4 – 9 (بحد أقصى 6 شهور)`, amount: sub, pct: "85%" }); }
        if (c > 0) { const sub = c * wage * 0.75; total += sub; steps.push({ label: `الشهور 10 – 12 (بحد أقصى 3 شهور)`, amount: sub, pct: "75%" }); }
      } else {
        // الدورة القديمة (م 50 قانون 12/2003 + ق 21/1958): كل 3 سنوات خدمة
        // شهر بأجر كامل + 8 شهور بـ 75% + 3 شهور بدون أجر (شريطة تقرير الجهة الطبية باحتمال الشفاء)
        const m = days / 30;
        if (m >= 1) {
          total += wage;
          steps.push({ label: "الشهر الأول — بأجر كامل", amount: wage, pct: "100%" });
        }
        const rest = Math.min(m - 1, 8);
        if (rest > 0) {
          const sub = rest * wage * 0.75;
          total += sub;
          steps.push({ label: `الشهور 2 – ${Math.min(9, Math.ceil(m))} (بحد أقصى 8 شهور)`, amount: sub, pct: "75%" });
        }
        if (m > 9) {
          steps.push({ label: `الشهور 10 – ${Math.min(12, Math.ceil(m))} (دورة 3 سنوات خدمة)`, amount: 0, pct: "بدون أجر — يشترط تقرير الجهة الطبية باحتمال الشفاء" });
        }
      }
    } else {
      // القاعدة العامة (م 76 ق 148/2019 للتأمينات): 90 يوم بـ 75% ثم 85% حتى 180 يوم في السنة الميلادية
      const firstDays = Math.min(days, 90);
      const secondDays = Math.min(Math.max(days - 90, 0), 90);
      if (firstDays > 0) {
        const sub = (firstDays / 30) * wage * 0.75;
        total += sub;
        steps.push({ label: `أول ${firstDays} يوم`, amount: sub, pct: "75%" });
      }
      if (secondDays > 0) {
        const sub = (secondDays / 30) * wage * 0.85;
        total += sub;
        steps.push({ label: `اليوم 91 حتى ${90 + secondDays}`, amount: sub, pct: "85%" });
      }
      if (days > 180) {
        steps.push({ label: "بعد اليوم 180 في السنة الميلادية", amount: 0, pct: "ينتهي الحق في التعويض" });
      }
    }
    return { total, steps };
  }, [wage, days, kind, law]);

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
              <SelectItem value="industrial">منشأة صناعية (قانون 15/2017 لتراخيص المنشآت الصناعية)</SelectItem>
              <SelectItem value="commercial">منشأة غير صناعية — 75% أول 90 يوم ثم 85% حتى 180 يوم/سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-2 block font-semibold">مدة الإجازة المرضية (يوم):</Label>
          <input
            type="number"
            min={1}
            max={365}
            step={1}
            value={days}
            onChange={(e) => {
              const n = parseInt(e.target.value);
              setDays(isNaN(n) || n < 1 ? 1 : Math.min(n, 365));
            }}
            className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.45_0.09_165)]"
            style={{ borderColor: C.teal + "66" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">يعادل <span className="font-mono-ar font-bold">{months.toFixed(2)} شهر</span> (الشهر في القانون = 30 يومًا ثابتة — أي يوم = 1/30 من الشهر)</p>
        </div>
        {kind === "industrial" && (
          <div>
            <Label className="mb-2 block font-semibold">النظام المطبق للمنشآت الصناعية</Label>
            <Select value={law} onValueChange={(v) => setLaw(v as SickLaw)}>
              <SelectTrigger className="w-full bg-white text-right">
                <SelectValue placeholder="اختر القانون" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="new">القانون 14/2025 (م 131) — ساري من 1/9/2025: 3 شهور بـ 100% ثم 6 شهور بـ 85% ثم 3 شهور بـ 75%</SelectItem>
                <SelectItem value="old">القانون 12/2003 (م 50) — السابق: شهر 100% + 8 شهور 75% + 3 شهور بدون أجر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {kind === "industrial" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {law === "new" ? (
              <>
                <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.teal, background: C.tealLight }}>
                  <p className="font-display text-sm font-bold">الشهور 1 – 3</p>
                  <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.teal }}>100%</p>
                </div>
                <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.navy, background: C.navyLight }}>
                  <p className="font-display text-sm font-bold">الشهور 4 – 9</p>
                  <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.navy }}>85%</p>
                </div>
                <div className="rounded-2xl border-2 p-4 text-center" style={{ borderColor: C.amber, background: C.amberLight }}>
                  <p className="font-display text-sm font-bold">الشهور 10 – 12</p>
                  <p className="font-mono-ar mt-1 text-2xl font-black" style={{ color: C.amber }}>75%</p>
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
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
        <div className="space-y-1 rounded-xl border bg-white p-3 text-xs leading-relaxed" style={{ borderColor: C.teal, background: C.tealLight }}>
          <p className="font-semibold" style={{ color: C.teal }}>الأساس القانوني — النظام المطبق: {kindName}</p>
          {kind === "industrial" ? (
            <>
              {law === "new" ? (
                <>
                  <p><strong>المادة 131 من قانون العمل 14/2025 (سارية من 1/9/2025، تُلغي القانون 12/2003):</strong> للعامل بالمنشآت الصناعية التي يسري عليها قانون تيسير منح تراخيص المنشآت الصناعية (15/2017) إجازة مرضية <strong>كل ثلاث سنوات خدمة</strong> على أساس: ثلاثة أشهر بأجر كامل، ثم ستة أشهر بـ 85% من أجره، ثم ثلاثة أشهر بـ 75% من أجره — وذلك إذا قررت الجهة الطبية المختصة احتمال شفائه.</p>
                  <p><strong>الخصم من التزام صاحب العمل:</strong> يُخصم من أجر صاحب العمل ما يدفعه نظام التأمين الاجتماعي من تعويض عن الأجر.</p>
                  <p><strong>متجمد الإجازات السنوية:</strong> للعامل أن يستفيد من متجمد إجازاته السنوية إلى جانب المرضية، أو يطلب تحويلها إلى سنوية إذا كان له رصيد.</p>
                  <p><strong>حماية من الفصل:</strong> لا يجوز إنهاء العقد بسبب المرض إلا بعد استنفاد الإجازات المرضية ومتجمد السنوية (الحكم المقابل للمادة 127 القديمة).</p>
                </>
              ) : (
                <>
                  <p><strong>المادة 50 من قانون العمل 12/2003 (النظام السابق قبل 1/9/2025):</strong> للعامل بالمنشآت الصناعية (التي يسري عليها القانون 21/1958) إجازة مرضية <strong>كل ثلاث سنوات خدمة</strong> على أساس: شهر بأجر كامل، ثم ثمانية أشهر بـ 75%، ثم ثلاثة أشهر بدون أجر — وذلك إذا قررت الجهة الطبية المختصة احتمال شفائه.</p>
                  <p><strong>حماية من الفصل (المادة 127):</strong> لا يجوز لصاحب العمل إنهاء العقد بسبب المرض إلا بعد استنفاد الإجازات المرضية + متجمد الإجازات السنوية، مع إخطار العامل قبل 15 يوم من الاستنفاد. فإذا شُفي قبل تمام الإخطار امتنع الإنهاء.</p>
                </>
              )}
              <p><strong>الأمراض المزمنة (م 76 ق 148/2019):</strong> يُصرف تعويض بأجر الاشتراك طوال مدة المرض حتى الشفاء أو ثبوت العجز — استثناءً من حدود الدورة.</p>
            </>
          ) : (
            <>
              <p><strong>المادة 76 من قانون التأمينات والمعاشات 148/2019:</strong> التعويض عن المرض يعادل 75% من الأجر اليومي المسدد عنه الاشتراكات لمدة 90 يوماً، ويزاد بعدها إلى 85% من الأجر المذكور، بما لا يتجاوز 180 يوماً في السنة الميلادية الواحدة.</p>
              <p><strong>الحد الأدنى:</strong> لا يقل التعويض في جميع الأحوال عن الحد الأدنى المقرر قانوناً للأجر.</p>
              <p><strong>الأمراض المزمنة:</strong> يُصرف تعويض بأجر الاشتراك طوال مدة المرض حتى الشفاء أو ثبوت العجز الكامل.</p>
              <p><strong>متجمد الإجازات:</strong> للعامل أن يستفيد من متجمد إجازاته السنوية إلى جانب المرضية (م 131 ق 14/2025).</p>
            </>
          )}
        </div>
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
          <p className="font-mono-ar text-xs">حاسبات تعليمية · المراجع: قانون العمل 12/2003 (م 50، م 127) وقانون التأمينات 148/2019 (م 76)</p>
        </div>
      </footer>
    </div>
  );
}
