import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define upload destination inside public/uploads
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        
        // Ensure upload directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {}

        const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = join(uploadDir, uniqueFilename);
        
        await writeFile(filePath, buffer);
        console.log(`Uploaded file saved locally: ${filePath}`);

        return NextResponse.json({ 
            success: true, 
            url: `/uploads/${uniqueFilename}`,
            name: file.name
        });
    } catch (error: any) {
        console.error('File Upload API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
