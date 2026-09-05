/**
 * Distributes the 923 parsed questions into 14 mock exams with a
 * zero-repetition guarantee: every question_id appears in exactly one exam.
 *
 * Distribution: 13 exams x 66 questions + 1 exam x 65 questions = 923.
 *
 * Within each exam, questions are drawn proportionally from each domain
 * (matching the overall domain weights) so every mock exam is a
 * representative mini-version of the full bank, mirroring the official
 * SAA-C03 domain weighting described in the PRD.
 *
 * Output:
 *   data/exams-full.json      -> { "1": { exam_id, question_count, questions: [...] }, ... }
 *   data/exams-metadata.json  -> summary/index (counts, domain breakdown per exam)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_FILE = path.join(__dirname, '..', 'data', 'SAA-C03-QuestionBank-923.json');
const EXAMS_FULL_FILE = path.join(__dirname, '..', 'data', 'exams-full.json');
const EXAMS_META_FILE = path.join(__dirname, '..', 'data', 'exams-metadata.json');

const TOTAL_EXAMS = 14;
const EXAM_SIZES = Array.from({ length: TOTAL_EXAMS }, (_, i) => (i < 13 ? 66 : 65)); // 13x66 + 1x65 = 923

// Deterministic shuffle (seeded) so re-runs are reproducible.
function seededShuffle(array, seed) {
  const arr = array.slice();
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function run() {
  const questions = JSON.parse(readFileSync(QUESTIONS_FILE, 'utf-8'));
  if (questions.length !== 923) {
    console.error(`Expected 923 questions, found ${questions.length}. Aborting.`);
    process.exit(1);
  }

  // Group question IDs by domain, shuffled deterministically.
  const byDomain = new Map();
  for (const q of questions) {
    if (!byDomain.has(q.domain)) byDomain.set(q.domain, []);
    byDomain.get(q.domain).push(q.question_id);
  }
  for (const [domain, ids] of byDomain) {
    byDomain.set(domain, seededShuffle(ids, domain.length * 1000 + ids.length));
  }

  const domains = [...byDomain.keys()];
  const domainTotals = new Map(domains.map((d) => [d, byDomain.get(d).length]));
  const grandTotal = questions.length;

  // Pointers into each domain's shuffled ID list.
  const pointers = new Map(domains.map((d) => [d, 0]));

  const exams = [];
  for (let examIndex = 0; examIndex < TOTAL_EXAMS; examIndex++) {
    const size = EXAM_SIZES[examIndex];
    const remainingExams = TOTAL_EXAMS - examIndex;
    const examIds = [];

    // Proportional allocation per domain for this exam, largest-remainder method
    // to keep rounding fair across all 14 exams.
    const rawShares = domains.map((d) => (domainTotals.get(d) / grandTotal) * size);
    const floorShares = rawShares.map(Math.floor);
    let allocated = floorShares.reduce((a, b) => a + b, 0);
    let remainder = size - allocated;

    // Distribute leftover slots to domains with the largest fractional part.
    const fractional = rawShares
      .map((v, i) => ({ i, frac: v - floorShares[i] }))
      .sort((a, b) => b.frac - a.frac);

    const shares = floorShares.slice();
    for (let k = 0; k < remainder; k++) {
      shares[fractional[k % fractional.length].i] += 1;
    }

    domains.forEach((domain, i) => {
      let take = shares[i];
      const ids = byDomain.get(domain);
      let ptr = pointers.get(domain);
      const remainingInDomain = ids.length - ptr;

      // Safety: if this domain is running low (shouldn't happen with correct
      // proportional math, but guard against rounding edge cases near the end),
      // cap take at what's left.
      take = Math.min(take, remainingInDomain);

      for (let k = 0; k < take; k++) {
        examIds.push(ids[ptr]);
        ptr++;
      }
      pointers.set(domain, ptr);
    });

    // If proportional allocation came up short (rounding edge cases), backfill
    // from whichever domain still has the most remaining questions.
    while (examIds.length < size) {
      const domainWithMost = domains
        .map((d) => ({ d, remaining: byDomain.get(d).length - pointers.get(d) }))
        .sort((a, b) => b.remaining - a.remaining)[0];
      if (!domainWithMost || domainWithMost.remaining <= 0) break;
      const ids = byDomain.get(domainWithMost.d);
      let ptr = pointers.get(domainWithMost.d);
      examIds.push(ids[ptr]);
      pointers.set(domainWithMost.d, ptr + 1);
    }

    exams.push({
      exam_id: examIndex + 1,
      question_count: examIds.length,
      question_ids: seededShuffle(examIds, examIndex + 1), // shuffle final order within exam
    });
  }

  // Verify zero repetition and full coverage.
  const allIds = exams.flatMap((e) => e.question_ids);
  const uniqueIds = new Set(allIds);
  const questionById = new Map(questions.map((q) => [q.question_id, q]));

  const errors = [];
  if (allIds.length !== 923) errors.push(`Total assigned questions ${allIds.length} !== 923`);
  if (uniqueIds.size !== 923) errors.push(`Unique assigned questions ${uniqueIds.size} !== 923 (repetition detected)`);
  const missing = questions.filter((q) => !uniqueIds.has(q.question_id));
  if (missing.length) errors.push(`${missing.length} questions were never assigned to any exam`);

  if (errors.length) {
    console.error('EXAM DISTRIBUTION FAILED:\n' + errors.join('\n'));
    process.exit(1);
  }

  // Build full exam payloads (embed full question objects) + metadata index.
  const examsFull = {};
  const examsMeta = [];
  for (const exam of exams) {
    const examQuestions = exam.question_ids.map((id) => questionById.get(id));
    examsFull[String(exam.exam_id)] = {
      exam_id: exam.exam_id,
      question_count: exam.question_count,
      questions: examQuestions,
    };

    const domainBreakdown = {};
    for (const q of examQuestions) {
      domainBreakdown[q.domain] = (domainBreakdown[q.domain] || 0) + 1;
    }

    examsMeta.push({
      exam_id: exam.exam_id,
      question_count: exam.question_count,
      question_ids: exam.question_ids,
      domain_breakdown: domainBreakdown,
    });
  }

  writeFileSync(EXAMS_FULL_FILE, JSON.stringify(examsFull, null, 2), 'utf-8');
  writeFileSync(
    EXAMS_META_FILE,
    JSON.stringify(
      {
        total_exams: TOTAL_EXAMS,
        total_questions: 923,
        exam_sizes: EXAM_SIZES,
        zero_repetition_verified: true,
        exams: examsMeta,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(
    JSON.stringify(
      {
        exams_generated: exams.length,
        total_questions_assigned: allIds.length,
        unique_questions_assigned: uniqueIds.size,
        zero_repetition_ok: uniqueIds.size === 923,
      },
      null,
      2
    )
  );
}

run();
