import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
export const dynamic = "force-dynamic";
import { writeFile } from "fs/promises";
import { join, extname } from "path";
import fs from "fs";

// ✅ SECURITY: Only authenticated owners can upload files
// ✅ SECURITY: Only image files are allowed (blocks .php, .js, .exe etc.)
// ✅ SECURITY: File size capped at 5MB
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ success: false, message: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Validate file extension
    const ext = extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ success: false, message: "Invalid file type. Only images (jpg, jpeg, png, webp, gif) are allowed." }, { status: 400 });
    }

    // Validate MIME type as a second layer
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "Invalid file type." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename — strip everything except alphanumeric, dots, hyphens
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const fileName = `${Date.now()}_${session.user.id}_${safeName}`;

    // Ensure public/uploads exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}
