import { Authors, allAuthors } from 'contentlayer/generated'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import AuthorLayout from '@/layouts/AuthorLayout'
import { coreContent } from 'pliny/utils/contentlayer'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({ title: 'People' })

export default function Page() {
  const authors = allAuthors as Authors[]

  const AffiliationOrder = {
    Faculty: 1,
    "PhD Student": 2,
    "Research Scientist": 3,
    Unknown: 999, // Default for affiliations not listed
  } as const;

  type AffiliationOrderKeys = keyof typeof AffiliationOrder

  const pluralize = (affiliation: string) => {
    if (affiliation.toLowerCase().endsWith('s') || affiliation.toLowerCase().includes('faculty')) {
      return `${affiliation}`
    }
    return `${affiliation}s`
  }

  const authorsByAffiliation = authors.reduce((acc, author) => {
    const affiliation = author.affiliation || 'Unknown'
    acc[affiliation] = [...(acc[affiliation] || []), author]
    return acc
  }, {} as Record<string, Authors[]>)

  const sortedAffiliations = Object.entries(authorsByAffiliation).sort(([a], [b]) => {
    const orderA = AffiliationOrder[a as AffiliationOrderKeys] || AffiliationOrder.Unknown
    const orderB = AffiliationOrder[b as AffiliationOrderKeys] || AffiliationOrder.Unknown
    return orderA - orderB
  })

  return (
    <div className="space-y-12">
      {sortedAffiliations.map(([affiliation, authors]) => (
        <div key={affiliation} className="space-y-6">
          <h1
            className="text-xl font-extrabold leading-7 tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl sm:leading-8 md:text-4xl md:leading-10"
          >
            {pluralize(affiliation)}
          </h1>
          <div className="border-t border-gray-300 dark:border-gray-700 my-2"></div>

          <div>
            {authors.map((author) => {
              const mainContent = coreContent(author)
              return (
                <AuthorLayout key={author.name} content={mainContent}>
                  <MDXLayoutRenderer code={author.body.code} />
                </AuthorLayout>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
