import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
    category: string;
    amount: number;
    date: Date;
    description?: string;
    branchId?: mongoose.Types.ObjectId; // Link to Branch model
    hostelId?: mongoose.Types.ObjectId; // Link to Hostel model
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
    {
        category: { type: String, required: true }, // Storing category name directly for simplicity, or could be ObjectId
        amount: { type: Number, required: true },
        date: { type: Date, required: true, default: Date.now },
        description: { type: String },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
    },
    { timestamps: true }
);

const Expense: Model<IExpense> =
    mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
