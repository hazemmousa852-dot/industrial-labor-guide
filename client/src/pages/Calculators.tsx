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
    note: "أساس الحساب المعتمد للصناعية: 7 ساعات فعلية يوميًا و42 أسبوعيًا؛ الراحة منفصلة. يُراعى نطاق النص القانوني وأي ميزة أفضل بالمنشأة.",
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
/* عند تغيير نوع المنشأة: ضبط الافتراضي لساعات الوردية على الحد الفعلي اليومي للمنشأة الجديدة */
const DEFAULT_SHIFT: Record<EstKey, number> = {
  industrial: 7,
  commercial: 8,
  intermittent: 8,
  prep: 8,
};

function OvertimeCalculator() {
  const [salaryInput, setSalaryInput] = useState("8000");
  const salary = Math.max(0, parseFloat(salaryInput) || 0);
  const [estKey, setEstKey] = useState<EstKey>("industrial");
  const [shiftHours, setShiftHours] = useState(DEFAULT_SHIFT.industrial);
  const [workDays, setWorkDays] = useState(30); // الشهر القانوني = 30 يومًا (قابل للتعديل)
  const [restDays, setRestDays] = useState(0);
  const [holidayDays, setHolidayDays] = useState(0);
  const [dayOvertimeHours, setDayOvertimeHours] = useState(0);
  const [nightHours, setNightHours] = useState(0);
  const [nightShift, setNightShift] = useState(false);

  const est = ESTABLISHMENTS.find((e) => e.value === estKey) ?? ESTABLISHMENTS[0];
  // قيمة الساعة حسب المنشأة: الأجر ÷ 30 يوم (قيمة اليوم) ÷ ساعات العمل الفعلية (7 صناعية / 8 غير صناعية)
  const dayValue = salary / 30;
  const rate = dayValue / est.maxDaily;

  // الحساب التلقائي: ساعات الشهر النظامية = الحد الأسبوعي الفعلي × عدد الأسابيع في أيام العمل
  // (الأسبوع = 6 أيام عمل × maxDaily فعلي = legalWeekly فعلي أسبوعياً)
  const weeksWorked = workDays / 6;
  const legalWeekly = est.maxWeekly ?? 48;
  const legalActualHours = legalWeekly * weeksWorked;
  const workedHours = workDays * shiftHours;
  const overtimeHours = Math.max(0, workedHours - legalActualHours);

  // ساعات الراحة الأسبوعية والإجازات الرسمية: ضعف الأجر (م 121 و129 ق 14/2025)
  const restHours = restDays * shiftHours;
  const holidayHours = holidayDays * shiftHours;

  // عند تغيير نوع المنشأة: ضبط الافتراضي لساعات الوردية على الحد الفعلي اليومي للمنشأة الجديدة
  // فقط لو المستخدم لسه على الافتراض السابق (لم يعدّلها بنفسه)
  const prevEstKey = useRef<EstKey>("industrial");
  useEffect(() => {
    const prev = prevEstKey.current;
    prevEstKey.current = estKey;
    if (prev !== estKey) {
      const prevDefault = DEFAULT_SHIFT[prev] ?? 8;
      if (shiftHours === prevDefault) setShiftHours(DEFAULT_SHIFT[estKey] ?? 8);
    }
  }, [estKey]);

  // يوم الراحة الأسبوعية: أجر يوم زيادة + يوم راحة تعويضي خلال الأسبوع التالي (م 121 ق 14/2025)
  const restDayPay = restDays * dayValue; // أجر يوم كامل عن كل يوم راحة اشتغلها
  const dayCapHit = est.dailyOvertimeCap !== null && shiftHours - est.maxDaily > est.dailyOvertimeCap;
  const weekCapHit = false; // Monthly totals cannot establish a weekly breach.
  const restDayWarn = restDays > weeksWorked;

  const automaticDayHours = nightShift ? 0 : overtimeHours;
  const automaticNightHours = nightShift ? overtimeHours : 0;
  const dayComp = (automaticDayHours + dayOvertimeHours) * rate * 1.35;
  const nightComp = (nightHours + automaticNightHours) * rate * 1.7;
  const restComp = restDayPay; // أجر يوم زيادة عن كل يوم راحة أسبوعية + راحة تعويضية خلال الأسبوع التالي
  const holidayComp = holidayDays * dayValue * 2;
  const total = dayComp + nightComp + restComp + holidayComp;

  return (
    <div className="rounded-3xl border-2 bg-white p-6 shadow-sm md:p-8" style={{ borderColor: C.teal }}>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white" style={{ background: C.teal }}>
          <Coins className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-2xl font-bold">حاسبة العمل الإضافي (الأوفر تايم)</h3>
          <p className="text-sm text-muted-foreground">أدخل أيام الوردية الفعلية وساعاتها؛ النهار والليل لهما معاملان مستقلان</p>
        </div>
      </div>
      <div className="space-y-5">
        <div>
          <Label className="mb-2 block font-semibold">الأجر الشهري (جنيه):</Label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={salaryInput}
            onChange={(e) => setSalaryInput(e.target.value)}
            className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.45_0.09_165)]"
            style={{ borderColor: C.teal + "66" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">الأجر الأساسي الشهري بالجنيه — اكتبه مباشرة</p>
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
                        قيمة اليوم = {salary} ÷ 30 يوم (الشهر القانوني = 30 يوم) = {dayValue.toFixed(2)} جنيه — قيمة الساعة = ÷ {est.maxDaily} ساعة فعلي ({est.maxDaily === 7 ? "صناعية" : "غير صناعية"}) ={
" "}
            <span className="font-mono-ar font-black" style={{ color: est.color }}>{rate.toFixed(2)} جنيه/ساعة</span>
          </p>
        </div>
        <div>
          <Label className="mb-2 block font-semibold">ساعات الوردية اليومي الفعلي (ساعة):</Label>
          <input
            type="number"
            min={4}
            max={12}
            step={0.5}
            value={shiftHours}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              setShiftHours(isNaN(n) || n < 4 ? 4 : Math.min(n, 12));
            }}
            className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.45_0.09_165)]"
            style={{ borderColor: C.teal + "66" }}
          />
          <p className="mt-1 text-xs text-muted-foreground">أساس الحساب {est.maxDaily} ساعات فعلية يوميًا — أي زيادة عن الحد يوميًا تُحسب إضافي تلقائيًا</p>
        </div>

        <p className="font-display font-bold" style={{ color: C.navy }}>أيام الراحة والإجازات اللي اشتغلتها (الشهر القانوني = {workDays} يوم)؟</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block font-semibold">أيام الراحة الأسبوعية:</Label>
            <input
              type="number"
              min={0}
              max={10}
              step={1}
              value={restDays}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                setRestDays(isNaN(n) || n < 0 ? 0 : Math.min(n, 10));
              }}
              className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.35_0.05_250)]"
              style={{ borderColor: C.navy + "66" }}
            />
            <p className="mt-1 text-xs text-muted-foreground">أيام اشتغلتها بدل يوم الراحة الأسبوعية — أجر يوم زيادة + يوم راحة تعويضي خلال الأسبوع اللي وراه (م 121 ق 14/2025)</p>
          </div>
          <div>
            <Label className="mb-2 block font-semibold">أيام الإجازات الرسمية:</Label>
            <input
              type="number"
              min={0}
              max={10}
              step={1}
              value={holidayDays}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                setHolidayDays(isNaN(n) || n < 0 ? 0 : Math.min(n, 10));
              }}
              className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.5_0.08_60)]"
              style={{ borderColor: C.amber + "66" }}
            />
            <p className="mt-1 text-xs text-muted-foreground">أيام اشتغلتها في العطلات الرسمية — تُحسب بضعف الأجر أو يوم راحة تعويضي (م 129 ق 14/2025)</p>
          </div>
          <div>
            <Label className="mb-2 block font-semibold">أيام العمل النظامية:</Label>
            <input
              type="number"
              min={0}
              max={30}
              step={1}
              value={workDays}
              onChange={(e) => {
                const n = parseInt(e.target.value);
                setWorkDays(isNaN(n) || n < 0 ? 0 : Math.min(n, 30));
              }}
              className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.45_0.09_165)]"
              style={{ borderColor: C.teal + "66" }}
            />
            <p className="mt-1 text-xs text-muted-foreground">أدخل أيام الوردية الفعلية فقط؛ لا تشمل أيام الراحة والعطلات المدخلة منفصلة. تقسيم الأجر الشهري على 30 لا يعني العمل 30 يومًا.</p>
          </div>
        </div>

        <p className="font-display font-bold" style={{ color: C.navy }}>هل شغلت ساعات إضافية يدويًا غير أيام الورد (اختياري)؟</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2 block font-semibold">ساعات إضافية نهارية في الشهر كله (×1.35):</Label>
            <input
              type="number"
              min={0}
              max={60}
              step={0.5}
              value={dayOvertimeHours}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setDayOvertimeHours(isNaN(n) || n < 0 ? 0 : Math.min(n, 60));
              }}
              className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.45_0.09_165)]"
              style={{ borderColor: C.teal + "66" }}
            />
            <p className="mt-1 text-xs text-muted-foreground">ساعات إضافية نهارية شغلتها — تُعوض بزيادة 35% على أجر الساعة (م 121 ق 14/2025)</p>
          </div>
          <div>
            <Label className="mb-2 block font-semibold">ساعات إضافية ليلية في الشهر كله (×1.70):</Label>
            <input
              type="number"
              min={0}
              max={60}
              step={0.5}
              value={nightHours}
              onChange={(e) => {
                const n = parseFloat(e.target.value);
                setNightHours(isNaN(n) || n < 0 ? 0 : Math.min(n, 60));
              }}
            className="h-12 w-full rounded-xl border-2 bg-white px-4 text-center font-mono-ar text-lg font-bold outline-none transition-colors focus:border-[oklch(0.35_0.05_250)]"
            style={{ borderColor: C.navy + "66" }}
          />
            <p className="mt-1 text-xs text-muted-foreground">ساعات ليلية إضافية لم تدخل ضمن الوردية؛ لا تكرر هنا ساعات حسبتها الحاسبة تلقائيًا.</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={nightShift} onChange={e => setNightShift(e.target.checked)} /> الوردية ليلية — تعويض الإضافي التلقائي بزيادة 70% بدلًا من 35%</label>
        {est.weeklyOvertimeCap !== null && <p className="text-xs">الحد الأسبوعي للإضافي {est.weeklyOvertimeCap} ساعة؛ راجعه من كشف أسبوعي مستقل، ولا يستنتج من مجموع الشهر.</p>}
        <div className="rounded-xl border bg-white p-3 text-center text-sm" style={{ borderColor: est.color, background: est.color + "14" }}>
          <span className="font-mono-ar font-bold" style={{ color: est.color }}>
            {overtimeHours.toFixed(1)} ساعة إضافية تلقائية{dayOvertimeHours > 0 ? ` + ${dayOvertimeHours} ساعة نهارية يدوية` : ""}
          </span>
          <span className="mx-2 text-muted-foreground">=</span>
          <span className="font-mono-ar">{workDays} يوم × {shiftHours} ساعة = {workedHours.toFixed(0)} ساعة فعلي</span>
          <span className="mx-2 text-muted-foreground">−</span>
          <span className="font-mono-ar">أساس الحساب {legalActualHours.toFixed(0)} ساعة ({legalWeekly} فعلي × {weeksWorked.toFixed(1)} أسبوع)</span>
        </div>

        {(dayCapHit || weekCapHit || restDayWarn) && (
          <div className="flex items-start gap-2 rounded-xl border-2 p-3 text-sm font-semibold leading-relaxed" style={{ borderColor: C.amber, background: C.amberLight, color: C.amber }}>
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>
              {dayCapHit &&
                `في الأعمال التجهيزية والحراسة والنظافة (قرار 292/2025) الحد الأقصى للإضافي ساعتان في اليوم — وردك (${shiftHours} ساعة) يتجاوز الحد ${est.maxDaily}+2.`}
              {" "}
              {weekCapHit &&
                `مجموع الساعات الإضافية (${(overtimeHours + dayOvertimeHours + nightHours).toFixed(1)}) تجاوز الحد الأسبوعي ${est.weeklyOvertimeCap} ساعة بقرار 292/2025.`}
              {" "}
              {restDayWarn &&
                `عدد أيام الراحة اللي اشتغلتها (${restDays}) أكثر من أسابيعك الفعلية (${weeksWorked.toFixed(1)}) — راجع المدخلات.`}
            </span>
          </div>
        )}

        <div className="space-y-2 rounded-2xl border p-4 text-sm" style={{ background: C.cream }}>
          <p className="font-semibold text-muted-foreground">الحساب خطوة بخطوة:</p>
          {(automaticDayHours + dayOvertimeHours) > 0 && (
            <p>
              {automaticDayHours > 0 && <span className="font-mono-ar">{automaticDayHours.toFixed(1)}</span>} {automaticDayHours > 0 ? "ساعة إضافية نهارية تلقائية" : ""} {automaticDayHours > 0 && dayOvertimeHours > 0 ? "+ " : ""} {dayOvertimeHours > 0 && <span className="font-mono-ar">{dayOvertimeHours} ساعة إضافية نهارية يدوية</span>}{dayOvertimeHours > 0 ? "" : ""} × {rate.toFixed(2)} جنيه × 1.35 ={" "}
              <span className="font-mono-ar font-bold" style={{ color: C.teal }}>{dayComp.toFixed(2)}</span> جنيه
            </p>
          )}
          {restDays > 0 && (
            <p>
              <span className="font-mono-ar">{restDays}</span> يوم راحة أسبوعية اشتغلها × {dayValue.toFixed(2)} جنيه (أجر يوم كامل) ={" "}
              <span className="font-mono-ar font-bold" style={{ color: C.navy }}>{restComp.toFixed(2)}</span> جنيه{" "}
              <span className="text-xs text-muted-foreground">+ يوم راحة تعويضي خلال الأسبوع اللي وراه (م 121 ق 14/2025)</span>
            </p>
          )}
          {holidayHours > 0 && (
            <p>
              <span className="font-mono-ar">{holidayDays}</span> يوم إجازة رسمية × {dayValue.toFixed(2)} جنيه × 2 (أجر اليوم الإضافي) ={" "}
              <span className="font-mono-ar font-bold" style={{ color: C.amber }}>{holidayComp.toFixed(2)}</span> جنيه
            </p>
          )}
          {dayOvertimeHours > 0 && (
            <p>
              <span className="font-mono-ar">{dayOvertimeHours}</span> ساعة إضافية نهارية يدوية × {rate.toFixed(2)} جنيه × 1.35 ={" "}
              <span className="font-mono-ar font-bold" style={{ color: C.teal }}>{(dayOvertimeHours * rate * 1.35).toFixed(2)}</span> جنيه
            </p>
          )}
          {(nightHours + automaticNightHours) > 0 && (
            <p>
              <span className="font-mono-ar">{nightHours + automaticNightHours}</span> ساعة إضافية ليلية × {rate.toFixed(2)} جنيه × 1.70 ={" "}
              <span className="font-mono-ar font-bold" style={{ color: C.navy }}>{nightComp.toFixed(2)}</span> جنيه
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-2xl px-5 py-4 text-white shadow-md" style={{ background: C.teal }}>
          <span className="font-display font-bold">قيمة الإضافي:</span>
          <span className="font-mono-ar text-2xl font-black">
            <AnimatedNumber value={total} /> جنيه
          </span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border-2 px-5 py-4" style={{ borderColor: C.navy, background: C.navyLight }}>
          <span className="font-display font-bold" style={{ color: C.navy }}>إجمالي الأجر بعد الإضافات:</span>
          <span className="font-mono-ar text-2xl font-black" style={{ color: C.navy }}>
            {(salary + total).toFixed(2)} جنيه
          </span>
        </div>
        <p className="text-center text-xs text-muted-foreground">الأجر الأساسي {salary.toFixed(2)} جنيه + قيمة الإضافي {total.toFixed(2)} جنيه = {salary + total} جنيه</p>
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
    <div className="rounded-3xl border-2 bg-white p-6 shadow-sm md:p-8" style={{ borderColor: C.navy }}>
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
          <span className="font-display font-bold">{kind === "industrial" ? "إجمالي الأجر المستحق عن الفترة:" : "التعويض التأميني عن الفترة:"}</span>
          <span className="font-mono-ar text-2xl font-black">
            <AnimatedNumber value={detail.total} /> جنيه
          </span>
        </div>
        {kind === "industrial" && <p className="rounded-xl border p-3 text-sm">تعويض التأمينات المدخل: {insurancePaid.toFixed(2)} جنيه — استكمال صاحب العمل: {Math.max(0,detail.total-insurancePaid).toFixed(2)} جنيه. {insurancePaid > detail.total ? "التعويض المدخل يتجاوز الأجر المستحق؛ راجع المستندات قبل الاعتماد." : "يُدخل التعويض من بيان معتمد عن نفس الفترة؛ الصفر لا يثبت عدم الاستحقاق التأميني."}</p>}
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

