"use client"

import { ExitIcon } from "@radix-ui/react-icons"
import { Button, Flex, Text } from "@radix-ui/themes"
import { signOut } from "next-auth/react"

export function Topbar() {
  return (
    <Flex
      align="center"
      justify="between"
      height="48px"
      className="border-b bg-white px-4 shadow-sm"
    >
      <Text size="5" weight="bold">
        {/* Thêm tiêu đề động nếu muốn */}
      </Text>
      <Button
        variant="soft"
        color="gray"
        onClick={() => signOut({ callbackUrl: "/auth/login" })}
        size="3"
        radius="full"
        className="gap-2"
      >
        <ExitIcon />
        Logout
      </Button>
    </Flex>
  )
}
