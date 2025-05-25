"use client"

import {
  EnvelopeClosedIcon,
  LockClosedIcon,
  PersonIcon
} from "@radix-ui/react-icons"
import { Button, Card, Flex, Text } from "@radix-ui/themes"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { NewUser } from "~/server/db/types"
import { api } from "~/trpc/react"

type RegisterFormInputs = NewUser & { confirmPassword: string }

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const registerMutation = api.auth.register.useMutation()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  })

  async function onSubmit(data: RegisterFormInputs) {
    setIsLoading(true)
    setError(null)

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await registerMutation.mutateAsync({
        name: data.name ?? "",
        email: data.email ?? "",
        password: data.password
      })

      // Sign in the user after successful registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: "/crawl"
      })
    } catch (error: any) {
      if (
        typeof error?.message === "string" &&
        error.message.startsWith("<!DOCTYPE")
      ) {
        setError(
          "Server returned invalid response. Please check your API endpoint."
        )
      } else {
        setError(
          error instanceof Error ? error.message : "Something went wrong"
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card size="2">
      <form onSubmit={handleSubmit(onSubmit)}>
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
                placeholder="John Doe"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <Text color="red" size="1" as="span" className="ml-2">
                  {errors.name.message}
                </Text>
              )}
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
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <Text color="red" size="1" as="span" className="ml-2">
                  {errors.email.message}
                </Text>
              )}
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
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <Text color="red" size="1" as="span" className="ml-2">
                  {errors.password.message}
                </Text>
              )}
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
                type="password"
                autoComplete="new-password"
                disabled={isLoading}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("confirmPassword", {
                  required: "Please confirm your password"
                })}
              />
              {errors.confirmPassword && (
                <Text color="red" size="1" as="span" className="ml-2">
                  {errors.confirmPassword.message}
                </Text>
              )}
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
