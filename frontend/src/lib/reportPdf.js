import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ------------------------------------------------------------------ *
 *  Pixel Global – SEO report → real (vector, selectable-text) PDF
 * ------------------------------------------------------------------ */

const C = {
  brand: [79, 70, 229],
  brandDark: [49, 46, 129],
  brandSoft: [238, 242, 255],
  ink: [17, 24, 39],
  body: [55, 65, 81],
  muted: [107, 114, 128],
  line: [229, 231, 235],
  soft: [249, 250, 251],
  white: [255, 255, 255],
  green: [22, 163, 74],
  greenSoft: [220, 252, 231],
  amber: [217, 119, 6],
  amberSoft: [254, 243, 199],
  red: [220, 38, 38],
  redSoft: [254, 226, 226],
  blue: [37, 99, 235],
  blueSoft: [219, 234, 254],
};

const PAGE = { w: 210, h: 297, m: 15 };
const CW = PAGE.w - PAGE.m * 2; // content width
const TOP = 22; // first y on non-cover pages
const BOTTOM = 280; // last usable y

/* ----------------------------- helpers ----------------------------- */

// Helvetica (WinAnsi) can't draw emoji / most symbols – keep text safe.
const clean = (v) => {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2022\u25CF\u25AA]/g, '-')
    .replace(/[\u2713\u2714]/g, 'Yes')
    .replace(/[\u2717\u2718]/g, 'No')
    .replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
};

const arr = (v) => (Array.isArray(v) ? v : []);
const num = (v, d = 0) => (typeof v === 'number' && !Number.isNaN(v) ? v : d);

const scoreColor = (s) => (s >= 80 ? C.green : s >= 60 ? C.amber : C.red);
const scoreSoft = (s) => (s >= 80 ? C.greenSoft : s >= 60 ? C.amberSoft : C.redSoft);
const scoreLabel = (s) =>
  s >= 90 ? 'Excellent' : s >= 80 ? 'Good' : s >= 60 ? 'Needs Improvement' : 'Poor';

const priorityColor = (p = '') => {
  const k = String(p).toLowerCase();
  if (k === 'high') return C.red;
  if (k === 'medium') return C.amber;
  if (k === 'low') return C.blue;
  return C.muted;
};

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return clean(url).replace(/^https?:\/\//, '').split('/')[0];
  }
};

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

/* --------------------------- main builder --------------------------- */

export function buildReportPdf(report) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const host = hostOf(report.url);
  const score = num(report.seo_score, 0);
  let y = TOP;

  doc.setProperties({
    title: `SEO Report - ${host}`,
    subject: 'Website SEO Audit',
    author: 'Pixel Global IT',
    creator: 'Pixel Global IT',
  });

  /* ---- low level drawing helpers ---- */
  const setFill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const setText = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const setDraw = (c) => doc.setDrawColor(c[0], c[1], c[2]);

  const newPage = () => {
    doc.addPage();
    y = TOP;
  };

  const ensure = (h) => {
    if (y + h > BOTTOM) newPage();
  };

  const afterTable = (gap = 7) => {
    y = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y) + gap;
  };

  const section = (title, subtitle) => {
    ensure(subtitle ? 24 : 18);
    setFill(C.brand);
    doc.roundedRect(PAGE.m, y, 1.8, subtitle ? 10 : 7, 0.9, 0.9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    setText(C.ink);
    doc.text(clean(title), PAGE.m + 5, y + 5.5);
    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      setText(C.muted);
      doc.text(clean(subtitle), PAGE.m + 5, y + 10.5);
    }
    y += subtitle ? 15 : 11;
    setDraw(C.line);
    doc.setLineWidth(0.3);
    doc.line(PAGE.m, y - 2, PAGE.w - PAGE.m, y - 2);
    y += 2;
  };

  const subHeading = (text) => {
    ensure(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setText(C.brandDark);
    doc.text(clean(text), PAGE.m, y + 4);
    y += 7;
  };

  const paragraph = (text, { size = 10, color = C.body, bold = false, indent = 0 } = {}) => {
    const t = clean(text);
    if (!t) return;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    setText(color);
    const lh = size * 0.5;
    const lines = doc.splitTextToSize(t, CW - indent);
    lines.forEach((ln) => {
      ensure(lh + 1);
      doc.text(ln, PAGE.m + indent, y + 3.5);
      y += lh;
    });
    y += 2;
  };

  const callout = (text, tone = 'brand') => {
    const t = clean(text);
    if (!t) return;
    const map = {
      brand: [C.brandSoft, C.brand],
      red: [C.redSoft, C.red],
      amber: [C.amberSoft, C.amber],
      green: [C.greenSoft, C.green],
    };
    const [bg, bar] = map[tone] || map.brand;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(t, CW - 12);
    const lh = 5;
    // box may span pages: draw per chunk
    let idx = 0;
    while (idx < lines.length) {
      const avail = Math.max(1, Math.floor((BOTTOM - y - 8) / lh));
      if (avail < 2 && y > TOP + 10) {
        newPage();
        continue;
      }
      const chunk = lines.slice(idx, idx + avail);
      const h = chunk.length * lh + 8;
      setFill(bg);
      doc.roundedRect(PAGE.m, y, CW, h, 2, 2, 'F');
      setFill(bar);
      doc.rect(PAGE.m, y, 1.8, h, 'F');
      setText(C.ink);
      chunk.forEach((ln, i) => doc.text(ln, PAGE.m + 7, y + 6.5 + i * lh));
      y += h + 4;
      idx += chunk.length;
      if (idx < lines.length) newPage();
    }
  };

  const bullets = (items, { color = C.body, dot = C.brand, size = 9.5 } = {}) => {
    arr(items).forEach((it) => {
      const t = clean(typeof it === 'string' ? it : it?.text || JSON.stringify(it));
      if (!t) return;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(t, CW - 8);
      const lh = size * 0.5;
      ensure(lines.length * lh + 2);
      setFill(dot);
      doc.circle(PAGE.m + 2, y + 2.6, 0.8, 'F');
      setText(color);
      lines.forEach((ln, i) => doc.text(ln, PAGE.m + 6, y + 3.5 + i * lh));
      y += lines.length * lh + 1.5;
    });
    y += 2;
  };

  const chips = (items, { fill = C.brandSoft, color = C.brandDark } = {}) => {
    let x = PAGE.m;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    arr(items).forEach((it) => {
      const t = clean(it);
      if (!t) return;
      const w = doc.getTextWidth(t) + 7;
      if (x + w > PAGE.w - PAGE.m) {
        x = PAGE.m;
        y += 8;
      }
      ensure(9);
      setFill(fill);
      doc.roundedRect(x, y, w, 6.5, 3.2, 3.2, 'F');
      setText(color);
      doc.text(t, x + 3.5, y + 4.4);
      x += w + 2.5;
    });
    y += 11;
  };

  const statCards = (cards) => {
    const gap = 4;
    const w = (CW - gap * (cards.length - 1)) / cards.length;
    ensure(26);
    cards.forEach((c, i) => {
      const x = PAGE.m + i * (w + gap);
      setFill(C.white);
      setDraw(C.line);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, w, 22, 2.5, 2.5, 'FD');
      setFill(c.color || C.brand);
      doc.roundedRect(x, y, w, 1.6, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      setText(c.color || C.brand);
      doc.text(clean(c.value), x + w / 2, y + 12, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      setText(C.muted);
      doc.text(clean(c.label), x + w / 2, y + 18, { align: 'center' });
    });
    y += 27;
  };

  const baseTable = (opts) => {
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.m, right: PAGE.m, top: TOP, bottom: 20 },
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 2.6,
        textColor: C.body,
        lineColor: C.line,
        lineWidth: 0.2,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: C.brand,
        textColor: C.white,
        fontStyle: 'bold',
        fontSize: 9,
      },
      alternateRowStyles: { fillColor: C.soft },
      ...opts,
    });
    afterTable();
  };

  const status = (ok, yes = 'Pass', no = 'Fail') => ({
    content: ok ? yes : no,
    styles: { textColor: ok ? C.green : C.red, fontStyle: 'bold' },
  });
  const warn = (text, color = C.amber) => ({
    content: text,
    styles: { textColor: color, fontStyle: 'bold' },
  });

  /* ================================================================ *
   *  COVER PAGE
   * ================================================================ */
  setFill(C.brandDark);
  doc.rect(0, 0, PAGE.w, 112, 'F');
  setFill(C.brand);
  doc.triangle(PAGE.w, 0, PAGE.w, 112, PAGE.w - 95, 0, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setText([199, 210, 254]);
  doc.text('PIXEL GLOBAL IT', PAGE.m, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Digital Marketing & SEO Agency', PAGE.m, 25.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(34);
  setText(C.white);
  doc.text('SEO Audit', PAGE.m, 56);
  doc.text('Report', PAGE.m, 69);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  setText([224, 231, 255]);
  const urlLines = doc.splitTextToSize(clean(report.url), 120);
  doc.text(urlLines.slice(0, 2), PAGE.m, 82);

  doc.setFontSize(10);
  setText([199, 210, 254]);
  let meta = `Analyzed on ${fmtDate(report.analyzed_at)}`;
  doc.text(meta, PAGE.m, 98);
  if (report.user_name) doc.text(`Prepared for: ${clean(report.user_name)}`, PAGE.m, 104);

  // score ring
  const cx = 160;
  const cy = 62;
  const r = 24;
  setFill(C.white);
  doc.circle(cx, cy, r + 5, 'F');
  setDraw(C.line);
  doc.setLineWidth(3.2);
  doc.circle(cx, cy, r, 'S');
  setDraw(scoreColor(score));
  doc.setLineCap('round');
  const steps = Math.max(1, Math.round((score / 100) * 120));
  for (let i = 0; i < steps; i++) {
    const a1 = -Math.PI / 2 + (i / 120) * Math.PI * 2;
    const a2 = -Math.PI / 2 + ((i + 1.4) / 120) * Math.PI * 2;
    doc.line(cx + r * Math.cos(a1), cy + r * Math.sin(a1), cx + r * Math.cos(a2), cy + r * Math.sin(a2));
  }
  doc.setLineCap('butt');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  setText(scoreColor(score));
  doc.text(String(score), cx, cy + 4, { align: 'center' });
  doc.setFontSize(9);
  setText(C.muted);
  doc.text('out of 100', cx, cy + 11, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  setText(C.white);
  doc.text(scoreLabel(score).toUpperCase(), cx, cy + r + 13, { align: 'center' });

  // snapshot cards
  y = 124;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setText(C.ink);
  doc.text('Health Snapshot', PAGE.m, y);
  y += 6;

  const issues = arr(report.seo_issues);
  const count = (p) => issues.filter((i) => String(i.priority).toLowerCase() === p).length;
  const perf = report.page_speed_analysis?.performance_score;
  const flesch = report.readability_analysis?.flesch_reading_ease;

  statCards([
    { label: 'SEO Score', value: `${score}/100`, color: scoreColor(score) },
    {
      label: 'Page Speed',
      value: perf !== undefined && perf !== null ? `${perf}/100` : 'N/A',
      color: perf !== undefined && perf !== null ? scoreColor(perf) : C.muted,
    },
    { label: 'Issues Found', value: String(issues.length), color: issues.length ? C.red : C.green },
    { label: 'Word Count', value: num(report.word_count).toLocaleString('en-US'), color: C.brand },
  ]);

  statCards([
    { label: 'High Priority', value: String(count('high')), color: C.red },
    { label: 'Medium Priority', value: String(count('medium')), color: C.amber },
    { label: 'Low Priority', value: String(count('low')), color: C.blue },
    {
      label: 'Readability',
      value: flesch !== undefined && flesch !== null ? String(flesch) : 'N/A',
      color: C.brand,
    },
  ]);

  if (report.analysis_summary) {
    y += 2;
    subHeading('Executive Summary');
    callout(report.analysis_summary, 'brand');
  }

  /* ================================================================ *
   *  1. ON-PAGE & TECHNICAL OVERVIEW
   * ================================================================ */
  newPage();
  section('Website Overview', 'On-page elements and technical health checks');

  const titleLen = (report.title || '').length;
  const metaLen = (report.meta_description || '').length;
  const h1Count = arr(report.h1_tags).length;
  const tech = report.technical_seo || {};

  const titleStatus =
    !titleLen ? warn('Missing', C.red) : titleLen >= 30 && titleLen <= 60 ? warn('Optimal', C.green) : warn('Check length');
  const metaStatus =
    !metaLen ? warn('Missing', C.red) : metaLen >= 120 && metaLen <= 160 ? warn('Optimal', C.green) : warn('Check length');
  const h1Status =
    h1Count === 1 ? warn('Optimal', C.green) : h1Count === 0 ? warn('Missing', C.red) : warn('Multiple H1');

  baseTable({
    head: [['On-Page Element', 'Value', 'Status']],
    body: [
      ['Title Tag', clean(report.title) || '-', titleStatus],
      ['Title Length', `${titleLen} characters (ideal 30-60)`, ''],
      ['Meta Description', clean(report.meta_description) || '-', metaStatus],
      ['Meta Length', `${metaLen} characters (ideal 120-160)`, ''],
      ['H1 Tags', `${h1Count} found`, h1Status],
      ['Canonical URL', clean(report.canonical_url) || 'Not set', report.canonical_url ? warn('Set', C.green) : warn('Missing', C.red)],
      ['Word Count', num(report.word_count).toLocaleString('en-US'), num(report.word_count) >= 300 ? warn('Good', C.green) : warn('Thin content', C.amber)],
      ['Images', `${num(report.total_images)} total, ${num(report.images_without_alt)} missing ALT`, num(report.images_without_alt) === 0 ? warn('Good', C.green) : warn('Fix ALT', C.amber)],
    ],
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', textColor: C.ink },
      1: { cellWidth: 114 },
      2: { cellWidth: 28, halign: 'center' },
    },
  });

  subHeading('Technical SEO Checks');
  const isIndexable = !(tech.noindex ?? false);
  baseTable({
    head: [['Check', 'Result', 'Details']],
    body: [
      ['SSL / HTTPS', status(report.ssl_enabled ?? tech.ssl_enabled, 'Enabled', 'Not enabled'), 'Encrypts traffic and is a ranking signal'],
      ['robots.txt', status(report.robots_txt_found, 'Found', 'Missing'), 'Guides crawlers on what to index'],
      ['XML Sitemap', status(report.sitemap_found, 'Found', 'Missing'), 'Helps search engines discover pages'],
      ['llm.txt', status(tech.llm_txt_found, 'Found', 'Missing'), 'Guidance file for AI crawlers'],
      ['Indexability', status(isIndexable, 'Indexable', 'Blocked (noindex)'), isIndexable ? 'Page can appear in search results' : `Meta robots: ${clean(tech.robots_directive) || 'noindex'}`],
      ['Structured Data', status(report.schema_analysis?.has_schema, 'Present', 'Not found'), arr(report.schema_analysis?.schema_types).length ? clean(report.schema_analysis.schema_types.join(', ')) : 'No schema types detected'],
    ],
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', textColor: C.ink },
      1: { cellWidth: 38, halign: 'center' },
      2: { cellWidth: 104 },
    },
  });

  if (arr(report.canonical_issues).length) {
    subHeading('Canonical Issues');
    bullets(report.canonical_issues, { dot: C.red });
  }

  /* ---- heading structure ---- */
  const levels = [
    ['H1', report.h1_tags],
    ['H2', report.h2_tags],
    ['H3', report.h3_tags],
    ['H4', report.h4_tags],
    ['H5', report.h5_tags],
    ['H6', report.h6_tags],
  ];
  section('Heading Structure', 'How the page content is organised');
  statCards(
    levels.slice(0, 6).map(([l, v]) => ({ label: `${l} tags`, value: String(arr(v).length), color: C.brand }))
  );
  const headingRows = [];
  levels.forEach(([l, v]) => {
    const list = arr(v);
    list.slice(0, 15).forEach((h) => headingRows.push([l, clean(h)]));
    if (list.length > 15) headingRows.push([l, `... and ${list.length - 15} more`]);
  });
  if (headingRows.length) {
    baseTable({
      head: [['Level', 'Heading Text']],
      body: headingRows,
      columnStyles: { 0: { cellWidth: 18, fontStyle: 'bold', textColor: C.brand }, 1: { cellWidth: 162 } },
    });
  }

  /* ================================================================ *
   *  2. SEO ISSUES
   * ================================================================ */
  if (issues.length) {
    section('SEO Issues & Recommendations', `${issues.length} issue${issues.length !== 1 ? 's' : ''} detected, sorted by priority`);
    const order = { high: 0, medium: 1, low: 2 };
    const sorted = [...issues].sort(
      (a, b) => (order[String(a.priority).toLowerCase()] ?? 3) - (order[String(b.priority).toLowerCase()] ?? 3)
    );
    baseTable({
      head: [['#', 'Priority', 'Category', 'Issue', 'Recommendation']],
      body: sorted.map((it, i) => [
        String(i + 1),
        { content: clean(it.priority), styles: { textColor: priorityColor(it.priority), fontStyle: 'bold' } },
        clean(it.category),
        clean(it.issue),
        clean(it.recommendation),
      ]),
      styles: { fontSize: 8.5, cellPadding: 2.4, textColor: C.body, lineColor: C.line, lineWidth: 0.2, valign: 'top' },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 17 },
        2: { cellWidth: 24, fontStyle: 'bold', textColor: C.ink },
        3: { cellWidth: 55 },
        4: { cellWidth: 76 },
      },
    });
  }

  /* ================================================================ *
   *  3. KEYWORD STRATEGY & DENSITY
   * ================================================================ */
  const ks = report.keyword_strategy;
  if (ks && (ks.primary_keyword || arr(ks.long_tail_keywords).length)) {
    section('Keyword Strategy', 'Recommended targeting based on page content');
    if (ks.primary_keyword) {
      callout(`Primary keyword:  ${clean(ks.primary_keyword)}`, 'brand');
    }
    const intents = ks.keyword_intent || {};
    if (arr(ks.long_tail_keywords).length) {
      subHeading('Long-tail Opportunities');
      baseTable({
        head: [['#', 'Keyword', 'Search Intent']],
        body: ks.long_tail_keywords.map((k, i) => [String(i + 1), clean(k), clean(intents[k]) || '-']),
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 110, fontStyle: 'bold', textColor: C.ink }, 2: { cellWidth: 60 } },
      });
    }
  }

  const kd = report.keyword_density_analysis;
  if (kd && (arr(kd.top_keywords).length || arr(kd.top_phrases).length)) {
    section('Keyword Density Analysis', 'Which words and phrases dominate the page');
    statCards([
      { label: 'Total Words', value: num(kd.total_words).toLocaleString('en-US'), color: C.brand },
      { label: 'Unique Words', value: num(kd.unique_words).toLocaleString('en-US'), color: C.brand },
      { label: 'Lexical Diversity', value: kd.lexical_diversity !== undefined ? String(kd.lexical_diversity) : 'N/A', color: C.blue },
      { label: 'Stuffing Risk', value: kd.keyword_stuffing_risk ? 'Yes' : 'No', color: kd.keyword_stuffing_risk ? C.red : C.green },
    ]);
    if (arr(kd.top_keywords).length) {
      subHeading('Top Keywords');
      baseTable({
        head: [['Keyword', 'Count', 'Density', 'In Title', 'In Meta']],
        body: kd.top_keywords.slice(0, 10).map((k) => [
          clean(k.keyword),
          String(k.count ?? ''),
          `${k.density_percent ?? 0}%`,
          k.in_title ? warn('Yes', C.green) : warn('No', C.red),
          k.in_meta ? warn('Yes', C.green) : warn('No', C.red),
        ]),
        columnStyles: {
          0: { cellWidth: 70, fontStyle: 'bold', textColor: C.ink },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 27, halign: 'center' },
          4: { cellWidth: 28, halign: 'center' },
        },
      });
    }
    if (arr(kd.top_phrases).length) {
      subHeading('Top Phrases');
      baseTable({
        head: [['Phrase', 'Occurrences', 'Density']],
        body: kd.top_phrases.slice(0, 8).map((p) => [clean(p.phrase), String(p.count ?? ''), `${p.density_percent ?? 0}%`]),
        columnStyles: { 0: { cellWidth: 110, fontStyle: 'bold', textColor: C.ink }, 1: { cellWidth: 35, halign: 'center' }, 2: { cellWidth: 35, halign: 'center' } },
      });
    }
    if (arr(kd.recommendations).length) {
      subHeading('Recommendations');
      bullets(kd.recommendations);
    }
  }

  /* ================================================================ *
   *  4. READABILITY
   * ================================================================ */
  const rd = report.readability_analysis;
  if (rd && Object.keys(rd).length) {
    section('Content Readability', 'How easy the content is to read');
    statCards([
      { label: 'Flesch Reading Ease', value: String(rd.flesch_reading_ease ?? 'N/A'), color: C.brand },
      { label: 'Reading Grade', value: clean(rd.readability_grade) || 'N/A', color: C.blue },
      { label: 'Difficulty', value: clean(rd.difficulty_level) || 'N/A', color: C.amber },
      { label: 'Reading Time', value: rd.reading_time_minutes !== undefined ? `${rd.reading_time_minutes} min` : 'N/A', color: C.green },
    ]);
  }

  /* ================================================================ *
   *  5. PAGE SPEED
   * ================================================================ */
  const ps = report.page_speed_analysis;
  if (ps && Object.keys(ps).length) {
    section('Page Speed & Performance', 'Load behaviour, resources and optimisation');
    const p = num(ps.performance_score, 0);
    callout(`Performance score: ${p}/100  (${clean(ps.performance_grade) || scoreLabel(p)})`, p >= 80 ? 'green' : p >= 60 ? 'amber' : 'red');
    baseTable({
      head: [['Metric', 'Value', 'Grade']],
      body: [
        ['Total Load Time', ps.total_load_time_seconds !== undefined ? `${ps.total_load_time_seconds} s` : '-', clean(ps.load_time_grade) || '-'],
        ['Page Size', ps.page_size_mb !== undefined ? `${ps.page_size_mb} MB` : '-', clean(ps.size_grade) || '-'],
        ['Total Resources', String(ps.total_resources ?? '-'), ''],
        ['Images', String(ps.images_count ?? '-'), ''],
        ['External Scripts', String(ps.external_scripts_count ?? '-'), ''],
        ['External CSS', String(ps.external_css_count ?? '-'), ''],
        ['Render-blocking Scripts', String(ps.render_blocking_scripts ?? '-'), num(ps.render_blocking_scripts) > 0 ? warn('Review', C.amber) : warn('Good', C.green)],
        ['Compression', ps.compression_enabled ? `Enabled${ps.compression_type ? ` (${clean(ps.compression_type)})` : ''}` : 'Disabled', ps.compression_enabled ? warn('Good', C.green) : warn('Enable', C.red)],
        ['Browser Caching', ps.caching_enabled ? 'Enabled' : 'Disabled', ps.caching_enabled ? warn('Good', C.green) : warn('Enable', C.red)],
      ],
      columnStyles: { 0: { cellWidth: 70, fontStyle: 'bold', textColor: C.ink }, 1: { cellWidth: 70 }, 2: { cellWidth: 40, halign: 'center' } },
    });
    if (arr(ps.issues).length) {
      subHeading('Performance Issues');
      bullets(ps.issues, { dot: C.red });
    }
    if (arr(ps.recommendations).length) {
      subHeading('Optimisation Recommendations');
      bullets(ps.recommendations, { dot: C.green });
    }
  }

  /* ================================================================ *
   *  6. LINK ANALYSIS
   * ================================================================ */
  const la = report.linking_analysis;
  if (la && Object.keys(la).length) {
    section('Internal & External Links', 'Link structure and anchor-text quality');
    statCards([
      { label: 'Total Links', value: String(la.total_links ?? 0), color: C.brand },
      { label: 'Internal', value: String(la.internal_count ?? arr(la.internal_links).length), color: C.blue },
      { label: 'External', value: String(la.external_count ?? arr(la.external_links).length), color: C.green },
      { label: 'Empty Anchors', value: String(la.empty_anchor_count ?? 0), color: num(la.empty_anchor_count) ? C.red : C.green },
    ]);
    if (la.internal_ratio !== undefined || la.nofollow_internal_count !== undefined) {
      paragraph(
        `Internal link ratio: ${la.internal_ratio ?? '-'}%   |   Nofollow internal links: ${la.nofollow_internal_count ?? 0}`,
        { size: 9.5, color: C.muted }
      );
    }
    if (arr(la.recommendations).length) {
      subHeading('Recommendations');
      bullets(la.recommendations);
    }
    const linkTable = (title, list, limit) => {
      if (!arr(list).length) return;
      subHeading(`${title} (${list.length})`);
      const rows = list.slice(0, limit).map((l, i) => [
        String(i + 1),
        clean(l.url),
        clean(l.anchor_text) || { content: 'Empty', styles: { textColor: C.red, fontStyle: 'italic' } },
      ]);
      if (list.length > limit) rows.push(['', `... and ${list.length - limit} more links`, '']);
      baseTable({
        head: [['#', 'URL', 'Anchor Text']],
        body: rows,
        styles: { fontSize: 8, cellPadding: 2, textColor: C.body, lineColor: C.line, lineWidth: 0.2 },
        columnStyles: { 0: { cellWidth: 9, halign: 'center' }, 1: { cellWidth: 104, overflow: 'linebreak' }, 2: { cellWidth: 67 } },
      });
    };
    linkTable('Links With Empty Anchor Text', la.empty_anchor_links, 25);
    linkTable('Internal Links', la.internal_links, 25);
    linkTable('External Links', la.external_links, 25);
  }

  /* ================================================================ *
   *  7. BACKLINK / OUTBOUND DOMAINS
   * ================================================================ */
  const bl = report.backlink_analysis;
  if (bl && Object.keys(bl).length) {
    section('Backlink & Domain Profile', 'Outbound link quality and top linked domains');
    statCards([
      { label: 'External Links', value: String(bl.total_external_links ?? 0), color: C.brand },
      { label: 'Unique Domains', value: String(bl.unique_domains ?? 0), color: C.blue },
      { label: 'Dofollow', value: String(bl.dofollow_count ?? 0), color: C.green },
      { label: 'Nofollow', value: String(bl.nofollow_count ?? 0), color: C.amber },
    ]);
    if (bl.link_quality_score !== undefined) {
      paragraph(`Link quality score: ${bl.link_quality_score}`, { bold: true, color: C.ink });
    }
    if (arr(bl.top_linked_domains).length) {
      subHeading('Top Linked Domains');
      baseTable({
        head: [['Domain', 'Links', 'Estimated Authority']],
        body: bl.top_linked_domains.slice(0, 10).map((d) => [clean(d.domain), String(d.link_count ?? ''), clean(d.estimated_authority)]),
        columnStyles: { 0: { cellWidth: 95, fontStyle: 'bold', textColor: C.ink }, 1: { cellWidth: 25, halign: 'center' }, 2: { cellWidth: 60 } },
      });
    }
    if (arr(bl.recommendations).length) {
      subHeading('Recommendations');
      bullets(bl.recommendations);
    }
  }

  /* ================================================================ *
   *  8. COMPETITORS
   * ================================================================ */
  const ca = report.competitor_analysis;
  if (ca && (arr(ca.assumed_competitors).length || arr(ca.content_gaps).length || arr(ca.opportunities).length)) {
    section('Competitor Analysis', 'Where you stand and where to grow');
    if (arr(ca.assumed_competitors).length) {
      subHeading('Likely Competitors');
      chips(ca.assumed_competitors);
    }
    if (arr(ca.content_gaps).length) {
      subHeading('Content Gaps');
      bullets(ca.content_gaps, { dot: C.red });
    }
    if (arr(ca.opportunities).length) {
      subHeading('Opportunities');
      bullets(ca.opportunities, { dot: C.green });
    }
  }

  /* ================================================================ *
   *  9. CONTENT RECOMMENDATIONS
   * ================================================================ */
  const recs = arr(report.content_recommendations);
  if (recs.length) {
    section('Content Recommendations', 'Suggested pages and heading structures');
    recs.forEach((rec, i) => {
      ensure(40);
      subHeading(`${i + 1}. ${clean(rec.topic)}  [${clean(rec.page_type)}]`);
      if (arr(rec.target_keywords).length) {
        paragraph('Target keywords', { size: 8.5, color: C.muted, bold: true });
        chips(rec.target_keywords);
      }
      const rows = [];
      ['h1', 'h2', 'h3'].forEach((lvl) => {
        arr(rec.structure?.[lvl]).forEach((h) => rows.push([lvl.toUpperCase(), clean(h)]));
      });
      if (rows.length) {
        baseTable({
          head: [['Level', 'Suggested Heading']],
          body: rows,
          styles: { fontSize: 8.5, cellPadding: 2.2, textColor: C.body, lineColor: C.line, lineWidth: 0.2 },
          columnStyles: { 0: { cellWidth: 18, fontStyle: 'bold', textColor: C.brand }, 1: { cellWidth: 162 } },
        });
      }
    });
  }

  /* ================================================================ *
   *  10. 30-DAY ACTION PLAN
   * ================================================================ */
  const plan = arr(report.action_plan_30_days);
  if (plan.length) {
    section('30-Day Action Plan', 'A week-by-week roadmap to improve your rankings');
    baseTable({
      head: [['Timeline', 'Priority', 'Action', 'Expected Impact']],
      body: plan.map((it, i) => [
        clean(it.week) || `Week ${i + 1}`,
        it.priority ? { content: clean(it.priority), styles: { textColor: priorityColor(it.priority), fontStyle: 'bold' } } : '-',
        clean(it.action),
        clean(it.expected_impact) || '-',
      ]),
      styles: { fontSize: 9, cellPadding: 2.8, textColor: C.body, lineColor: C.line, lineWidth: 0.2, valign: 'top' },
      columnStyles: { 0: { cellWidth: 24, fontStyle: 'bold', textColor: C.ink }, 1: { cellWidth: 20 }, 2: { cellWidth: 80 }, 3: { cellWidth: 56 } },
    });
  }

  /* ================================================================ *
   *  11. DEVICE SCREENSHOTS (only when captured)
   * ================================================================ */
  const shots = report.responsive_preview || {};
  const shotKeys = ['desktop', 'tablet', 'mobile'].filter((k) => shots[k]?.image);
  if (shotKeys.length) {
    newPage();
    section('Responsive Preview', 'How the page renders on different devices');
    shotKeys.forEach((k) => {
      try {
        const src = `data:image/png;base64,${shots[k].image}`;
        const props = doc.getImageProperties(src);
        const maxW = k === 'mobile' ? 60 : k === 'tablet' ? 90 : CW;
        const maxH = k === 'desktop' ? 95 : 130;
        let w = maxW;
        let h = (props.height * w) / props.width;
        if (h > maxH) {
          h = maxH;
          w = (props.width * h) / props.height;
        }
        ensure(h + 14);
        subHeading(k.charAt(0).toUpperCase() + k.slice(1));
        setDraw(C.line);
        doc.setLineWidth(0.4);
        doc.roundedRect(PAGE.m - 1, y - 1, w + 2, h + 2, 1.5, 1.5, 'S');
        doc.addImage(src, 'PNG', PAGE.m, y, w, h, undefined, 'FAST');
        y += h + 8;
      } catch {
        /* skip broken image */
      }
    });
  }

  /* ================================================================ *
   *  CHROME: header + footer on every page, closing note
   * ================================================================ */
  // closing call-to-action: only when it fits on the current page (no near-empty last page)
  if (y + 4 + 20 <= BOTTOM) {
    y += 4;
    setFill(C.brandSoft);
    doc.roundedRect(PAGE.m, y, CW, 20, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    setText(C.brandDark);
    doc.text('Need help implementing these recommendations?', PAGE.m + 6, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setText(C.body);
    doc.text('Contact Pixel Global IT - pixelglobalit.com', PAGE.m + 6, y + 14);
  }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    if (i > 1) {
      setFill(C.brand);
      doc.rect(0, 0, PAGE.w, 2.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      setText(C.brandDark);
      doc.text('PIXEL GLOBAL IT', PAGE.m, 11);
      doc.setFont('helvetica', 'normal');
      setText(C.muted);
      doc.text(`SEO Report  |  ${host}`, PAGE.w - PAGE.m, 11, { align: 'right' });
      setDraw(C.line);
      doc.setLineWidth(0.25);
      doc.line(PAGE.m, 14, PAGE.w - PAGE.m, 14);
    }
    setDraw(C.line);
    doc.setLineWidth(0.25);
    doc.line(PAGE.m, 287, PAGE.w - PAGE.m, 287);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setText(C.muted);
    doc.text(`Generated by Pixel Global IT  |  ${fmtDate(report.analyzed_at)}`, PAGE.m, 292);
    doc.text(`Page ${i} of ${total}`, PAGE.w - PAGE.m, 292, { align: 'right' });
  }

  return doc;
}

export function downloadReportPdf(report) {
  const doc = buildReportPdf(report);
  doc.save(`SEO-Report-${hostOf(report.url).replace(/[^a-z0-9.-]/gi, '-')}.pdf`);
}
