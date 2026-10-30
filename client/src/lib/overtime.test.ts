import { describe, expect, it } from "vitest";
import { calculateOvertime, type OvertimeInput } from "./overtime";
const base: OvertimeInput = {wage:8400,dailyHours:7,shiftHours:9,workDays:20,automaticNightHours:10,extraDayHours:2,extraNightHours:3,restDays:1,holidayDays:1,holidayTimeOff:false};
describe("overtime settlement",()=>{
  it("splits mixed overtime once and keeps rest/holiday additions separate",()=>{
    const r=calculateOvertime(base);
    expect(r.rate).toBe(40);
    expect(r.automaticHours).toBe(40);
    expect(r.dayHours).toBe(32);
    expect(r.nightHours).toBe(13);
    expect(r.total).toBeCloseTo(3452,8);
  });
  it("recalculates an eight-hour system without imposing an industrial default",()=>{
    const r=calculateOvertime({...base,dailyHours:8});
    expect(r.rate).toBe(35);
    expect(r.automaticHours).toBe(20);
    expect(r.dayPay).toBeCloseTo(567);
  });
  it("caps nighttime allocation and never creates negative overtime",()=>{
    expect(calculateOvertime({...base,automaticNightHours:100}).dayHours).toBe(2);
    const r=calculateOvertime({...base,shiftHours:6});
    expect(r.automaticHours).toBe(0);
    expect(r.automaticNight).toBe(0);
  });
  it("replaces only holiday cash when compensatory leave is selected",()=>{
    const r=calculateOvertime({...base,holidayTimeOff:true});
    expect(r.holidayPay).toBe(0);
    expect(r.restPay).toBe(280);
    expect(r.total).toBeCloseTo(2892);
  });
  it("handles zero days and fractional hours without NaN",()=>{
    const r=calculateOvertime({...base,shiftHours:7.5,workDays:0,extraDayHours:0,extraNightHours:0,restDays:0,holidayDays:0});
    expect(r.total).toBe(0);
  });
});
