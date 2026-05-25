import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeave extends Document {
    studentId: mongoose.Types.ObjectId;
    hostelId: mongoose.Types.ObjectId;
    branchId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        approvedBy: { type: String }
    },
    { timestamps: true }
);

const Leave: Model<ILeave> =
    mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
