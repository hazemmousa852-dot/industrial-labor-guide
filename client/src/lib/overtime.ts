export interface OvertimeInput {
  wage: number;
  dailyHours: number;
  shiftHours: number;
  workDays: number;
  automaticNightHours: number;
  extraDayHours: number;
  extraNightHours: number;
  restDays: number;
  holidayDays: number;
  holidayTimeOff: boolean;
}
export function calculateOvertime(input: OvertimeInput) {
  const clean = (n: number) => Number.isFinite(n) ? Math.max(0, n) : 0;
  const dayValue = clean(input.wage) / 30;
  const dailyHours = Math.max(1, clean(input.dailyHours));
  const rate = dayValue / dailyHours;
  const automaticHours = Math.max(0, clean(input.shiftHours) - dailyHours) * clean(input.workDays);
  const automaticNight = Math.min(automaticHours, clean(input.automaticNightHours));
  const dayHours = automaticHours - automaticNight + clean(input.extraDayHours);
  const nightHours = automaticNight + clean(input.extraNightHours);
  const dayPay = dayHours * rate * 1.35;
  const nightPay = nightHours * rate * 1.7;
  const restPay = clean(input.restDays) * dayValue;
  const holidayPay = input.holidayTimeOff ? 0 : clean(input.holidayDays) * dayValue * 2;
  return { dayValue, rate, automaticHours, automaticNight, dayHours, nightHours, dayPay, nightPay, restPay, holidayPay, total: dayPay + nightPay + restPay + holidayPay };
}
