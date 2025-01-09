import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import xml2js from 'xml2js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ARTICLES_JS_PATH = path.join(__dirname, '../articlesData.js')

// Check if the JavaScript file exists
let articlesData
if (fs.existsSync(ARTICLES_JS_PATH)) {
  try {
    // eslint-disable-next-line @next/next/no-assign-module-variable
    const module = await import(`file://${ARTICLES_JS_PATH}`)
    articlesData = module.default || []
  } catch (err) {
    console.error('Error importing articlesData.js:', err)
    process.exit(1)
  }
} else {
  console.error(`File ${ARTICLES_JS_PATH} does not exist. Please ensure the file is available.`)
  process.exit(1)
}

async function fetchArxivMetadata(arxivId) {
  const arxivApiUrl = `http://export.arxiv.org/api/query?search_query=id:${arxivId}`

  try {
    const response = await axios.get(arxivApiUrl)
    const xmlData = response.data

    const parser = new xml2js.Parser()
    const parsed = await parser.parseStringPromise(xmlData)

    const entry = parsed.feed.entry && parsed.feed.entry[0]
    if (!entry) {
      throw new Error(`No entry found for ${arxivId}`)
    }

    const rawTitle = entry.title?.[0]?.trim() || 'No title'
    const rawSummary = entry.summary?.[0]?.trim() || 'No summary'

    const cleanSummary = rawSummary
      .replace(/(\$.*?\$|\[.*?\])/g, '')
      .replace(/\\\w+({[^}]*})?/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const rawAuthors = entry.author?.map((authorObj) => authorObj.name?.[0])
    const authors = Array.isArray(rawAuthors) ? rawAuthors : []

    let comments = ''
    if (entry['arxiv:comment']) {
      const commentNode = entry['arxiv:comment'][0]
      if (typeof commentNode === 'string') {
        comments = commentNode
      } else if (typeof commentNode === 'object' && commentNode._) {
        comments = commentNode._
      }
    }

    const published = entry.published?.[0] || ''
    const updated = entry.updated?.[0] || ''
    // const categories = entry.category?.map(cat => cat.$.term) || [];

    return {
      title: rawTitle,
      summary: cleanSummary,
      authors,
      comments,
      published,
      updated,
    }
  } catch (error) {
    console.error(`Error fetching metadata for Arxiv ID ${arxivId}:`, error)
    return null
  }
}

export default async function main() {
  const publicationsPath = path.join(__dirname, '../data/blog/arxiv-publications')
  if (!fs.existsSync(publicationsPath)) {
    fs.mkdirSync(publicationsPath, { recursive: true })
  }

  for (const article of articlesData) {
    const match = article.url.match(/abs\/([^/]+)/)
    if (!match) {
      console.warn(`Could not parse Arxiv ID from URL: ${article.url}`)
      continue
    }
    const arxivId = match[1]

    // Check if file already exists
    const mdxFileName = `${arxivId}.mdx`
    const mdxFilePath = path.join(publicationsPath, mdxFileName)
    if (fs.existsSync(mdxFilePath)) {
      console.log(`File "${mdxFileName}" already exists. Skipping.`)
      continue
    }

    console.log(`Fetching Arxiv metadata for ${arxivId}...`)
    const metadata = await fetchArxivMetadata(arxivId)
    if (!metadata) {
      console.warn(`Skipping ${arxivId} due to metadata fetch error.`)
      continue
    }

    const { title, summary, authors, comments, published, updated } = metadata

    const date = published.slice(0, 10) || ''
    const updated_date = updated.slice(0, 10) || ''

    const frontmatter = `---
title: '${title.replace(/'/g, '’')}'
authors: [${authors.map((auth) => `'${auth.replace(/'/g, '’')}'`).join(',')}]
articleUrl: '${article.url}'
comments: "${comments?.replace(/"/g, '\\"')}"
date: '${date}'
lastmod: '${updated_date}'
summary: '${summary}'
---

## Abstract

${summary}
`

    try {
      fs.writeFileSync(mdxFilePath, frontmatter, 'utf8')
      console.log(`Created file: ${mdxFilePath}`)
    } catch (err) {
      console.error(`Error writing file "${mdxFilePath}":`, err)
    }
  }
}
