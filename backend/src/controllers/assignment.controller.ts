import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { createAssignmentSchema } from '../utils/validation';
import { getGenerationQueue } from '../queue';
import { emitAssignmentEvent } from '../sockets';
import { extractText } from '../services/fileExtractor';
import { paperToPdf } from '../services/pdf';
import { log } from '../utils/logger';

function parseQuestionTypes(raw: unknown): unknown {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

export async function createAssignment(
  req: Request,
  res: Response
): Promise<void> {
  const body = {
    ...req.body,
    questionTypes: parseQuestionTypes(req.body.questionTypes),
  };
  // Coerce numeric fields that come in as strings via multipart/form-data
  if (Array.isArray(body.questionTypes)) {
    body.questionTypes = body.questionTypes.map((q: any) => ({
      type: q.type,
      count: Number(q.count),
      marksPerQuestion: Number(q.marksPerQuestion),
    }));
  }

  const parsed = createAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten(),
    });
    return;
  }

  const data = parsed.data;
  const totalQuestions = data.questionTypes.reduce((s, q) => s + q.count, 0);
  const totalMarks = data.questionTypes.reduce(
    (s, q) => s + q.count * q.marksPerQuestion,
    0
  );

  let uploadedFile: any = undefined;
  if (req.file) {
    const text = await extractText(req.file.buffer, req.file.mimetype);
    uploadedFile = {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      extractedText: text,
    };
  }

  const a = await Assignment.create({
    title: data.title,
    subject: data.subject,
    className: data.className,
    schoolName: data.schoolName ?? 'St. Xaviers High School, Lucknow',
    dueDate: new Date(data.dueDate),
    questionTypes: data.questionTypes,
    totalQuestions,
    totalMarks,
    additionalInstructions: data.additionalInstructions,
    uploadedFile,
    status: 'queued',
  });

  const queue = getGenerationQueue();
  const job = await queue.add('generate', { assignmentId: a._id.toString() });
  a.jobId = job.id;
  await a.save();

  log.ok(
    'queue',
    `assignment "${a.title}" → enqueued (id=${a._id}, jobId=${job.id}, totalQ=${totalQuestions}, totalM=${totalMarks})`
  );

  emitAssignmentEvent({
    type: 'queued',
    assignmentId: a._id.toString(),
  });

  res.status(201).json(a);
}

export async function listAssignments(_req: Request, res: Response): Promise<void> {
  const items = await Assignment.find()
    .sort({ createdAt: -1 })
    .select('-generatedPaper.answerKey')
    .lean();
  res.json(items);
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const a = await Assignment.findById(req.params.id).lean();
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(a);
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const r = await Assignment.findByIdAndDelete(req.params.id);
  if (!r) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json({ ok: true });
}

export async function regenerateAssignment(
  req: Request,
  res: Response
): Promise<void> {
  const a = await Assignment.findById(req.params.id);
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  a.status = 'queued';
  a.error = undefined;
  a.generatedPaper = undefined;
  await a.save();

  const queue = getGenerationQueue();
  const job = await queue.add('generate', {
    assignmentId: a._id.toString(),
    force: true,
  });
  a.jobId = job.id;
  await a.save();

  log.ok(
    'queue',
    `assignment "${a.title}" → regenerate enqueued (id=${a._id}, jobId=${job.id}, cache bypass)`
  );

  emitAssignmentEvent({ type: 'queued', assignmentId: a._id.toString() });

  res.json(a);
}

export async function toggleFavorite(req: Request, res: Response): Promise<void> {
  const a = await Assignment.findById(req.params.id);
  if (!a) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  a.isFavorite = !a.isFavorite;
  await a.save();
  log.ok('assignment', `favorite toggled → ${a.isFavorite} (${a._id})`);
  res.json({ ok: true, isFavorite: a.isFavorite });
}

export async function downloadPdf(req: Request, res: Response): Promise<void> {
  const a = await Assignment.findById(req.params.id).lean();
  if (!a || !a.generatedPaper) {
    res.status(404).json({ error: 'Paper not ready' });
    return;
  }
  log.step('pdf', `rendering PDF for "${a.title}" (${a._id})`);
  const pdf = await paperToPdf(a.generatedPaper);
  log.ok('pdf', `PDF generated (${(pdf.length / 1024).toFixed(1)} KB)`);
  const safe = a.title.replace(/[^a-z0-9-]+/gi, '_').slice(0, 60);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${safe || 'question-paper'}.pdf"`
  );
  res.send(pdf);
}
