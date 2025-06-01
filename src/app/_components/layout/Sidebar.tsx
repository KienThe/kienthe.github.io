"use client"

import {
  ColorWheelIcon,
  FileTextIcon,
  GearIcon,
  HomeIcon,
  MixerHorizontalIcon,
  ReaderIcon,
  StackIcon
} from "@radix-ui/react-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon
  },
  {
    title: "Metruyencv",
    icon: StackIcon,
    submenu: [
      {
        title: "Books",
        href: "/books",
        icon: ReaderIcon
      },
      {
        title: "Chapters",
        href: "/chapters",
        icon: FileTextIcon
      },
      {
        title: "Settings",
        href: "/settings",
        icon: GearIcon
      }
    ]
  },
  {
    title: "Configs",
    icon: MixerHorizontalIcon,
    submenu: [
      {
        title: "Theme",
        href: "/configs/theme",
        icon: ColorWheelIcon
      }
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-screen bg-white border-r">
      <div className="p-4">
        <h1 className="text-xl font-bold">Metruyencv</h1>
      </div>

      <nav className="mt-4">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                  pathname === item.href ? "bg-gray-100" : ""
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.title}
              </Link>
            ) : (
              <div className="px-4 py-2">
                <div className="flex items-center text-gray-700">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.title}
                </div>
                {item.submenu && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded ${
                          pathname === subItem.href ? "bg-gray-100" : ""
                        }`}
                      >
                        <subItem.icon className="w-4 h-4 mr-3" />
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}
