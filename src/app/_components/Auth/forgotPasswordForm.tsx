"use client"

import { EnvelopeClosedIcon } from "@radix-ui/react-icons"
import { Button, Card, Flex, Text } from "@radix-ui/themes"
import { useState } from "react"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Something went wrong")
      }

      setSuccess(true)
    } catch (error) {
      console.error(error)
      setError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card size="2">
        <Flex direction="column" gap="4" align="center" p="4">
          <Text size="3" weight="medium">
            Check your email
          </Text>
          <Text size="2" color="gray" align="center">
            We have sent you a password reset link. Please check your email.
          </Text>
        </Flex>
      </Card>
    )
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
          <Button disabled={isLoading}>
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            Send Reset Link
          </Button>
        </Flex>
      </form>
    </Card>
  )
}
