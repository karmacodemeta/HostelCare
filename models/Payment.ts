import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
    studentId: mongoose.Types.ObjectId;
    hostelId: mongoose.Types.ObjectId;
    branchId?: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
    type: 'rent' | 'fine' | 'other' | 'advance';
    paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'online';
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
    {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' }, // Added
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        type: {
            type: String,
            enum: ['rent', 'fine', 'other', 'advance'],
            default: 'rent'
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'online'],
            default: 'cash'
        },
        description: { type: String },
    },
    { timestamps: true }
);

const Payment: Model<IPayment> =
    mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
