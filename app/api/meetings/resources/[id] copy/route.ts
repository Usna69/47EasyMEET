// app/api/resources/[id]/download/route.ts

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { safeQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResourceExistsRow {
  meetingId: string;
}

interface MeetingPasswordRow {
  password: string | null;
}

interface ResourceRow {
  id: string;
  meetingId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  description: string | null;
  uploadedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveContentType(fileType: string): string {
  if (fileType.includes("pdf")) return "application/pdf";
  if (fileType.includes("image/jpeg") || fileType.includes("jpg"))
    return "image/jpeg";
  if (fileType.includes("image/png")) return "image/png";
  if (fileType.includes("application/msword") || fileType.includes("doc"))
    return "application/msword";
  if (fileType.includes("wordprocessingml") || fileType.includes("docx"))
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (fileType.includes("text/csv") || fileType.includes("csv"))
    return "text/csv";
  if (fileType.includes("application/vnd.ms-excel") || fileType.includes("xls"))
    return "application/vnd.ms-excel";
  if (fileType.includes("spreadsheetml") || fileType.includes("xlsx"))
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  return "application/octet-stream";
}

// ─── POST /api/resources/[id]/download ───────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: resourceId } = await params;
    const requestData = await request.json();
    const password: string | undefined = requestData.password;

    console.log(`Resource download request for ID: ${resourceId}`);

    // 1. Check the resource exists and get its meetingId
    const { rows: existsRows } = await safeQuery<ResourceExistsRow>(
      `SELECT TOP 1 meetingId FROM dbo.MeetingResource WHERE id = $1`,
      [resourceId],
    );

    if (existsRows.length === 0) {
      console.log("Resource not found");
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    const { meetingId } = existsRows[0];

    // 2. Fetch the meeting password
    const { rows: meetingRows } = await safeQuery<MeetingPasswordRow>(
      `SELECT TOP 1 password FROM dbo.Meeting WHERE id = $1`,
      [meetingId],
    );

    const meetingPassword = meetingRows[0]?.password ?? null;

    // 3. Validate password if the meeting is protected
    if (meetingPassword) {
      if (!password) {
        console.log("Password required but not provided");
        return NextResponse.json(
          { error: "Password is required" },
          { status: 400 },
        );
      }
      if (meetingPassword !== password) {
        console.log("Password validation failed");
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 },
        );
      }
      console.log("Password validation successful");
    } else {
      console.log("No password required for this meeting resource");
    }

    // 4. Fetch full resource details
    const { rows: resourceRows } = await safeQuery<ResourceRow>(
      `SELECT TOP 1
         id, meetingId, fileName, fileType, fileSize, fileUrl, description, uploadedAt
       FROM dbo.MeetingResource
       WHERE id = $1`,
      [resourceId],
    );

    if (resourceRows.length === 0) {
      return NextResponse.json(
        { error: "Resource not found" },
        { status: 404 },
      );
    }

    const resource = resourceRows[0];

    // 5. Resolve file path
    let filePath: string;
    if (resource.fileUrl) {
      const relativePath = resource.fileUrl.startsWith("/")
        ? resource.fileUrl.substring(1)
        : resource.fileUrl;
      filePath = path.join(process.cwd(), "public", relativePath);
    } else {
      filePath = path.join(
        process.cwd(),
        "public",
        "resources",
        resource.fileName,
      );
    }

    // 6. Read file and stream back
    try {
      try {
        await fs.access(filePath);
      } catch {
        console.error(`File does not exist at path: ${filePath}`);
        return NextResponse.json(
          { error: "Resource file not found on server" },
          { status: 404 },
        );
      }

      const fileBuffer = await fs.readFile(filePath);

      if (fileBuffer.length === 0) {
        console.error(`File is empty: ${filePath}`);
        return NextResponse.json(
          { error: "Resource file is empty" },
          { status: 404 },
        );
      }

      const contentType = resolveContentType(resource.fileType);

      console.log(
        `Serving file: ${resource.fileName}, Size: ${fileBuffer.length} bytes, Type: ${contentType}`,
      );

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${encodeURIComponent(resource.fileName)}"`,
          "Content-Length": fileBuffer.length.toString(),
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    } catch (fileError) {
      console.error("Error reading file:", fileError);
      return NextResponse.json(
        { error: "File not found or cannot be read" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error retrieving resource:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
