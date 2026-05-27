import puppeteer from 'puppeteer';
import type { GeneratedPaper } from '../types/assignment';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function difficultyLabel(d: 'easy' | 'moderate' | 'challenging'): string {
  if (d === 'easy') return 'Easy';
  if (d === 'moderate') return 'Moderate';
  return 'Challenging';
}

function renderHtml(paper: GeneratedPaper): string {
  const sections = paper.sections
    .map((s) => {
      const questions = s.questions
        .map((q, idx) => {
          const opts = q.options && q.options.length
            ? `<ol type="a" class="options">${q.options
                .map((o) => `<li>${esc(o)}</li>`)
                .join('')}</ol>`
            : '';
          return `<li class="q">
            <span class="qtext">[${difficultyLabel(q.difficulty)}] ${esc(q.text)} <span class="marks">[${q.marks} Marks]</span></span>
            ${opts}
          </li>`;
        })
        .join('');
      return `
        <section class="section">
          <h2 class="section-title">${esc(s.title)}</h2>
          <p class="section-instruction"><em>${esc(s.instruction)}</em></p>
          <ol class="questions">${questions}</ol>
        </section>`;
    })
    .join('');

  const answerKey = paper.answerKey && paper.answerKey.length
    ? `<section class="answer-key">
        <h2>Answer Key</h2>
        <ol>
          ${paper.answerKey.map((a) => `<li>${esc(a.answer)}</li>`).join('')}
        </ol>
      </section>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"/>
<title>Question Paper</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Georgia, serif; color: #111; line-height: 1.55; font-size: 12pt; }
  .school { text-align: center; margin-bottom: 20px; }
  .school h1 { font-size: 18pt; margin: 0 0 6px; font-weight: 700; }
  .school .meta { font-size: 12pt; }
  .row { display: flex; justify-content: space-between; margin: 6px 0; font-size: 11pt; }
  .general { font-size: 11pt; margin: 10px 0 14px; }
  .student-info { margin: 12px 0 20px; font-size: 11pt; }
  .student-info p { margin: 4px 0; }
  .section { margin: 18px 0; page-break-inside: avoid; }
  .section-title { font-size: 14pt; text-align: center; margin: 14px 0 6px; font-weight: 700; }
  .section-instruction { margin: 0 0 10px; font-size: 11pt; }
  ol.questions { padding-left: 20px; }
  ol.questions > li { margin: 8px 0; }
  .marks { float: right; font-weight: 600; }
  .options { padding-left: 20px; margin: 4px 0 0; }
  .answer-key { margin-top: 30px; border-top: 1px solid #999; padding-top: 12px; }
  .answer-key h2 { font-size: 13pt; margin: 0 0 8px; }
  .end { text-align: center; font-weight: 700; margin: 18px 0; }
</style>
</head>
<body>
  <div class="school">
    <h1>${esc(paper.schoolName)}</h1>
    <div class="meta">Subject: ${esc(paper.subject)}</div>
    <div class="meta">Class: ${esc(paper.className)}</div>
  </div>

  <div class="row">
    <span>Time Allowed: ${esc(paper.timeAllowed)}</span>
    <span>Maximum Marks: ${paper.maximumMarks}</span>
  </div>
  <p class="general">${esc(paper.generalInstructions)}</p>

  <div class="student-info">
    <p>Name: ____________________</p>
    <p>Roll Number: ____________________</p>
    <p>Class: ${esc(paper.className)} &nbsp;&nbsp; Section: ____________</p>
  </div>

  ${sections}

  <p class="end">End of Question Paper</p>

  ${answerKey}
</body></html>`;
}

export async function paperToPdf(paper: GeneratedPaper): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setContent(renderHtml(paper), { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
