import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    role: 'super_admin' | 'hostel_admin' | 'staff' | 'student';
    hostelId?: mongoose.Types.ObjectId; // Link to specific hostel
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String },
        name: { type: String, required: true },
        role: {
            type: String,
            enum: ['super_admin', 'hostel_admin', 'staff', 'student'], // Updated roles
            default: 'hostel_admin',
        },
        hostelId: { type: Schema.Types.ObjectId, ref: 'Hostel' }, // Reference to Hostel
    },
    { timestamps: true }
);

// Pre-save hook to hash password
UserSchema.pre('save', async function () {
    const user = this as any;
    if (!user.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    } catch (err: any) {
        throw err;
    }
});

// Compare password method
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    if (!this.password) return false;
    // Support plaintext check as fallback for seeded/existing records
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        return this.password === password;
    }
    return bcrypt.compare(password, this.password);
};

// Prevent overwrite on hot reload
const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
