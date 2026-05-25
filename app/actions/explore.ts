'use server';

import connectDB from '@/lib/db';
import Branch from '@/models/Branch';
import Room from '@/models/Room';
import Student from '@/models/Student';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

import mongoose from 'mongoose';
import Hostel from '@/models/Hostel';

// Unified public image assets for uncropped visuals
const BUILDING_IMAGE = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80';
const ROOM_IMAGE = 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80';
const WASHROOM_IMAGE = 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80';

// Dynamic Seeder helper to ensure active DB branches are beautifully complete
async function ensurePremiumBranchProps() {
    // 1. Get or create a default hostel
    let hostel = await Hostel.findOne({});
    if (!hostel) {
        hostel = await Hostel.create({
            _id: new mongoose.Types.ObjectId("6a1382bd4a8634ff5495d4cf"),
            name: 'Karma Code Hostel System',
            ownerName: 'Karma Code Admin',
            address: 'Boring Road, Patna, Bihar',
            contactNumber: '+91 98765 43210',
            subscriptionStatus: 'active',
            features: ['Premium Map', 'KYC Verification', 'Digital Lease']
        });
    }

    const hostelId = hostel._id;

    // 2. Ensure we have at least 4 premium properties with various types in Noida and Patna
    const branchCount = await Branch.countDocuments({});
    if (branchCount < 3) {
        console.log('Seeding 4 premium PG properties with various types in Noida and Patna...');
        
        // Clear old ones if any to avoid index conflicts
        await Branch.deleteMany({});
        await Room.deleteMany({});

        const seededBranches = [
            {
                _id: new mongoose.Types.ObjectId("6a13838b4a8634ff5495d554"), // Patna Boring Road (Boys)
                name: 'Karma Code Residency (Boys PG)',
                address: 'Boring Road, Near West End Mall, Patna',
                managerName: 'Hema Kumari',
                hostelId: hostelId,
                totalRooms: 12,
                capacity: 36,
                images: [
                    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
                ],
                amenities: ['High-Speed WiFi', 'AC Rooms', 'Power Backup', 'CCTV Security', 'Daily Cleaning', 'Organic Mess Food', 'RO Purified Water'],
                propertyType: 'pg_boys',
                area: 'Boring Road',
                city: 'Patna',
                latitude: 25.6186,
                longitude: 85.1163,
                startingPrice: 6500
            },
            {
                name: 'HostelCare Luxury Co-Living (Unisex)',
                address: 'Kankarbagh Main Rd, Opp. Sports Complex, Patna',
                managerName: 'Rajesh Kumar',
                hostelId: hostelId,
                totalRooms: 15,
                capacity: 45,
                images: [
                    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
                ],
                amenities: ['High-Speed WiFi', 'AC Rooms', 'Power Backup', 'CCTV Security', 'Daily Cleaning', 'Organic Mess Food', 'Laundry Service', 'GYM Access'],
                propertyType: 'co_living',
                area: 'Kankarbagh',
                city: 'Patna',
                latitude: 25.5947,
                longitude: 85.1578,
                startingPrice: 8500
            },
            {
                name: 'Karma Code Nest (Girls PG)',
                address: 'Plot 42, Sector 62, Near Fortis Hospital, Noida',
                managerName: 'Shalini Verma',
                hostelId: hostelId,
                totalRooms: 10,
                capacity: 30,
                images: [
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
                ],
                amenities: ['High-Speed WiFi', 'AC Rooms', 'Power Backup', 'CCTV Security', 'Daily Cleaning', 'Organic Mess Food', 'RO Purified Water', 'Laundry Service'],
                propertyType: 'pg_girls',
                area: 'Sector 62',
                city: 'Noida',
                latitude: 28.6297,
                longitude: 77.3721,
                startingPrice: 9500
            },
            {
                name: 'Noida Premium Student PG (Boys)',
                address: 'Block B, Sector 15, Near Metro Station, Noida',
                managerName: 'Vikram Singh',
                hostelId: hostelId,
                totalRooms: 8,
                capacity: 24,
                images: [
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
                ],
                amenities: ['High-Speed WiFi', 'AC Rooms', 'Power Backup', 'CCTV Security', 'Daily Cleaning', 'RO Purified Water', 'GYM Access'],
                propertyType: 'pg_boys',
                area: 'Sector 15',
                city: 'Noida',
                latitude: 28.5823,
                longitude: 77.3112,
                startingPrice: 7500
            }
        ];

        for (const bData of seededBranches) {
            const b = await Branch.create(bData);
            
            // Seed Rooms for each branch
            await Room.create([
                {
                    hostelId: hostelId,
                    branchId: b._id,
                    roomNo: '101',
                    type: 'double',
                    capacity: 2,
                    sharingType: 'non_ac',
                    rent: b.startingPrice,
                    sizeSqFt: 210,
                    washroomType: 'attached_shared',
                    images: [ROOM_IMAGE, WASHROOM_IMAGE],
                    specifications: ['Study Desk', 'Individual Wardrobes', 'Balcony Access']
                },
                {
                    hostelId: hostelId,
                    branchId: b._id,
                    roomNo: '202',
                    type: 'single',
                    capacity: 1,
                    sharingType: 'ac',
                    rent: b.startingPrice + 2500,
                    sizeSqFt: 160,
                    washroomType: 'attached_private',
                    images: [ROOM_IMAGE, WASHROOM_IMAGE],
                    specifications: ['Executive Bed', 'Attached Balcony', 'Armchair']
                },
                {
                    hostelId: hostelId,
                    branchId: b._id,
                    roomNo: '303',
                    type: 'triple',
                    capacity: 3,
                    sharingType: 'non_ac',
                    rent: b.startingPrice - 1500,
                    sizeSqFt: 240,
                    washroomType: 'common',
                    images: [ROOM_IMAGE, WASHROOM_IMAGE],
                    specifications: ['3 Study Chairs', '3 Individual lockers', 'Shared Balcony']
                }
            ]);
        }
        
        console.log('Seeding of 4 premium PG properties completed successfully!');
    }

    // Now make sure any remaining branches have fields filled beautifully
    const branches = await Branch.find({});
    for (const b of branches) {
        let isModified = false;
        
        if (!b.images || b.images.length === 0) {
            b.images = [BUILDING_IMAGE, ROOM_IMAGE, WASHROOM_IMAGE];
            isModified = true;
        }
        
        if (!b.amenities || b.amenities.length === 0) {
            b.amenities = [
                'High-Speed WiFi', 'AC Rooms', 'Power Backup', 
                'CCTV Security', 'Daily Cleaning', 'Organic Mess Food',
                'Laundry Service', 'RO Purified Water', 'GYM Access'
            ];
            isModified = true;
        }

        if (isModified) {
            await b.save();
        }
    }
}

export async function getExploreProperties(
    searchQuery?: string,
    propertyType?: string,
    city?: string,
    budget?: number,
    selectedAmenities?: string[]
) {
    try {
        await connectDB();
        await ensurePremiumBranchProps();

        const filter: any = {};

        if (searchQuery) {
            filter.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { area: { $regex: searchQuery, $options: 'i' } },
                { city: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        if (propertyType && propertyType !== 'all') {
            filter.propertyType = propertyType;
        }

        if (city && city !== 'all') {
            filter.city = { $regex: city, $options: 'i' };
        }

        if (budget) {
            filter.startingPrice = { $lte: Number(budget) };
        }

        if (selectedAmenities && selectedAmenities.length > 0) {
            filter.amenities = { $all: selectedAmenities };
        }

        const branches = await Branch.find(filter).lean();
        
        // Populate available rooms count and detail list
        const branchIds = branches.map(b => b._id);
        const rooms = await Room.find({ branchId: { $in: branchIds }, isActive: true }).lean();
        
        const formattedBranches = branches.map((b: any) => {
            const branchRooms = rooms.filter((r: any) => r.branchId.toString() === b._id.toString());
            const availableBeds = branchRooms.reduce((sum, r) => sum + (r.capacity - (r.students?.length || 0)), 0);
            
            return {
                ...b,
                _id: b._id.toString(),
                hostelId: b.hostelId.toString(),
                availableBeds,
                rooms: branchRooms.map(r => ({
                    ...r,
                    _id: r._id.toString(),
                    branchId: r.branchId.toString(),
                    hostelId: r.hostelId.toString()
                }))
            };
        });

        return JSON.parse(JSON.stringify(formattedBranches));
    } catch (error) {
        console.error('Explore fetch failure:', error);
        return [];
    }
}

export async function submitKYCDocumentation(
    studentId: string,
    aadhaarNumber: string,
    panNumber: string,
    photoUrl: string,
    aadhaarFrontUrl: string,
    aadhaarBackUrl: string
) {
    try {
        await connectDB();
        
        const student = await Student.findById(studentId);
        if (!student) return { success: false, message: 'Student profile not found' };

        student.kycStatus = 'submitted';
        student.kycDetails = {
            aadhaarNumber,
            panNumber,
            photoUrl,
            aadhaarFrontUrl,
            aadhaarBackUrl
        };
        await student.save();

        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            studentId,
            { action: 'KYC Submitted', name: student.name }
        );

        revalidatePath('/student/dashboard');
        revalidatePath(`/students/${studentId}`);
        revalidatePath('/kyc');

        return { success: true, message: 'KYC documents uploaded and submitted for Warden approval!' };
    } catch (error: any) {
        console.error('KYC submission error:', error);
        return { success: false, message: error.message || 'Failed to submit KYC.' };
    }
}

export async function signLeaseAgreementDocument(
    studentId: string,
    signatureName: string
) {
    try {
        await connectDB();
        
        const student = await Student.findById(studentId).populate('branchId');
        if (!student) return { success: false, message: 'Resident profile not found' };

        // Generate simulated agreement URL
        const agreementName = `LEASE_AGREEMENT_${student.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}.pdf`;
        const agreementUrl = `/public/uploads/agreements/${agreementName}`;

        student.leaseAgreement = {
            status: 'signed',
            signedAt: new Date(),
            documentUrl: agreementUrl,
            signatureName
        };

        // Complete the student onboarding automatically by clearing dues/adjusting
        student.dues = 0; // Clear any temporary dues upon signed contract checkout
        await student.save();

        // Trigger log
        await logActivity(
            'STUDENT_UPDATED',
            'Student',
            studentId,
            { action: 'Lease Agreement Signed', agreement: agreementName }
        );

        revalidatePath('/student/dashboard');
        revalidatePath(`/students/${studentId}`);

        return { 
            success: true, 
            message: 'Lease agreement signed and confirmed! Check your registered email for copy.',
            documentUrl: agreementUrl
        };
    } catch (error: any) {
        console.error('Agreement signing error:', error);
        return { success: false, message: error.message || 'Failed to sign agreement.' };
    }
}
