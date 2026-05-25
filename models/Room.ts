import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoom extends Document {
    hostelId: mongoose.Types.ObjectId;
    branchId: mongoose.Types.ObjectId;
    roomNo: string;
    type: 'single' | 'double' | 'triple' | 'four_sharing';
    capacity: number;
    sharingType: 'ac' | 'non_ac';
    rent: number;
    students: mongoose.Types.ObjectId[];
    isActive: boolean;
    sizeSqFt: number;
    washroomType: 'attached_private' | 'attached_shared' | 'common';
    images: string[];
    specifications: string[];
    createdAt: Date;
    updatedAt: Date;
}

const RoomSchema: Schema = new Schema(
    {
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
        roomNo: { type: String, required: true },
        type: {
            type: String,
            enum: ['single', 'double', 'triple', 'four_sharing'],
            default: 'double'
        },
        capacity: { type: Number, required: true, default: 2 },
        sharingType: {
            type: String,
            enum: ['ac', 'non_ac'],
            default: 'non_ac'
        },
        rent: { type: Number, required: true, default: 5000 },
        students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
        isActive: { type: Boolean, default: true },
        sizeSqFt: { type: Number, default: 180 },
        washroomType: {
            type: String,
            enum: ['attached_private', 'attached_shared', 'common'],
            default: 'attached_shared'
        },
        images: { type: [String], default: [] },
        specifications: { type: [String], default: [] }
    },
    { timestamps: true }
);

// Compound index to ensure roomNo is unique per branch
RoomSchema.index({ roomNo: 1, branchId: 1 }, { unique: true });

const Room: Model<IRoom> =
    mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
