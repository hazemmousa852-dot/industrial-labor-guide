export default function PrintSummary({targetId, label}: {targetId: string; label: string}) {
  const print = () => {
    const target = document.getElementById(targetId);
    if (!target) return;
    document.getElementById("calculation-print-root")?.remove();
    const copy = target.cloneNode(true) as HTMLElement;
    copy.id = "calculation-print-root";
    copy.dir = "rtl";
    copy.className = "calculation-print-root";
    document.body.appendChild(copy);
    const cleanup = () => {
      document.body.removeAttribute("data-print-summary");
      copy.remove();
    };
    document.body.setAttribute("data-print-summary", "true");
    window.addEventListener("afterprint", cleanup, {once:true});
    try { window.print(); } catch { cleanup(); }
  };
  return <button type="button" onClick={print} className="rounded-xl bg-[#1e6f5c] px-5 py-3 text-sm font-bold text-white print:hidden">{label}</button>;
}
