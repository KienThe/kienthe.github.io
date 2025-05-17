import { createHash } from "crypto"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { sendEmail } from "~/lib/email"
import { db } from "~/server/db"
import { users } from "~/server/db/schema"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    // Generate reset token
    const token = createHash("sha256")
      .update(`${user.id}-${Date.now()}`)
      .digest("hex")

    // Store token in database (you'll need to create a table for this)
    // For now, we'll just send the email

    // Send reset email
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}">
          Reset Password
        </a>
      `
    })

    return new NextResponse("Reset email sent", { status: 200 })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
