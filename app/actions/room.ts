'use server';

import connectDB from '@/lib/db';
import Room from '@/models/Room';
import Student from '@/models/Student';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

export async function getRooms(branchId?: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) return [];

        await connectDB();

        const mongoose = require('mongoose');
        const hostelIdObj = new mongoose.Types.ObjectId(session.user.hostelId);
        const isValidObjectId = (id?: string) => id && id.match(/^[0-9a-fA-F]{24}$/);

        const filter: any = { hostelId: hostelIdObj, isActive: true };
        if (isValidObjectId(branchId)) {
            filter.branchId = new mongoose.Types.ObjectId(branchId);
        }

        const rooms = await Room.find(filter)
            .populate({
                path: 'students',
                select: 'name contactNumber dues'
            })
            .populate('branchId')
            .sort({ roomNo: 1 })
            .lean();

        return JSON.parse(JSON.stringify(rooms));
    } catch (error) {
        console.error('Failed to fetch rooms:', error);
        return [];
    }
}

export async function createRoom(
    roomNo: string,
    type: 'single' | 'double' | 'triple' | 'four_sharing',
    capacity: number,
    sharingType: 'ac' | 'non_ac',
    rent: number,
    branchId: string
) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        if (!roomNo || !branchId) {
            return { success: false, message: 'Room number and branch are required' };
        }

        await connectDB();

        const mongoose = require('mongoose');
        const hostelIdObj = new mongoose.Types.ObjectId(session.user.hostelId);
        const branchIdObj = new mongoose.Types.ObjectId(branchId);

        // Check for duplicate room in the branch
        const duplicate = await Room.findOne({ roomNo, branchId: branchIdObj, isActive: true });
        if (duplicate) {
            return { success: false, message: `Room ${roomNo} already exists in this branch.` };
        }

        const newRoom = await Room.create({
            hostelId: hostelIdObj,
            branchId: branchIdObj,
            roomNo,
            type,
            capacity: Number(capacity) || 2,
            sharingType,
            rent: Number(rent) || 5000,
            students: []
        });

        await logActivity(
            'SYSTEM',
            'System',
            newRoom._id,
            { action: 'Room Created', roomNo, type }
        );

        revalidatePath('/rooms');
        return { success: true, message: 'Room created successfully', room: JSON.parse(JSON.stringify(newRoom)) };
    } catch (error: any) {
        console.error('Failed to create room:', error);
        return { success: false, message: error.message || 'Failed to create room' };
    }
}

export async function assignStudentToRoom(roomId: string, studentId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        const room = await Room.findOne({ _id: roomId, hostelId: session.user.hostelId });
        if (!room) return { success: false, message: 'Room not found' };

        // Check capacity limit
        if (room.students.length >= room.capacity) {
            return { success: false, message: 'Room is already at full capacity' };
        }

        // Check if student is already in this room
        if (room.students.includes(studentId as any)) {
            return { success: false, message: 'Student is already assigned to this room' };
        }

        // Assign student:
        // 1. Add student to Room's assigned list
        room.students.push(studentId as any);
        await room.save();

        // 2. Update Student's room number and branch in the database
        const student = await Student.findOneAndUpdate(
            { _id: studentId, hostelId: session.user.hostelId },
            { roomNo: room.roomNo, branchId: room.branchId },
            { new: true }
        );

        await logActivity(
            'Student',
            'Student',
            studentId,
            { action: 'Assigned to Room', roomNo: room.roomNo }
        );

        revalidatePath('/rooms');
        revalidatePath('/students');
        revalidatePath('/dashboard');

        return { success: true, message: `Successfully assigned ${student?.name} to Room ${room.roomNo}` };
    } catch (error: any) {
        console.error('Failed to assign student to room:', error);
        return { success: false, message: error.message || 'Failed to assign student' };
    }
}

export async function unassignStudentFromRoom(roomId: string, studentId: string) {
    try {
        const session = await getSession();
        if (!session || !session.user.hostelId) {
            return { success: false, message: 'Unauthorized' };
        }

        await connectDB();

        // 1. Pull student from Room
        const room = await Room.findOneAndUpdate(
            { _id: roomId, hostelId: session.user.hostelId },
            { $pull: { students: studentId } },
            { new: true }
        );

        if (!room) return { success: false, message: 'Room not found' };

        // 2. Clear room no on Student
        const student = await Student.findOneAndUpdate(
            { _id: studentId, hostelId: session.user.hostelId },
            { roomNo: 'Unassigned' },
            { new: true }
        );

        await logActivity(
            'Student',
            'Student',
            studentId,
            { action: 'Unassigned from Room', roomNo: room.roomNo }
        );

        revalidatePath('/rooms');
        revalidatePath('/students');
        revalidatePath('/dashboard');

        return { success: true, message: `Successfully unassigned ${student?.name} from Room ${room.roomNo}` };
    } catch (error: any) {
        console.error('Failed to unassign student:', error);
        return { success: false, message: error.message || 'Failed to unassign student' };
    }
}
