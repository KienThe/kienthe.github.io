import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full p-4 flex flex-col items-center fixed bottom-0">
      <div className="w-fit">
        <h2 className="text-center text-sky-300 font-bold text-3xl mb-4">
          Follow me
        </h2>
        <div className="flex justify-center gap-2">
          <Link
            href="https://www.facebook.com/kien.kinhkhung/"
            className="flex items-center justify-center w-12 h-12 p-2 bg-sky-600 rounded rounded-full text-3xl"
          >
            <i className="fab fa-facebook-f" />
          </Link>

          <Link
            href="https://github.com/KienThe"
            className="flex items-center justify-center w-12 h-12 p-2 rounded rounded-full bg-white text-3xl"
          >
            <i className="fab fa-github" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
