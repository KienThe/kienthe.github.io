"use client"

import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon
} from "@radix-ui/react-icons"
import { Button, Card, Flex, Text } from "@radix-ui/themes"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { api } from "~/trpc/react"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const register = api.auth.register.useMutation()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await register.mutateAsync({
        name,
        email,
        password
      })

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card size="2">
      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="4">
          {error && (
            <Text color="red" size="2">
              {error}
            </Text>
          )}
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium" htmlFor="name">
              Name
            </Text>
            <div className="relative">
              <PersonIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                id="name"
                name="name"
                placeholder="John Doe"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </Flex>
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium" htmlFor="email">
              Email
            </Text>
            <div className="relative">
              <EnvelopeClosedIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </Flex>
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium" htmlFor="password">
              Password
            </Text>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </Flex>
          <Flex direction="column" gap="1">
            <Text as="label" size="2" weight="medium" htmlFor="confirmPassword">
              Confirm Password
            </Text>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                required
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </Flex>
          <Button disabled={isLoading}>
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            Register
          </Button>
        </Flex>
      </form>
      <Flex direction="column" gap="4" mt="4">
        <Flex align="center" gap="2">
          <div className="h-px flex-1 bg-gray-200" />
          <Text size="1" color="gray">
            Or continue with
          </Text>
          <div className="h-px flex-1 bg-gray-200" />
        </Flex>
      </Flex>
    </Card>
  )
}
