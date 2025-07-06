import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Import Response properly for Next.js App Router API
const Response = globalThis.Response;
const json = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data for file uploads
    const formData = await request.formData();

    // Extract form fields
    const letterheadFile = formData.get("letterhead") as File;
    const type = formData.get("type") as string;

    // Validate file exists
    if (!letterheadFile) {
      return json({ error: "No letterhead file provided" }, { status: 400 });
    }

    // Validate file type (only JPG)
    if (!letterheadFile.type.includes("image/jpeg")) {
      return json({ error: "Letterhead must be a JPG image" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (letterheadFile.size > 5 * 1024 * 1024) {
      return json({ error: "Letterhead image must be less than 5MB" }, { status: 400 });
    }

    // Validate type
    if (type !== "swg") {
      return json({ error: "Invalid letterhead type" }, { status: 400 });
    }

    // Create public/letterheads directory if it doesn't exist
    const letterheadsDir = join(process.cwd(), "public", "letterheads");
    await mkdir(letterheadsDir, { recursive: true });

    // Save file as swg.jpg in public folder
    const fileBuffer = Buffer.from(await letterheadFile.arrayBuffer());
    const filePath = join(letterheadsDir, "swg.jpg");
    await writeFile(filePath, fileBuffer);

    return json({ 
      success: true, 
      message: "SWG letterhead uploaded successfully",
      path: "/letterheads/swg.jpg"
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading letterhead:", error);
    return json({ error: "Failed to upload letterhead" }, { status: 500 });
  }
}
