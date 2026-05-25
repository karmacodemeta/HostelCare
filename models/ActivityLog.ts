import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
    action: string;
    entityType: 'Student' | 'Expense' | 'Branch' | 'System' | 'Payment';
    entityId?: mongoose.Types.ObjectId;
    details?: any;
    performedBy?: string; // Name of user/admin
    hostelId?: mongoose.Types.ObjectId; // Link to Hostel model
    timestamp: Date;
}

const ActivityLogSchema: Schema = new Schema(
    {
        action: { type: String, required: true },
        entityType: {
            type: String,
            enum: ['Student', 'Expense', 'Branch', 'System', 'Payment'],
            required: true,
        },
        entityId: { type: Schema.Types.ObjectId },
        details: { type: Schema.Types.Mixed }, // Flexible field for any JSON data
        performedBy: { type: String, default: 'Admin' },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Index for faster queries on dashboard
ActivityLogSchema.index({ timestamp: -1 });

const ActivityLog: Model<IActivityLog> =
    mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);

export default ActivityLog;
