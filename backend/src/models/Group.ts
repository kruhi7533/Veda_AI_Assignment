import { Schema, model, Document, Types } from 'mongoose';

export interface GroupDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  subject: string;
  className: string;
  studentCount: number;
  color: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<GroupDoc>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    studentCount: { type: Number, default: 0, min: 0 },
    color: { type: String, default: 'orange' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

GroupSchema.index({ createdAt: -1 });

export const Group = model<GroupDoc>('Group', GroupSchema);
