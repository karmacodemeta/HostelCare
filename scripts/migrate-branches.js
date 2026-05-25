const mongoose = require('mongoose');
const path = require('path');
// require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

// Define schemas locally to avoid import issues in standalone script
const BranchSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    address: String,
    managerName: String
}, { timestamps: true });

const StudentSchema = new mongoose.Schema({
    name: String,
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }
}, { strict: false });

const ExpenseSchema = new mongoose.Schema({
    category: String,
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }
}, { strict: false });

const Branch = mongoose.models.Branch || mongoose.model('Branch', BranchSchema);
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

async function migrate() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Check if Main Branch exists
        let mainBranch = await Branch.findOne({ name: 'Main Branch' });
        if (!mainBranch) {
            console.log('Creating Main Branch...');
            mainBranch = await Branch.create({
                name: 'Main Branch',
                address: 'Main Campus',
                managerName: 'Admin'
            });
            console.log('Main Branch created:', mainBranch._id);
        } else {
            console.log('Main Branch already exists:', mainBranch._id);
        }

        // 2. Update Students without branchId
        const studentResult = await Student.updateMany(
            { branchId: { $exists: false } },
            { $set: { branchId: mainBranch._id } }
        );
        console.log(`Updated ${studentResult.modifiedCount} students.`);

        // 3. Update Expenses without branchId
        const expenseResult = await Expense.updateMany(
            { branchId: { $exists: false } },
            { $set: { branchId: mainBranch._id } }
        );
        console.log(`Updated ${expenseResult.modifiedCount} expenses.`);

        console.log('Migration complete.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
