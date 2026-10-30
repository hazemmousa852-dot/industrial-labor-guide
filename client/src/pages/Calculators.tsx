import LegalReferences from "@/components/LegalReferences";
import PrintSummary from "@/components/PrintSummary";
import { calculateOvertime } from "@/lib/overtime";
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

/* ---------- ألوان العلامة ---------- */
const C = {
  teal: "var(--hm-teal, #1e6f5c)",
  tealLight: "var(--hm-teal-light, #e9f3ef)",
  navy: "var(--hm-navy, #1f3a4d)",
  navyLight: "var(--hm-navy-light, #e8eef3)",
  amber: "var(--hm-amber, #d4912a)",
  amberLight: "var(--hm-amber-light, #fef5e3)",
  cream: "var(--hm-canvas, #faf8f4)",
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
    note: "الصناعي: حدد ساعات النظام الفعلي. 7 ساعات مثال لميزة أفضل بعقد أو لائحة؛ ملخص القرار 289 يورد حد 8 ساعات و48 أسبوعيًا. الراحة منفصلة ما لم ينطبق استثناء.",
    maxDaily: 7,
    maxWeekly: 42,
    dailyOvertimeCap: null as number | null,
    weeklyOvertimeCap: null as number | null,
  },
  {
    value: "commercial",
    label: "منشأة غير صناعية",
    color: C.navy,
    note: "8 ساعات فعلية كحد أقصى يومياً، 48 فعلي أسبوعياً (8 فعلي + ساعة راحة = 9 ساعات تواجُد يومياً)",
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
    maxDaily: 8,
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
  const [monthlyTotal, setMonthlyTotal] = useState(8000);
  const [wageBasis, setWageBasis] = useState("");
  const [estKey, setEstKey] = useState<EstKey>("industrial");
  const [dailyHours, setDailyHours] = useState(7);
  const [hoursBasis, setHoursBasis] = useState("");
  const [shiftHours, setShiftHours] = useState(7);
  const [workDays, setWorkDays] = useState(26);
  const [restDays, setRestDays] = useState(0);
  const [holidayDays, setHolidayDays] = useState(0);
  const [extraDayHours, setExtraDayHours] = useState(0);
  const [extraNightHours, setExtraNightHours] = useState(0);
  const [automaticNightHours, setAutomaticNightHours] = useState(0);
  const [holidayTimeOff, setHolidayTimeOff] = useState(false);
  const est = ESTABLISHMENTS.find(e => e.value === estKey) ?? ESTABLISHMENTS[0];
  const result = calculateOvertime({ wage: salary, dailyHours, shiftHours, workDays, automaticNightHours, extraDayHours, extraNightHours, restDays, holidayDays, holidayTimeOff });
  const totalDays = workDays + restDays + holidayDays;
  const invalidDays = totalDays > 31;
  const capHit = est.dailyOvertimeCap !== null && shiftHours - dailyHours > est.dailyOvertimeCap;
  const numberField = (id: string, label: string, value: number, change: (v: number) => void, max: number, step = 1, min = 0) => <label htmlFor={id} className="block text-sm font-semibold">{label}<input id={id} type="number" min={min} max={max} step={step} value={value} onChange={e => change(Math.min(max, Math.max(min, step === 1 ? Math.floor(Number(e.target.value) || 0) : Number(e.target.value) || 0)))} className="mt-2 h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar" /></label>;
  const summary = [
    ["وعاء الأجر الشهري المستخدم", `${salary.toFixed(2)} جنيه`],
    ["مكونات وعاء الأجر وسنده", wageBasis || "لم يُحدد — نتيجة تقديرية"],
    ["ساعات العمل المعتمدة", `${dailyHours} ساعة يوميًا — ${hoursBasis || "لم يحدد السند"}`],
    ["أيام الوردية / ساعاتها الفعلية", `${workDays} يوم / ${shiftHours} ساعة يوميًا`],
    ["قيمة الساعة", `${result.rate.toFixed(2)} جنيه = ${salary} ÷ 30 ÷ ${dailyHours}`],
    ["الإضافي التلقائي وتوزيعه", `${result.automaticHours.toFixed(2)} ساعة: نهار ${(result.automaticHours-result.automaticNight).toFixed(2)} / ليل ${result.automaticNight.toFixed(2)}`],
    ["الإضافي اليدوي خارج الوردية", `نهار ${extraDayHours} / ليل ${extraNightHours} ساعة`],
    ["تعويض النهار ×1.35", `${result.dayPay.toFixed(2)} جنيه`],
    ["تعويض الليل ×1.70", `${result.nightPay.toFixed(2)} جنيه`],
    ["الراحة الأسبوعية", `${restDays} يوم — ${result.restPay.toFixed(2)} جنيه زيادة + ${restDays} يوم راحة تعويضي`],
    ["العطلات الرسمية", `${holidayDays} يوم — ${holidayTimeOff ? "راحة بديلة بطلب كتابي من العامل" : `${result.holidayPay.toFixed(2)} جنيه زيادة`}`],
    ["إجمالي الإضافات", `${result.total.toFixed(2)} جنيه`],
    ["مرجع المعاملات", "م 121 و129 ق 14/2025 — يلزم مراجعة وعاء الأجر ونطاق التطبيق"],
    ["نطاق الحساب", "وردية ثابتة؛ لا يشمل التداخل بين عطلة وراحة أو الزيادة في ساعات هذه الأيام؛ القسمة على 30 افتراض حساب للأجر الشهري"],
    ...(invalidDays ? [["تنبيه المدخلات", `مجموع الأيام ${totalDays} يتجاوز 31؛ لا تعتمد النتيجة قبل التصحيح`]] : []),
    ["إجمالي الأجر الشهري المدخل قبل الإضافات", `${monthlyTotal.toFixed(2)} جنيه`],
    ["الإجمالي قبل الخصومات", `${(monthlyTotal+result.total).toFixed(2)} جنيه`],
  ];
  return <section className="hm-panel rounded-3xl border-2 bg-white p-5 shadow-sm md:p-8" style={{borderColor:C.teal}}>
    <h3 className="mb-2 text-2xl font-bold">حاسبة العمل الإضافي (الأوفر تايم)</h3>
    <p className="mb-6 text-sm text-muted-foreground">حدد نظام منشأتك ووعاء الأجر، ثم وزّع ساعات الإضافي بين النهار والليل.</p>
    <div className="space-y-5">
      <label className="block text-sm font-semibold" htmlFor="est">نوع المنشأة / طبيعة العمل<select id="est" value={estKey} onChange={e=>setEstKey(e.target.value as EstKey)} className="mt-2 h-12 w-full rounded-xl border bg-white px-3">{ESTABLISHMENTS.map(e=><option key={e.value} value={e.value}>{e.label}</option>)}</select></label>
      <p className="rounded-xl p-3 text-sm" style={{background:est.color+"14"}}>{est.note}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {numberField("daily-hours", "ساعات العمل اليومية المعتمدة (بدون الراحة المنفصلة)", dailyHours, v => { setDailyHours(v); setHoursBasis(""); }, 8, .5, 1)}
        {numberField("shift-hours", "ساعات الوردية الفعلية يوميًا", shiftHours, setShiftHours, 12, .5)}
      </div>
      <label htmlFor="hours-basis" className="block text-sm font-semibold">سند ساعات العمل: العقد / اللائحة / النظام المطبق<input id="hours-basis" placeholder="مثال: نظام 7 ساعات كميزة أفضل مثبتة بعقد أو لائحة" value={hoursBasis} onChange={e=>setHoursBasis(e.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label>
      <p className="text-xs">اختيار الصناعي لا يفرض 7 ساعات قانونًا. البداية هنا 7 ساعات كمثال لميزة أفضل؛ غيّرها إلى 8 عند انطباق نظام 8 ساعات. الساعات الأقل تستلزم سندًا بالمنشأة. حدود العمل الأسبوعية تُراجع من كشف أسبوعي مستقل.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {numberField("wage", "وعاء الأجر الشهري لحساب الإضافي (جنيه)", salary, setSalary, 100000000, .01)}
        {numberField("monthly-total", "إجمالي الأجر الشهري قبل الإضافات (جنيه)", monthlyTotal, setMonthlyTotal, 100000000, .01)}
      </div>
      <label htmlFor="wage-basis" className="block text-sm font-semibold">مكونات وعاء الأجر وسند اعتماده<input id="wage-basis" value={wageBasis} onChange={e=>setWageBasis(e.target.value)} placeholder="مثال: الأجر المستحق المعتمد وفق العقد واللائحة ومراجعة المادة 121" className="mt-2 w-full rounded-xl border p-3" /></label>
      <p className="text-xs">المادة 121 تربط المقابل بأجر ساعة العمل الأصلية وزيادة النهار أو الليل. لا تفترض أن الأجر الأساسي أو أجر الاشتراك التأميني وحده هو الوعاء الصحيح؛ حدد المكونات المستحقة وفق تعريف الأجر والنظام المنطبق. إجمالي المرتب مستقل عن وعاء الحساب.</p>
      <div className="grid gap-5 sm:grid-cols-3">
        {numberField("work-days", "أيام الوردية الفعلية فقط", workDays, setWorkDays, 31)}
        {numberField("rest-days", "أيام الراحة الأسبوعية التي عُملت", restDays, setRestDays, 5)}
        {numberField("holiday-days", "أيام العطلات الرسمية التي عُملت", holidayDays, setHolidayDays, 15)}
      </div>
      <p className="text-xs">أدخل كل يوم مرة واحدة. الأيام المتداخلة بين عطلة وراحة تحتاج مراجعة مستقلة. القسمة على 30 هنا أساس حساب قيمة اليوم للأجر الشهري، وليست عدد أيام الحضور ولا قاعدة لكل مدة قانونية.</p>
      {invalidDays && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm">مجموع الأيام {totalDays} يتجاوز 31 يومًا؛ صحح التكرار قبل اعتماد الملخص.</p>}
      <p className="rounded-xl border p-3 text-sm">الإضافي التلقائي = {workDays} × الحد الموجب من ({shiftHours} − {dailyHours}) = {result.automaticHours.toFixed(2)} ساعة. يُفترض ثبات الوردية في الأيام المدخلة؛ افصل الورديات المختلفة في تسويات مستقلة.</p>
      {numberField("automatic-night", "من الإضافي التلقائي: عدد الساعات التي وقعت ليلًا خلال الشهر", Math.min(automaticNightHours,result.automaticHours), setAutomaticNightHours, result.automaticHours, .5)}
      <p className="text-xs">باقي الإضافي التلقائي نهاري. وزّع وقت الإضافي نفسه، وليس كل ساعات الوردية، حسب فترات النهار والليل المنطبقة.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        {numberField("extra-day", "إضافي نهاري خارج الوردية المدخلة فقط", extraDayHours, setExtraDayHours, 744, .5)}
        {numberField("extra-night", "إضافي ليلي خارج الوردية المدخلة فقط", extraNightHours, setExtraNightHours, 744, .5)}
      </div>
      <p className="text-xs">لا تكرر الساعات التلقائية في الخانات اليدوية، ولا تُدرج عمل أيام الراحة والعطلات فيها. هذه الحاسبة لا تعالج تجاوز الساعات في أيام الراحة أو تداخل الاستحقاقات.</p>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={holidayTimeOff} onChange={e=>setHolidayTimeOff(e.target.checked)} />العطلات الرسمية: اختيار يوم بديل بطلب كتابي من العامل بدل المقابل النقدي الإضافي (م 129).</label>
      <p className="text-xs">الراحة الأسبوعية: أجر يوم زيادة مع يوم راحة خلال الأسبوع التالي (م 121). العطلة الرسمية: مثلي أجر اليوم زيادة على أجره، أو يوم بديل بطلب كتابي (م 129). الأجر العادي مفترض ضمن الأجر الشهري المدخل.</p>
      {capHit && <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm">وردية الأعمال التجهيزية والحراسة والنظافة تتجاوز ساعتين إضافيتين يوميًا حسب ملخص القرار 292؛ راجع قانونية التكليف.</p>}
      {est.weeklyOvertimeCap !== null && <p className="text-xs">الإضافي للأعمال الخاصة: حد {est.weeklyOvertimeCap} ساعة أسبوعيًا؛ لا يمكن إثبات الالتزام الأسبوعي من مجموع الشهر.</p>}
      <div className="hm-result rounded-2xl border p-4" id="overtime-summary">
        <h4 className="mb-3 text-lg font-bold">ملخص الحساب — حازم موسى</h4>
        <p className="mb-3 text-xs">{est.label} · تحديث النموذج 30 أكتوبر 2026 · {invalidDays || !wageBasis.trim() || !hoursBasis.trim() ? "تقديري — استكمال المدخلات والمراجعة مطلوب" : "حساب وفق المدخلات — يخضع لمراجعة السند"}</p>
        <dl className="space-y-2 text-sm">{summary.map(([label,value])=><div key={label} className="grid gap-1 border-b py-2 sm:grid-cols-2"><dt className="font-semibold">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
      </div>
      <PrintSummary targetId="overtime-summary" label="طباعة ملخص الإضافي / حفظ PDF" />
    </div>
  </section>;
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
  const [previousDays, setPreviousDays] = useState(0);
  const [insurancePaid, setInsurancePaid] = useState(0);
  const [minimumWage, setMinimumWage] = useState(0);
  const [chronic, setChronic] = useState(false);
  const months = days / 30;

  const detail = useMemo(() => {
    const steps: { label: string; amount: number; pct: string }[] = [];
    const overlap = (from: number, to: number) => Math.max(0, Math.min(previousDays + days, to) - Math.max(previousDays, from));
    const bands = kind === "industrial"
      ? law === "new" ? [[0,90,1],[90,270,.85],[270,360,.75]] : [[0,30,1],[30,270,.75],[270,360,0]]
      : chronic ? [[0,Infinity,1]] : [[0,90,.75],[90,180,.85]];
    let total = 0;
    for (const [from,to,pct] of bands) {
      const count = overlap(from,to);
      if (!count) continue;
      const daily = kind === "industrial" ? wage * pct / 30 : Math.max(wage * pct, minimumWage) / 30;
      const amount = count * daily;
      total += amount;
      steps.push({label: `${count} يومًا من المرحلة ${from + 1}–${Number.isFinite(to) ? to : "الممتدة طبيًا"}`,amount,pct: `${pct*100}%`});
    }
    return { total, steps };
  }, [wage, days, kind, law, previousDays, minimumWage, chronic]);

  const kindColor = kind === "industrial" ? C.teal : C.navy;
  const kindName = kind === "industrial" ? "منشأة صناعية" : "منشأة غير صناعية";

  return (
    <div className="hm-panel rounded-3xl border-2 bg-white p-6 shadow-sm md:p-8" style={{ borderColor: C.navy }}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: C.navy }}>
          <Stethoscope className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">حاسبة الإجازة المرضية</h3>
          <p className="text-sm text-muted-foreground">استحقاق الأجر الصناعي أو التعويض التأميني العام — كل منهما مستقل</p>
        </div>
      </div>
      <div className="space-y-5">
        <label className="block text-sm">أيام مرضية سابقة في {kind === "industrial" ? "دورة الثلاث سنوات" : "نفس السنة الميلادية"}<input aria-label="أيام مرضية سابقة" type="number" min="0" step="1" value={previousDays} onChange={e=>setPreviousDays(Math.max(0,Math.floor(Number(e.target.value)||0)))} className="h-12 w-full rounded-xl border-2 px-4" /></label>
        {kind === "industrial" ? <label className="block text-sm">تعويض التأمينات المعتمد عن نفس الفترة بالجنيه<input aria-label="تعويض التأمينات المعتمد" type="number" min="0" step="0.01" value={insurancePaid} onChange={e=>setInsurancePaid(Math.max(0,Number(e.target.value)||0))} className="h-12 w-full rounded-xl border-2 px-4" /></label> : <>
          <label className="block text-sm">الحد الأدنى للأجر الساري على الحالة (شهريًا)<input aria-label="الحد الأدنى للأجر للحالة" type="number" min="0" step="0.01" value={minimumWage} onChange={e=>setMinimumWage(Math.max(0,Number(e.target.value)||0))} className="h-12 w-full rounded-xl border-2 px-4" /></label>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={chronic} onChange={e=>setChronic(e.target.checked)} /> مرض مزمن مشمول بالمادة 76 بقرار طبي — الاستثناء ممتد حتى نهايته الطبية القانونية</label>
          {!minimumWage && <p role="status" className="text-sm text-amber-800">أدخل الحد الأدنى الساري قبل اعتماد تسوية فعلية؛ الناتج الحالي تقديري.</p>}
        </>}
        <p className="text-xs">أدخل أيامًا معتمدة طبيًا. قسّم الفترة عند تغير السنة أو الأجر أو الحد الأدنى أو النظام. القطاع الخاص، مع مراعاة نطاق التأمين الصحي المطبق. لا تكرر الأيام السابقة ضمن أيام الفترة الحالية.</p>

        <div>
          <Label className="mb-2 block font-semibold">{kind === "industrial" ? "الأجر الشهري المستحق للعامل:" : "أجر الاشتراك التأميني الشهري:"} <span className="font-mono-ar">{wage} جنيه</span></Label>
          <input aria-label="الأجر الشهري لحساب المرضي" type="number" min="0" step="0.01" value={wage} onChange={e=>setWage(Math.max(0,Number(e.target.value)||0))} className="h-12 w-full rounded-xl border-2 px-4" />
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
            style={{ borderColor: `color-mix(in srgb, ${C.teal} 40.0%, transparent)` }}
          />
          <p className="mt-1 text-xs text-muted-foreground">يعادل <span className="font-mono-ar font-bold">{months.toFixed(2)} شهر</span> (للتقدير العددي هنا: الشهر 30 يومًا وقيمة اليوم 1/30 من الأجر. تُراجع المدد بالتواريخ الفعلية والقرار الطبي عند التسوية)</p>
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
              {s.label} ({s.pct}): <span className="font-mono-ar font-bold">{s.amount.toFixed(2)}</span> جنيه
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
                  <p><strong>الخصم من التزام صاحب العمل:</strong> يُخصم من التزام صاحب العمل ما يدفعه نظام التأمين الاجتماعي من تعويض عن الأجر.</p>
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
          <span className="font-display font-bold">{kind === "industrial" ? "إجمالي الأجر المستحق عن الفترة:" : "التعويض التأميني عن الفترة:"}</span>
          <span className="font-mono-ar text-2xl font-black">
            <AnimatedNumber value={detail.total} decimals={2} /> جنيه
          </span>
        </div>
        {kind === "industrial" && <p className="rounded-xl border p-3 text-sm">تعويض التأمينات المدخل: {insurancePaid.toFixed(2)} جنيه — استكمال صاحب العمل: {Math.max(0,detail.total-insurancePaid).toFixed(2)} جنيه. {insurancePaid > detail.total ? "التعويض المدخل يتجاوز الأجر المستحق؛ راجع المستندات قبل الاعتماد." : "يُدخل التعويض من بيان معتمد عن نفس الفترة؛ الصفر لا يثبت عدم الاستحقاق التأميني."}</p>}
        <div id="sick-summary" className="hm-result rounded-2xl border p-4 text-sm space-y-2">
          <h4 className="text-lg font-bold">ملخص الإجازة المرضية — حازم موسى</h4>
          <p>تحديث النموذج: 30 أكتوبر 2026 · نتيجة تقديرية وفق المدخلات والمستندات الطبية.</p>
          <p>{kindName} — {kind === "industrial" ? (law === "new" ? "م 131 ق 14/2025" : "م 50 ق 12/2003 — تاريخي") : "م 76 ق 148/2019"}</p>
          <p>الأجر {wage.toFixed(2)} جنيه · المدة الحالية {days} يوم · السابق {previousDays} يوم في {kind === "industrial" ? "دورة الثلاث سنوات" : "السنة الميلادية"}.</p>
          <p>أساس التقدير: قسمة الأجر على 30؛ تقسم الفترات عند تغير السنة أو الأجر أو النظام، وتُراجع بدايات ونهايات الشهور من المستندات.</p>
          {kind !== "industrial" && <p>الحد الأدنى المدخل: {minimumWage.toFixed(2)} جنيه · مرض مزمن معتمد: {chronic ? "نعم" : "لا"}. {!minimumWage ? "لم يحدد الحد الأدنى؛ استكمله قبل الاعتماد." : ""}</p>}
          {detail.steps.map(step => <p key={step.label}>{step.label} ({step.pct}): {step.amount.toFixed(2)} جنيه</p>)}
          <p className="font-bold">إجمالي {kind === "industrial" ? "الأجر المستحق" : "التعويض التأميني"}: {detail.total.toFixed(2)} جنيه</p>
          {kind === "industrial" && <p>تعويض التأمينات المدخل: {insurancePaid.toFixed(2)} — استكمال صاحب العمل: {Math.max(0,detail.total-insurancePaid).toFixed(2)} جنيه. {insurancePaid > detail.total ? "تحذير: التعويض المدخل أكبر من الاستحقاق؛ راجع البيان." : "يلزم بيان تعويض معتمد عن نفس الفترة."}</p>}
          {previousDays + days > (kind === "industrial" ? 360 : 180) && !(kind === "commercial" && chronic) && <p>تجاوزت المدخلات مدة الشرائح في هذا النموذج؛ الأيام خارجها لم تُحتسب. راجع الاستحقاق الطبي والتأميني بصورة مستقلة.</p>}
        </div>
        <PrintSummary targetId="sick-summary" label="طباعة ملخص المرضية / حفظ PDF" />
      </div>
    </div>
  );
}

/* =================================================================
   الصفحة
================================================================= */
export default function Calculators() {
  return (
    <div className="hm-ui min-h-screen" style={{ background: C.cream }}>
      {/* شريط علوي بسيط */}
      <header className="hm-ui-header border-b bg-white/90 py-4 backdrop-blur-xl">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="https://hazemmousa852-dot.github.io/marjaak-alqanuni/brand/logo-512.png" alt="شعار حازم موسى" width={48} height={48} className="hm-tool-logo hm-tool-logo--compact" />
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

        <div className="mt-8"><LegalReferences /></div>
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
          <img src="https://hazemmousa852-dot.github.io/marjaak-alqanuni/brand/logo-512.png" alt="شعار حازم موسى" width={48} height={48} className="hm-tool-logo hm-tool-logo--compact" />
          <p className="font-mono-ar text-xs">حاسبات تعليمية · المراجع: قانون العمل 14/2025 (م 121، 129، 131) والتأمينات 148/2019 (م 76)؛ النظام السابق للحالات التاريخية فقط</p>
        </div>
      </footer>
    </div>
  );
}

