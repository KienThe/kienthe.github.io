"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons"
import { Button, Card, Flex, Text } from "@radix-ui/themes"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { loginSchema } from "~/lib/zod"
import type { LoginUser } from "~/server/db/types"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginUser>({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(loginSchema)
  })

  async function onSubmit(data: LoginUser) {
    setIsLoading(true)
    try {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirectTo: "/crawl"
      })
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card size="2" style={{ maxWidth: 350, margin: "auto" }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap="4">
          <Text as="label" size="2" weight="medium" htmlFor="email">
            Email
          </Text>
          <div className="relative">
            <EnvelopeClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
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
          </div>
          {errors.email && (
            <Text color="red" size="1" as="span" className="ml-2">
              {errors.email.message}
            </Text>
          )}
          <Text as="label" size="2" weight="medium" htmlFor="password">
            Password
          </Text>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-9 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("password", { required: "Password is required" })}
            />
          </div>
          {errors.password && (
            <Text color="red" size="1" as="span" className="ml-2">
              {errors.password.message}
            </Text>
          )}
          <Button disabled={isLoading}>
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            Sign In
          </Button>
        </Flex>
      </form>
    </Card>
  )
}
