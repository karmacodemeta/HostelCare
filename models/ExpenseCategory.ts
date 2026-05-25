import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpenseCategory extends Document {
    name: string;
    description?: string;
    isDefault: boolean;
    hostelId?: mongoose.Types.ObjectId; // Link to Hostel model
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseCategorySchema: Schema = new Schema(
    {
        name: { type: String, required: true }, // Removed unique: true
        description: { type: String },
        isDefault: { type: Boolean, default: false },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' },
    },
    { timestamps: true }
);

// Compound index for uniqueness per hostel
ExpenseCategorySchema.index({ name: 1, hostelId: 1 }, { unique: true });

const ExpenseCategory: Model<IExpenseCategory> =
    mongoose.models.ExpenseCategory || mongoose.model<IExpenseCategory>('ExpenseCategory', ExpenseCategorySchema);

export default ExpenseCategory;
