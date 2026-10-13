// Parses pages and sitemaps with a nesting limit. htmlparser2 (cheerio's own) builds the tree, and
// no element is opened more than MAX_DEPTH levels deep, so parsing, selectors and every later walk
// over the tree (text, html, clone) stay bounded in time and stack. Also how a page's bytes become
// text, and its language and title, read the same way by crawl and extract.
import * as cheerio from 'cheerio'
import { DomHandler, Parser } from 'htmlparser2'

export const MAX_DEPTH = 256
export const MAX_CHILDREN = 5000
export const MAX_ELEMENTS = 100_000
const MAX_TITLE = 300
const LANGUAGE = /^[a-z]{2,3}(-[a-z0-9]{1,8})*$/

/**
 * htmlparser2 closes few tags by itself, so old pages with unclosed tags (<p><font> without
 * </font>) nest hundreds of levels deep. Past MAX_DEPTH an opening tag is left out and what it
 * holds goes to the element at the limit, so the text is kept and the parser's stack, which it
 * searches on every tag, stays short. A link is still opened one level past the limit, so links
 * are kept too; void elements (img) never count. A closing tag that matches the last tag left out
 * is dropped with it.
 *
 * A page (not a sitemap) also keeps at most MAX_CHILDREN children per element and MAX_ELEMENTS
 * elements in all: selector lookups slow down with the number of elements side by side. Past
 * either limit a tag is left out the same way, its text kept.
 */
class BoundedParser extends Parser {
  skipped = []
  // Children opened so far under each element on the stack, by its depth (0 is the document).
  children = [0]
  elements = 0

  emitOpenTag(name) {
    const foreign = this.foreignContext.length
    super.emitOpenTag(name)
    const isVoid = this.isVoidElement(name)
    const parent = this.stack.length - (isVoid ? 0 : 1)
    // Only what is kept counts towards the limits; a tag left out for depth does not.
    const deep = this.stack.length > MAX_DEPTH + (name === 'a' ? 1 : 0)
    const crowded = !deep && this.htmlMode && ((this.children[parent] = (this.children[parent] ?? 0) + 1) > MAX_CHILDREN || ++this.elements > MAX_ELEMENTS)
    if (!deep && !crowded) {
      if (!isVoid) this.children[this.stack.length] = 0
      return
    }
    this.attribs = null
    // A void tag was never put on the stack; without its name no closing tag is sent for it.
    if (isVoid) {
      this.tagname = ''
      return
    }
    this.stack.shift()
    if (this.foreignContext.length > foreign) this.foreignContext.shift()
    this.skipped.push(name)
  }

  onclosetag(start, endIndex) {
    const name = this.skipped.length ? this.getSlice(start, endIndex) : ''
    if (name && (this.lowerCaseTagNames ? name.toLowerCase() : name) === this.skipped[this.skipped.length - 1]) {
      this.skipped.pop()
      this.endIndex = endIndex
      this.startIndex = endIndex + 1
      return
    }
    // A stray </p> opens and closes an empty p; at the limit that p is left out, not remembered.
    const before = this.skipped.length
    super.onclosetag(start, endIndex)
    this.skipped.length = before
  }
}

/** @param {string} text @param {{ xml?: boolean }} [opts] */
export function load(text, { xml = false } = {}) {
  const handler = new DomHandler(undefined, { xmlMode: xml })
  new BoundedParser(handler, { xmlMode: xml }).end(text)
  return cheerio.load(handler.root, xml ? { xml: true } : { xml: { xmlMode: false, encodeEntities: 'utf8' } })
}

/**
 * A page's bytes as text, by the charset in the Content-Type header, else a <meta charset> or
 * http-equiv in the first 1024 bytes, else UTF-8 (also for a charset TextDecoder does not know).
 * @param {Buffer} body @param {string} [contentType]
 */
export function decode(body, contentType) {
  const label = /charset=["']?([\w-]+)/i.exec(String(contentType ?? ''))?.[1] ?? /<meta[^>]+charset=["']?([\w-]+)/i.exec(body.subarray(0, 1024).toString('latin1'))?.[1]
  try { return new TextDecoder(label ?? 'utf-8').decode(body) } catch { return new TextDecoder('utf-8').decode(body) }
}

/** A lang or hreflang value in lower case, or undefined when it is not a language tag. */
export function language(value) {
  const v = String(value ?? '').trim().toLowerCase()
  return LANGUAGE.test(v) ? v : undefined
}

/** The page title, cut at MAX_TITLE characters. */
export const title = ($) => $('title').first().text().trim().slice(0, MAX_TITLE)
