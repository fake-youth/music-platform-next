import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { validateFile, MAX_AUDIO_SIZE, MAX_IMAGE_SIZE } from "@/lib/validations";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const fileType = formData.get("type") as string || 'audio'; // 'audio' or 'image'

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        // Validate file
        const validation = validateFile(file, fileType as 'audio' | 'image');
        if (!validation.valid) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Ensure public/uploads exists
        const uploadDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        // Sanitize filename
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
        const uniqueName = Date.now() + '-' + sanitizedName;
        const filePath = path.join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        // Return the URL accessible by the browser
        return NextResponse.json({ url: `/uploads/${uniqueName}` });

    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }
}
