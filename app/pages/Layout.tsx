import { Link } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="app">
      <header>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/about">About</Link>
          <Link href="/not-found">Not Found</Link>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
