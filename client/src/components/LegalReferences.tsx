export default function LegalReferences() {
  return <aside id="references" className="rounded-2xl border bg-white p-5 text-sm leading-relaxed">
    <h2 className="mb-2 text-lg font-bold">المراجع ونطاق المراجعة</h2>
    <p>آخر تحديث للمحتوى والحسابات: 30 أكتوبر 2026. الشروح تلخيص تعليمي؛ النص المنشور بالجهة الرسمية هو المرجع عند التطبيق.</p>
    <ul className="my-3 list-inside list-disc space-y-2">
      <li>قانون العمل 14 لسنة 2025: المواد 121 و129 و131؛ وقانون 12 لسنة 2003 للحالات التاريخية.</li>
      <li>القرارات الوزارية 288 و289 و290 و292 لسنة 2025: ملخصات ساعات العمل والراحة والأعمال الخاصة.</li>
      <li>قانون التأمينات الاجتماعية والمعاشات 148 لسنة 2019: المادة 76؛ وقانون تراخيص المنشآت الصناعية 15 لسنة 2017 لتحديد نطاق المرضية الصناعية.</li>
    </ul>
    <p className="mt-3 font-semibold">نسخ القرارات المحفوظة في مرجعك القانوني:</p>
    <ul className="my-3 list-inside list-disc space-y-2">
      <li><a className="underline" target="_blank" rel="noopener noreferrer" href={"https://hazemmousa852-dot.github.io/marjaak-alqanuni/decisions/" + encodeURIComponent("قرار رقم ٢٨٨ لسنة ٢٠٢٥ بشأن تحديد الحالات أو الأعمال التي يُحتم استمرار العمل فيها دون فترة راحة.pdf")}>نسخة PDF: قرار رقم ٢٨٨ لسنة ٢٠٢٥ بشأن تحديد الحالات أو الأعمال التي يُحتم استمرار العمل فيها دون فترة راحة</a></li>
      <li><a className="underline" target="_blank" rel="noopener noreferrer" href={"https://hazemmousa852-dot.github.io/marjaak-alqanuni/decisions/" + encodeURIComponent("قرار رقم ٢٨٩ لسنة ٢٠٢٥ بشأن تحديد ساعات العمل في المنشآت الصناعية.pdf")}>نسخة PDF: قرار رقم ٢٨٩ لسنة ٢٠٢٥ بشأن تحديد ساعات العمل في المنشآت الصناعية</a></li>
      <li><a className="underline" target="_blank" rel="noopener noreferrer" href={"https://hazemmousa852-dot.github.io/marjaak-alqanuni/decisions/" + encodeURIComponent("قرار رقم ٢٩٠ لسنة ٢٠٢٥ بتحديد الأعمال المتقطعة بطبيعتها التي يجوز تواجد العامل فيها أكثر من عشر ساعات.pdf")}>نسخة PDF: قرار رقم ٢٩٠ لسنة ٢٠٢٥ بتحديد الأعمال المتقطعة بطبيعتها التي يجوز تواجد العامل فيها أكثر من عشر ساعات</a></li>
      <li><a className="underline" target="_blank" rel="noopener noreferrer" href={"https://hazemmousa852-dot.github.io/marjaak-alqanuni/decisions/" + encodeURIComponent("قرار رقم 292 لسنة ٢٠٢٥ بشأن تحديد الحد الأقصى لساعات العمل الفعلية والإضافية في الأعمال التجهيزية والتكميلية وأعمال الحراسة والنظافة.pdf")}>نسخة PDF: قرار رقم 292 لسنة ٢٠٢٥ بشأن تحديد الحد الأقصى لساعات العمل الفعلية والإضافية في الأعمال التجهيزية والتكميلية وأعمال الحراسة والنظافة</a></li>
    </ul>
    <div className="flex flex-wrap gap-4 font-semibold underline">
      <a href="https://www.labour.gov.eg/" target="_blank" rel="noopener noreferrer">وزارة العمل — بوابة رسمية</a>
      <a href="https://www.nosi.gov.eg/" target="_blank" rel="noopener noreferrer">الهيئة القومية للتأمين الاجتماعي — بوابة رسمية</a>
      <a href="https://hazemmousa852-dot.github.io/marjaak-alqanuni/decisions.html" target="_blank" rel="noopener noreferrer">فهرس القرارات في مرجعك القانوني</a>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">نسخ PDF أعلاه مستضافة في مرجعك القانوني؛ روابط الجهات الرسمية بوابات عامة وليست روابط للنصوص الأصلية لكل مادة. تعذّر التحقق المستقل من ملفات التشريعات الرسمية في هذه المراجعة؛ تاريخ التحديث لا يعني اعتمادًا قانونيًا جديدًا.</p>
  </aside>;
}
