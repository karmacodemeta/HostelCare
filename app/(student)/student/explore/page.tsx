import React from 'react';
import { getExploreProperties } from '@/app/actions/explore';
import { getSession } from '@/lib/auth';
import Student from '@/models/Student';
import connectDB from '@/lib/db';
import ExploreClient from './ExploreClient';

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const session = await getSession();
  
  await connectDB();
  
  // Try to find the logged in student profile, if any
  let loggedStudent = null;
  if (session && session.user.role === 'student') {
    const s = await Student.findOne({ userId: session.user.id }).lean();
    if (s) {
      loggedStudent = JSON.parse(JSON.stringify(s));
    }
  }

  // Initial properties fetch
  const initialProperties = await getExploreProperties();

  return (
    <ExploreClient 
      initialProperties={initialProperties} 
      loggedStudent={loggedStudent}
    />
  );
}
