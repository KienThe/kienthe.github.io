"use client"

import { LockClosedIcon } from "@radix-ui/react-icons"
import { Button, Card, Flex, Text } from "@radix-ui/themes"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const token = searchParams.get("token")

    if (!token) {
      setError("Invalid reset token")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token, password })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Something went wrong")
      }

      router.push("/auth/login")
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
            <Text as="label" size="2" weight="medium" htmlFor="password">
              New Password
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
            Reset Password
          </Button>
        </Flex>
      </form>
    </Card>
  )
}
