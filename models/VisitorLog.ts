import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVisitorLog extends Document {
    studentId: mongoose.Types.ObjectId;
    hostelId: mongoose.Types.ObjectId;
    branchId: mongoose.Types.ObjectId;
    name: string;
    relation: string;
    contactNumber: string;
    purpose: string;
    checkIn: Date;
    checkOut?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const VisitorLogSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
        name: { type: String, required: true },
        relation: { type: String, required: true },
        contactNumber: { type: String, required: true },
        purpose: { type: String, required: true },
        checkIn: { type: Date, required: true, default: Date.now },
        checkOut: { type: Date }
    },
    { timestamps: true }
);

const VisitorLog: Model<IVisitorLog> =
    mongoose.models.VisitorLog || mongoose.model<IVisitorLog>('VisitorLog', VisitorLogSchema);

export default VisitorLog;
