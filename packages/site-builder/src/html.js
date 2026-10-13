// Parses pages and sitemaps with a nesting limit. htmlparser2 (cheerio's own) builds the tree, and
// a document with elements nested deeper than MAX_DEPTH is refused while it is read, so parsing,
// selectors and every later walk over the tree (text, html, clone) stay bounded in time and stack.
// Real pages nest a few dozen levels.
import * as cheerio from 'cheerio'
import { DomHandler, Parser } from 'htmlparser2'

export const MAX_DEPTH = 256

/** @param {string} text @param {{ xml?: boolean }} [opts] */
export function load(text, { xml = false } = {}) {
  const handler = new DomHandler(undefined, { xmlMode: xml })
  const open = handler.onopentag.bind(handler)
  handler.onopentag = (name, attribs) => {
    // tagStack holds the document itself plus every open element.
    if (handler.tagStack.length > MAX_DEPTH) throw new Error(`elements nested more than ${MAX_DEPTH} levels deep`)
    open(name, attribs)
  }
  new Parser(handler, { xmlMode: xml }).end(text)
  return cheerio.load(handler.root, xml ? { xml: true } : { xml: { xmlMode: false, encodeEntities: 'utf8' } })
}
