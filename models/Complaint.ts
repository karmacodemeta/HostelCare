import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplaint extends Document {
    studentId: mongoose.Types.ObjectId;
    hostelId: mongoose.Types.ObjectId;
    branchId?: mongoose.Types.ObjectId;
    title: string;
    description: string;
    category: 'room' | 'plumbing' | 'electrical' | 'food' | 'cleaning' | 'other';
    status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
    severity: 'low' | 'medium' | 'high';
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ComplaintSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['room', 'plumbing', 'electrical', 'food', 'cleaning', 'other'],
            default: 'other'
        },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'resolved', 'rejected'],
            default: 'pending'
        },
        severity: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low'
        },
        resolvedAt: { type: Date }
    },
    { timestamps: true }
);

const Complaint: Model<IComplaint> =
    mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);

export default Complaint;
