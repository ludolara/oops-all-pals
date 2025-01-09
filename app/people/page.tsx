import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'People' })

export default function Page() {
  const authors = allAuthors as Authors[]

  return (
    <>
      {
        authors.map((author: Authors) => {
          const mainContent = coreContent(author)
          return (
            <AuthorLayout key={author.name} content={mainContent}>
              <MDXLayoutRenderer code={author.body.code} />
            </AuthorLayout>
          )
        })
      }
    </>
  )
}
