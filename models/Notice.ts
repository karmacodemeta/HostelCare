import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotice extends Document {
    hostelId: mongoose.Types.ObjectId;
    branchId?: mongoose.Types.ObjectId;
    title: string;
    content: string;
    audience: 'all' | 'staff' | 'student';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NoticeSchema: Schema = new Schema(
    {
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
        title: { type: String, required: true },
        content: { type: String, required: true },
        audience: {
            type: String,
            enum: ['all', 'staff', 'student'],
            default: 'all'
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Notice: Model<INotice> =
    mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);

export default Notice;
