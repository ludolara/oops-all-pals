import articles from './articles.mjs'

async function postbuild() {
  await articles()
}

postbuild()
