import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHostel extends Document {
    name: string;
    ownerName: string;
    address: string;
    contactNumber: string;
    subscriptionStatus: 'active' | 'inactive';
    features: string[]; // Added feature flags
    createdAt: Date;
    updatedAt: Date;
}

const HostelSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        ownerName: { type: String, required: true },
        address: { type: String, required: true },
        contactNumber: { type: String, required: true },
        subscriptionStatus: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        features: {
            type: [String],
            default: []
        },
    },
    { timestamps: true }
);

const Hostel: Model<IHostel> =
    mongoose.models.Hostel || mongoose.model<IHostel>('Hostel', HostelSchema);

export default Hostel;
