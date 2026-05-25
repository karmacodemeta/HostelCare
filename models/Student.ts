import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStudent extends Document {
    name: string;
    contactNumber: string;
    guardian: string;
    guardianContact?: string;
    address: string;
    roomNo: string;
    admissionDate: Date;
    lastRentDate: Date;
    rent: number;
    advanceAmount: number;
    dues: number;
    isActive: boolean;
    branchId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    hostelId?: mongoose.Types.ObjectId;
    documents?: { name: string; url: string; uploadedAt: Date }[];
    kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
    kycDetails?: {
        aadhaarNumber?: string;
        panNumber?: string;
        photoUrl?: string;
        aadhaarFrontUrl?: string;
        aadhaarBackUrl?: string;
        rejectionReason?: string;
    };
    leaseAgreement?: {
        status: 'unsigned' | 'signed' | 'expired';
        signedAt?: Date;
        documentUrl?: string;
        signatureName?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const StudentSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        contactNumber: { type: String, required: true },
        guardian: { type: String, required: true },
        guardianContact: { type: String },
        address: { type: String, required: true },
        roomNo: { type: String, required: true },
        admissionDate: { type: Date, required: true, default: Date.now },
        rent: { type: Number, required: true, default: 0 },
        advanceAmount: { type: Number, required: true, default: 0 },
        dues: { type: Number, required: true, default: 0 },
        isActive: { type: Boolean, default: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
        documents: [
            {
                name: { type: String, required: true },
                url: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now }
            }
        ],
        kycStatus: {
            type: String,
            enum: ['pending', 'submitted', 'verified', 'rejected'],
            default: 'pending'
        },
        kycDetails: {
            aadhaarNumber: { type: String },
            panNumber: { type: String },
            photoUrl: { type: String },
            aadhaarFrontUrl: { type: String },
            aadhaarBackUrl: { type: String },
            rejectionReason: { type: String }
        },
        leaseAgreement: {
            status: {
                type: String,
                enum: ['unsigned', 'signed', 'expired'],
                default: 'unsigned'
            },
            signedAt: { type: Date },
            documentUrl: { type: String },
            signatureName: { type: String }
        }
    },
    { timestamps: true }
);

const Student: Model<IStudent> =
    mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);

export default Student;
