import { Head, Link } from '@inertiajs/react'
import Layout from '../layout'

type Post = { id: number; title: string; body: string }

export default function Index({ posts }: { posts: Post[] }) {
  return (
    <Layout>
      <Head title="Posts" />
      <h1>Posts</h1>
      <p>
        <Link href="/posts/new">+ New post</Link>
      </p>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}
