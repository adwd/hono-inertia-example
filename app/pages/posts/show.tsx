import { Head, Link } from '@inertiajs/react'
import Layout from '../layout'

type Post = { id: number; title: string; body: string }

export default function Show({ post }: { post: Post }) {
  return (
    <Layout>
      <Head title={post.title} />
      <article>
        <h1>{post.title}</h1>
        <p>{post.body}</p>
      </article>
      <p>
        <Link href="/posts">← Back to list</Link>
      </p>
    </Layout>
  )
}
