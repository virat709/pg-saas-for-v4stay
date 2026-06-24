import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const ownersRef = adminDb.collection("owners");
    const emailSnapshot = await ownersRef.where("email", "==", email).get();

    if (!emailSnapshot.empty) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOwnerRef = await ownersRef.add({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return NextResponse.json(
      { message: "User registered successfully", id: newOwnerRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
