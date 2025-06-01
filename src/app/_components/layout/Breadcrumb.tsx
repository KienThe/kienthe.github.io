"use client"

import { Flex, Text } from "@radix-ui/themes"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <Flex align="center" gap="2" m="4">
      <Link href="/">
        <Text color="gray" weight="bold" className="hover:underline">
          Home
        </Text>
      </Link>
      {segments.map((seg, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/")
        const isLast = idx === segments.length - 1
        return (
          <Flex align="center" gap="2" key={href}>
            <Text color="gray">/</Text>
            {isLast ? (
              <Text color="gray" weight="bold">
                {seg.charAt(0).toUpperCase() + seg.slice(1)}
              </Text>
            ) : (
              <Link href={href}>
                <Text color="gray" className="hover:underline">
                  {seg.charAt(0).toUpperCase() + seg.slice(1)}
                </Text>
              </Link>
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}
