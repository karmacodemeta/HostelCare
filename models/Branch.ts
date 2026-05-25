import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBranch extends Document {
    name: string;
    address?: string;
    managerName?: string;
    hostelId?: mongoose.Types.ObjectId; // Link to Hostel model
    totalRooms?: number;
    capacity?: number;
    images: string[];
    amenities: string[];
    propertyType: 'pg_boys' | 'pg_girls' | 'pg_unisex' | 'hostel_boys' | 'hostel_girls' | 'co_living';
    area: string;
    city: string;
    latitude: number;
    longitude: number;
    startingPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const BranchSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        address: { type: String },
        managerName: { type: String },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
        totalRooms: { type: Number, default: 10 },
        capacity: { type: Number, default: 30 },
        images: { type: [String], default: [] },
        amenities: { type: [String], default: [] },
        propertyType: {
            type: String,
            enum: ['pg_boys', 'pg_girls', 'pg_unisex', 'hostel_boys', 'hostel_girls', 'co_living'],
            default: 'co_living'
        },
        area: { type: String, default: 'Sector 62' },
        city: { type: String, default: 'Noida' },
        latitude: { type: Number, default: 28.628 },
        longitude: { type: Number, default: 77.378 },
        startingPrice: { type: Number, default: 5000 }
    },
    { timestamps: true }
);

// Compound index for unique branch names within a hostel
BranchSchema.index({ name: 1, hostelId: 1 }, { unique: true });

const Branch: Model<IBranch> =
    mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);

export default Branch;
