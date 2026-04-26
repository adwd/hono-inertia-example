import { Head, useForm } from '@inertiajs/react'
import Layout from '../layout'

export default function New() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    body: ''
  })

  return (
    <Layout>
      <Head title="New Post" />
      <h1>New Post</h1>
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault()
          post('/posts')
        }}
      >
        <label>
          <span>Title</span>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
          />
          {errors.title && <small className="error">{errors.title}</small>}
        </label>
        <label>
          <span>Body</span>
          <textarea rows={4} value={data.body} onChange={(e) => setData('body', e.target.value)} />
          {errors.body && <small className="error">{errors.body}</small>}
        </label>
        <button type="submit" disabled={processing}>
          {processing ? 'Creating…' : 'Create'}
        </button>
      </form>
    </Layout>
  )
}
