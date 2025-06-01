import bcrypt from "bcrypt"
import "dotenv/config"
import { db } from "."
import { users } from "./schema"

async function seed() {
  try {
    // Create superadmin account
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const superadmin = {
      name: "Super Admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin" as const,
      level: 1,
      exp: 0
    }

    // Check if superadmin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, superadmin.email)
    })

    if (!existingAdmin) {
      await db.insert(users).values(superadmin)
      console.log("Superadmin account created successfully!")
    } else {
      console.log("Superadmin account already exists!")
    }
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("Seeding completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Error during seeding:", error)
    process.exit(1)
  })
