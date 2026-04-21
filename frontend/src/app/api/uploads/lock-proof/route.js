import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@/auth";
import { ROLES } from "@/lib/permissions";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== ROLES.STUDENT ||
    !session.user.isCR
  ) {
    return NextResponse.json(
      { error: "Only Class Representatives can upload lock proof images." },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image is too large. Max size is 5MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const extension = file.name.includes(".")
      ? file.name.split(".").pop().toLowerCase()
      : "jpg";

    const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";
    const fileName = `${session.user.id}-${crypto.randomUUID()}.${safeExtension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "lock-proofs",
    );
    await mkdir(uploadDirectory, { recursive: true });

    const fullPath = path.join(uploadDirectory, fileName);
    await writeFile(fullPath, buffer);

    const publicUrl = `/uploads/lock-proofs/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("Failed to upload lock proof image:", error);
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 },
    );
  }
}
