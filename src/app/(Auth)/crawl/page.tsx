"use client"

import { CrawlView } from "~/app/_components/crawl/CrawlView"

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">MetTruyenCV Crawler</h1>
      <CrawlView />
    </div>
  )
}
