import { signIn } from "next-auth/react"

export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("credentials", {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
          redirectTo: "/crawl"
        })
      }}
    >
      <label>
        EmailAdminTest1
        <input name="email" type="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" />
      </label>
      <button>Sign In</button>
    </form>
  )
}
