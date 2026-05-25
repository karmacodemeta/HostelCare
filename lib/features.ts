import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Hostel from '@/models/Hostel';
import { cache } from 'react';

// Cache the feature check per request to avoid multiple DB hits in one render pass
export const checkFeature = cache(async (feature: string): Promise<boolean> => {
    const session = await getSession();
    if (!session || !session.user?.hostelId) return false;

    await connectDB();

    // Optimization: explicitly select only the features field
    const hostel = await Hostel.findById(session.user.hostelId).select('features').lean();

    if (!hostel || !hostel.features) return false;

    return (hostel.features as string[]).includes(feature);
});

export const PREDEFINED_FEATURES = {
    STUDENT_PROFILE: 'student_profile',
    ROOM_MAP: 'room_map',
    ADVANCED_ANALYTICS: 'advanced_analytics',
};
