import { Request, Response } from 'express';
import { z } from 'zod';
import { Group } from '../models/Group';
import { Assignment } from '../models/Assignment';
import { log } from '../utils/logger';

const COLORS = [
  'orange',
  'rose',
  'amber',
  'emerald',
  'sky',
  'violet',
  'pink',
  'indigo',
] as const;

const groupSchema = z.object({
  name: z.string().min(1).max(80),
  subject: z.string().min(1).max(60),
  className: z.string().min(1).max(40),
  studentCount: z.number().int().min(0).max(500).optional(),
  color: z.enum(COLORS).optional(),
  description: z.string().max(500).optional(),
});

export async function listGroups(_req: Request, res: Response): Promise<void> {
  const groups = await Group.find().sort({ createdAt: -1 }).lean();
  // attach assignment counts per group's className+subject pair
  const counts = await Assignment.aggregate([
    {
      $group: {
        _id: { className: '$className', subject: '$subject' },
        count: { $sum: 1 },
      },
    },
  ]);
  const countMap = new Map<string, number>();
  for (const c of counts) {
    countMap.set(`${c._id.className}::${c._id.subject}`, c.count);
  }
  const enriched = groups.map((g) => ({
    ...g,
    assignmentCount: countMap.get(`${g.className}::${g.subject}`) ?? 0,
  }));
  res.json(enriched);
}

export async function createGroup(req: Request, res: Response): Promise<void> {
  const parsed = groupSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }
  const g = await Group.create(parsed.data);
  log.ok('group', `created "${g.name}" (${g._id})`);
  res.status(201).json(g);
}

export async function updateGroup(req: Request, res: Response): Promise<void> {
  const parsed = groupSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: 'Validation failed', details: parsed.error.flatten() });
    return;
  }
  const g = await Group.findByIdAndUpdate(req.params.id, parsed.data, {
    new: true,
  });
  if (!g) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(g);
}

export async function deleteGroup(req: Request, res: Response): Promise<void> {
  const r = await Group.findByIdAndDelete(req.params.id);
  if (!r) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  log.ok('group', `deleted ${req.params.id}`);
  res.json({ ok: true });
}
