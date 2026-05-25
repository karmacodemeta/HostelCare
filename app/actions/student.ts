'use server';

import connectDB from '@/lib/db';
import Student from '@/models/Student';
import Payment from '@/models/Payment'; // Added
import { adaptStudentInput, RawStudentInput } from '@/lib/adapters/studentAdapter';
import { revalidatePath } from 'next/cache';

export type ActionState = {
    success: boolean;
    message: string;
};

import { logActivity } from '@/lib/logger';
import { generateDiff } from '@/lib/utils';

import { getSession } from '@/lib/auth';

import { z } from 'zod';

const AddStudentSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    contactNumber: z.string().min(10, { message: 'Contact number must be at least 10 digits' }),
    guardian: z.string().optional().or(z.literal('')),
    guardianContact: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    roomNo: z.string().min(1, { message: 'Room number is required' }),
    admissionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid admission date',
    }),
    rent: z.coerce.number().nonnegative({ message: 'Rent must be a positive number' }),
    advanceAmount: z.coerce.number().nonnegative({ message: 'Advance amount must be a positive number' }),
    dues: z.coerce.number().nonnegative({ message: 'Dues must be a positive number' }),
    branchId: z.string().min(1, { message: 'Branch selection is required' }).optional().or(z.literal('')),
});

export async function addStudent(prevState: ActionState, formData: FormData) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const rawInput: RawStudentInput = {
            name: formData.get('name') as string,
            contactNumber: formData.get('contactNumber') as string,
            guardian: formData.get('guardian') as string,
            guardianContact: formData.get('guardianContact') as string,
            address: formData.get('address') as string,
            roomNo: formData.get('roomNo') as string,
            admissionDate: formData.get('admissionDate') as string,
            rent: formData.get('rent') as string,
            advanceAmount: formData.get('advanceAmount') as string,
            dues: formData.get('dues') as string,
            branchId: formData.get('branchId') as string,
        };

        // Zod validation check
        const parsed = AddStudentSchema.safeParse(rawInput);
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]?.message || 'Invalid input data';
            return { success: false, message: firstError };
        }

        const studentData = adaptStudentInput(rawInput);

        // Attach hostelId
        const newStudent = new Student({
            ...studentData,
            hostelId: session.user.hostelId
        });

        await newStudent.save();

        console.log(`Student Created: ${newStudent.name}`);

        // --- AUTOMATIC PAYMENT LOGIC ---
        // 1. Advance Payment
        if (newStudent.advanceAmount > 0) {
            await Payment.create({
                studentId: newStudent._id,
                hostelId: session.user.hostelId,
                branchId: newStudent.branchId,
                amount: newStudent.advanceAmount,
                date: newStudent.admissionDate,
                type: 'advance',
                description: 'Initial Advance / Security Deposit'
            });
            console.log(`Advance Payment Recorded for ${newStudent.name}`);
        }

        // 2. First Month Rent Payment (Assuming it is paid upon admission as per user requirement)
        // User said: "onboarded student pay their first mont rent"
        // Since we are "adding" them, we assume they paid. 
        // NOTE: We do NOT increase dues here because we assume it's paid immediately. 
        // If we increased dues, we would have to decrease them immediately.
        if (newStudent.rent > 0) {
            await Payment.create({
                studentId: newStudent._id,
                hostelId: session.user.hostelId,
                branchId: newStudent.branchId,
                amount: newStudent.rent,
                date: newStudent.admissionDate,
                type: 'rent',
                description: 'First Month Rent (Admission)'
            });
            console.log(`First Rent Payment Recorded for ${newStudent.name}`);
        }

        await logActivity(
            'STUDENT_ADDED',
            'Student',
            newStudent._id,
            {
                name: newStudent.name,
                branch: newStudent.branchId,
                advance: newStudent.advanceAmount,
                firstRent: newStudent.rent
            }
        );

        revalidatePath('/dashboard');
        revalidatePath('/students');

        return { success: true, message: 'Student added successfully' };
    } catch (error) {
        console.error('Failed to add student:', error);
        return { success: false, message: 'Failed to add student' };
    }
}

export async function bulkAddStudents(students: any[]) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        // Attach hostelId to all students
        const studentsWithHostel = students.map(s => ({
            ...s,
            hostelId: session.user.hostelId
        }));

        // Use ordered: false to allow partial inserts
        const result = await Student.insertMany(studentsWithHostel, { ordered: false });

        await logActivity(
            'BULK_STUDENT_IMPORT',
            'Student',
            undefined,
            { count: result.length, description: `Imported ${result.length} students` }
        );

        revalidatePath('/dashboard');
        revalidatePath('/students');

        return { success: true, message: `Successfully added ${result.length} students` };
    } catch (error: any) {
        console.error('Failed to bulk add students:', error);

        // Try to log partial success if some were inserted
        if (error.insertedDocs && error.insertedDocs.length > 0) {
            await logActivity(
                'BULK_STUDENT_IMPORT_PARTIAL',
                'Student',
                undefined,
                { count: error.insertedDocs.length, errors: error.writeErrors?.length }
            );
        }

        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            return { success: false, message: 'Validation Error: Check data types and required fields.' };
        }

        // Handle Duplicate Key errors
        if (error.code === 11000) {
            return { success: false, message: 'Duplicate Error: Some students already exist.' };
        }

        // Handle Partial Success
        if (error.insertedDocs && error.insertedDocs.length > 0) {
            revalidatePath('/dashboard');
            revalidatePath('/students');
            return {
                success: true,
                message: `Added ${error.insertedDocs.length} students. ${error.writeErrors?.length} failed.`
            };
        }

        return { success: false, message: 'Failed to upload students. Please check the file format.' };
    }
}

export async function updateStudent(id: string, formData: FormData) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const oldStudent = await Student.findOne({ _id: id, hostelId: session.user.hostelId });
        if (!oldStudent) return { success: false, message: 'Student not found' };

        const updates: any = {
            name: formData.get('name'),
            guardian: formData.get('guardian'),
            roomNo: formData.get('roomNo'),
            rent: Number(formData.get('rent')),
            dues: Number(formData.get('dues')),
            address: formData.get('address'),
        };

        const branchId = formData.get('branchId');
        if (branchId) updates.branchId = branchId;

        const updatedStudent = await Student.findOneAndUpdate(
            { _id: id, hostelId: session.user.hostelId },
            updates,
            { new: true }
        );

        // Changes Log
        const changes = generateDiff(oldStudent, updates, ['name', 'roomNo', 'dues', 'rent', 'guardian', 'address', 'contactNumber', 'branchId']);

        if (updatedStudent && Object.keys(changes).length > 0) {
            await logActivity(
                'STUDENT_UPDATED',
                'Student',
                updatedStudent._id,
                changes
            );
        }

        revalidatePath('/students');
        revalidatePath('/dashboard');

        return { success: true, message: 'Student updated successfully' };
    } catch (error) {
        console.error('Update student failed:', error);
        return { success: false, message: 'Failed to update student' };
    }
}

export async function deleteStudent(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        // Soft Delete: Set isActive to false
        const student = await Student.findOneAndUpdate(
            { _id: id, hostelId: session.user.hostelId },
            { isActive: false },
            { new: true }
        );

        if (!student) return { success: false, message: 'Student not found' };

        await logActivity(
            'STUDENT_DELETED',
            'Student',
            id,
            { name: student.name, action: 'Soft Delete' }
        );

        revalidatePath('/students');

        return { success: true, message: 'Student deleted successfully' };
    } catch (error) {
        console.error('Delete student failed:', error);
        return { success: false, message: 'Failed to delete student' };
    }
}

export async function getStudentById(id: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return null;

        await connectDB();
        const student = await Student.findOne({ _id: id, hostelId: session.user.hostelId }).populate('branchId');
        return student ? JSON.parse(JSON.stringify(student)) : null;
    } catch (error) {
        console.error('Failed to get student by id:', error);
        return null;
    }
}

export async function getStudentPayments(studentId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();
        const payments = await Payment.find({ studentId, hostelId: session.user.hostelId }).sort({ date: -1 });
        return JSON.parse(JSON.stringify(payments));
    } catch (error) {
        console.error('Failed to get student payments:', error);
        return [];
    }
}

export async function addStudentDocument(studentId: string, name: string, url: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const updatedStudent = await Student.findOneAndUpdate(
            { _id: studentId, hostelId: session.user.hostelId },
            { 
                $push: { 
                    documents: { name, url, uploadedAt: new Date() } 
                } 
            },
            { new: true }
        );

        if (!updatedStudent) return { success: false, message: 'Student not found' };

        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            studentId,
            { action: 'Document Uploaded', documentName: name }
        );

        revalidatePath(`/students/${studentId}`);
        return { success: true, message: 'Document uploaded successfully', student: JSON.parse(JSON.stringify(updatedStudent)) };
    } catch (error: any) {
        console.error('Failed to upload student document:', error);
        return { success: false, message: error.message || 'Failed to upload document' };
    }
}

export async function deleteStudentDocument(studentId: string, documentId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const updatedStudent = await Student.findOneAndUpdate(
            { _id: studentId, hostelId: session.user.hostelId },
            { 
                $pull: { 
                    documents: { _id: documentId } 
                } 
            },
            { new: true }
        );

        if (!updatedStudent) return { success: false, message: 'Student not found' };

        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            studentId,
            { action: 'Document Deleted', documentId }
        );

        revalidatePath(`/students/${studentId}`);
        return { success: true, message: 'Document deleted successfully', student: JSON.parse(JSON.stringify(updatedStudent)) };
    } catch (error: any) {
        console.error('Failed to delete student document:', error);
        return { success: false, message: error.message || 'Failed to delete document' };
    }
}

export async function getStudentDashboardData() {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'student') return null;

        await connectDB();

        // 1. Get student profile details
        const student = await Student.findOne({ userId: session.user.id }).populate('branchId');
        if (!student) return null;

        const branchId = student.branchId?._id;
        const hostelId = student.hostelId;

        // 2. Fetch notices targeting 'all' or 'student'
        const Notice = require('@/models/Notice').default;
        const notices = await Notice.find({
            hostelId,
            $or: [
                { branchId: { $exists: false } },
                { branchId: null },
                { branchId }
            ],
            audience: { $in: ['all', 'student'] },
            isActive: true
        }).sort({ createdAt: -1 }).lean();

        // 3. Fetch complaints filed by this student
        const Complaint = require('@/models/Complaint').default;
        const complaints = await Complaint.find({
            studentId: student._id
        }).sort({ createdAt: -1 }).lean();

        // 4. Fetch mess menu for this branch/hostel
        const MessMenu = require('@/models/MessMenu').default;
        const menus = await MessMenu.find({
            hostelId,
            $or: [
                { branchId: { $exists: false } },
                { branchId: null },
                { branchId }
            ]
        }).lean();

        // 5. Fetch leave applications requested by this student
        const Leave = require('@/models/Leave').default;
        const leaves = await Leave.find({
            studentId: student._id
        }).sort({ createdAt: -1 }).lean();

        return {
            student: JSON.parse(JSON.stringify(student)),
            notices: JSON.parse(JSON.stringify(notices)),
            complaints: JSON.parse(JSON.stringify(complaints)),
            menus: JSON.parse(JSON.stringify(menus)),
            leaves: JSON.parse(JSON.stringify(leaves))
        };
    } catch (error) {
        console.error('Failed to fetch student dashboard data:', error);
        return null;
    }
}
