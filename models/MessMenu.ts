import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMealPlan {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
}

export interface IMessMenu extends Document {
    hostelId: mongoose.Types.ObjectId;
    branchId?: mongoose.Types.ObjectId; // Optional for Global Menu
    updatedBy?: string;
    monday: IMealPlan;
    tuesday: IMealPlan;
    wednesday: IMealPlan;
    thursday: IMealPlan;
    friday: IMealPlan;
    saturday: IMealPlan;
    sunday: IMealPlan;
    createdAt: Date;
    updatedAt: Date;
}

const MealPlanSchema = {
    breakfast: { type: String, default: '' },
    lunch: { type: String, default: '' },
    snacks: { type: String, default: '' },
    dinner: { type: String, default: '' }
};

const MessMenuSchema: Schema = new Schema(
    {
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel', required: true },
        branchId: { type: Schema.Types.ObjectId, ref: 'Branch' }, // Optional
        updatedBy: { type: String },
        monday: MealPlanSchema,
        tuesday: MealPlanSchema,
        wednesday: MealPlanSchema,
        thursday: MealPlanSchema,
        friday: MealPlanSchema,
        saturday: MealPlanSchema,
        sunday: MealPlanSchema,
    },
    { timestamps: true }
);

// Compound index to ensure one menu per branch
MessMenuSchema.index({ hostelId: 1, branchId: 1 }, { unique: true });

const MessMenu: Model<IMessMenu> =
    mongoose.models.MessMenu || mongoose.model<IMessMenu>('MessMenu', MessMenuSchema);

export default MessMenu;
