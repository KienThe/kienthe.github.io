import { hash } from "bcrypt"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db } from "~/server/db"
import { users } from "~/server/db/schema"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    // Verify token and get user (you'll need to implement this)
    // For now, we'll just update the password

    // Hash new password
    const hashedPassword = await hash(password, 12)

    // Update user's password
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, "user_id")) // Replace with actual user ID from token

    return new NextResponse("Password reset successful", { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
