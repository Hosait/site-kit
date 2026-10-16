// What one page (or robots.txt) shows about the kind of site it is: a shop, a product catalogue,
// a login or member area, built-in services, documents and images. Used by assess. Pages are
// parsed with the bounded parser, JSON-LD with JSON.parse under a size cap and walked
// iteratively with a depth cap, and every text check is a plain lookup or a regex without
// nested repetition, so a hostile page costs linear time.
import { IMAGE, SKIP, normalize, sameSite } from './crawl.js'
import { language, load } from './html.js'

export const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|odt|ods|odp|rtf)$/i
const MAX_JSONLD_BYTES = 256 * 1024
const MAX_JSONLD_SCRIPTS = 20
const MAX_JSONLD_NODES = 5000
const MAX_JSONLD_DEPTH = 20
const MAX_LINKS = 2000
const MAX_MATCHES = 5
const MAX_INTEGRATIONS = 20

// Path segments (lower case, without a file extension) and query keys that belong to a cart or
// a checkout, in the languages Hosait's customers use.
const CART_SEGMENTS = new Set(['cart', 'checkout', 'basket', 'handlekurv', 'handlevogn', 'kasse', 'kassen', 'kurv', 'varukorg', 'kassa', 'warenkorb', 'panier', 'carrito', 'shopping-cart', 'shoppingcart', 'add-to-cart', 'addtocart', 'add_to_cart'])
const CART_KEYS = new Set(['add-to-cart', 'add_to_cart', 'addtocart'])
const CART_ACTIONS = new Set(['add', 'addtocart', 'add-to-cart', 'add_to_cart', 'cart_add', 'addtobasket'])
const LOGIN_SEGMENTS = new Set(['login', 'log-in', 'logg-inn', 'logginn', 'signin', 'sign-in', 'min-side', 'minside', 'mine-sider', 'my-account', 'myaccount', 'account', 'konto', 'min-konto', 'wp-login'])
const LOGIN_TEXTS = new Set(['logg inn', 'logg på', 'log in', 'login', 'sign in', 'min side', 'mine sider', 'my account', 'min konto', 'my page', 'logga in', 'log ind'])
// Path segments of product pages in common shop systems (WooCommerce, Shopify, Norwegian shops).
const PRODUCT_SEGMENTS = new Set(['product', 'products', 'produkt', 'produkter', 'produkte', 'vare', 'varer', 'shop', 'butikk', 'nettbutikk', 'item', 'items', 'catalog', 'catalogue', 'katalog', 'sku'])
// Shop systems, by what they put in every page.
const PLATFORMS = [
  ['WooCommerce', /\/plugins\/woocommerce\/|woocommerce-no-js|wc-add-to-cart|add_to_cart_button/i],
  ['Shopify', /cdn\.shopify\.com|\.myshopify\.com|Shopify\.theme/],
  ['Magento', /Magento_|mage\/cookies|\/static\/version\d+\/frontend\//],
  ['PrestaShop', /var prestashop\b|content="PrestaShop|\/modules\/ps_shoppingcart/i],
  ['nopCommerce', /nopCommerce/i],
  ['Mystore', /mystore\.no|mystore4/i],
  ['BigCommerce', /cdn\d*\.bigcommerce\.com/i],
  ['Shopware', /shopware/i],
  ['OpenCart', /route=checkout\/|catalog\/view\/theme\//i],
  ['Ecwid', /app\.ecwid\.com/i],
  ['Snipcart', /cdn\.snipcart\.com/i],
  ['Quickbutik', /quickbutik/i],
  ['24Nettbutikk', /24nettbutikk/i],
  ['Jetshop', /jetshop/i],
]
// Services, by the host a script, iframe or form uses. Payment means a checkout: a reason to decline.
const PAYMENT = ['stripe.com', 'klarna.com', 'klarnacdn.net', 'klarnaservices.com', 'vipps.no', 'paypal.com', 'paypalobjects.com', 'nets.eu', 'dibspayment.eu', 'dintero.com', 'adyen.com', 'payex.com', 'swedbankpay.com', 'bambora.com', 'quickpay.net', 'mollie.com', 'svea.com', 'paytrail.com', 'checkout.com', 'sumup.com']
const BOOKING = ['calendly.com', 'simplybook.me', 'simplybook.it', 'timma.no', 'timma.fi', 'bookingsystem.no', 'acuityscheduling.com', 'squarespacescheduling.com', 'booksy.com', 'fresha.com', 'setmore.com', 'youcanbook.me', 'gettimely.com', 'bokadirekt.se', 'onlinebooq.net', 'planyo.com', 'resdiary.com', 'opentable.com', 'easytable.com', 'dinnerbooking.com']
const FEEDS = ['webcruiter.no', 'jobylon.com', 'recman.no', 'teamtailor.com', 'easycruit.com', 'reachmee.com', 'varbi.com', 'visma.net', 'visma.com', 'tripletex.no', 'poweroffice.net', '24sevenoffice.com', 'xledger.net', 'unimicro.no']
// Iframes Site Kit has blocks or consent handling for, and tag-manager and tracking frames: not an integration.
const ORDINARY_FRAMES = ['youtube.com', 'youtube-nocookie.com', 'youtu.be', 'vimeo.com', 'google.com', 'googletagmanager.com', 'doubleclick.net', 'spotify.com', 'soundcloud.com', 'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com']

const hostIn = (host, list) => list.some((d) => host === d || host.endsWith('.' + d))
const segments = (pathname) => pathname.toLowerCase().split('/').filter(Boolean).map((s) => s.replace(/\.[a-z0-9]{1,5}$/, ''))
const shortPath = (u) => (u.pathname + u.search).slice(0, 100)

/** True when an address is a cart, a checkout or an add-to-cart action. @param {URL} u */
export function isCartUrl(u) {
  if (segments(u.pathname).some((s) => CART_SEGMENTS.has(s))) return true
  for (const [k, v] of u.searchParams) if (CART_KEYS.has(k.toLowerCase()) || (k.toLowerCase() === 'action' && CART_ACTIONS.has(v.toLowerCase()))) return true
  return false
}

/** True when an address is a login, account or «min side» page. @param {URL} u */
export const isLoginUrl = (u) => segments(u.pathname).some((s) => LOGIN_SEGMENTS.has(s))

/**
 * True when an address is the old site's own CMS admin login: WordPress (also in a subfolder),
 * Joomla, Drupal, Umbraco, Ghost or a plain /admin. A link there is how the site's editors get
 * in, not a member area. @param {URL} u
 */
export function isCmsAdminUrl(u) {
  const s = segments(u.pathname)
  return s.includes('wp-login') || s.includes('wp-admin') || ['admin', 'administrator', 'umbraco', 'ghost'].includes(s[0]) || (s[0] === 'user' && s[1] === 'login')
}

/** WordPress's form for a password-protected post. @param {URL} u */
const isPostPassword = (u) => segments(u.pathname).includes('wp-login') && u.searchParams.get('action') === 'postpass'

/** True when a path has a segment that shop systems use for product pages. @param {string} pathname */
export const isProductPath = (pathname) => segments(pathname).some((s) => PRODUCT_SEGMENTS.has(s))

/** The last part of a schema.org type ("https://schema.org/Product", "schema:Product") in lower case. */
const typeName = (t) => { const s = String(t); return s.slice(Math.max(s.lastIndexOf('/'), s.lastIndexOf(':')) + 1).toLowerCase() }
const PRODUCT_TYPES = new Set(['product', 'productgroup', 'individualproduct', 'productmodel'])
const OFFER_TYPES = new Set(['offer', 'aggregateoffer'])
const hasPrice = (o) => ['price', 'lowPrice', 'highPrice', 'priceSpecification'].some((k) => o[k] !== undefined && o[k] !== null && o[k] !== '')

/**
 * Whether one JSON-LD script describes a product, and one with a price. An offer counts only
 * on its own or inside a product (an event's tickets are not a shop). Never throws.
 * @param {string} text
 */
export function jsonLd(text) {
  const found = { product: false, priced: false }
  if (text.length > MAX_JSONLD_BYTES) return found
  let data
  try { data = JSON.parse(text) } catch { return found }
  const stack = [{ v: data, depth: 0, owner: null }]
  let nodes = 0
  while (stack.length && nodes++ < MAX_JSONLD_NODES) {
    const { v, depth, owner } = stack.pop()
    if (!v || typeof v !== 'object' || depth > MAX_JSONLD_DEPTH) continue
    if (Array.isArray(v)) { for (const x of v) stack.push({ v: x, depth: depth + 1, owner }); continue }
    const types = [].concat(v['@type'] ?? []).map(typeName)
    const product = types.some((t) => PRODUCT_TYPES.has(t))
    const offer = types.some((t) => OFFER_TYPES.has(t))
    if (product) found.product = true
    if ((owner === 'product' || (offer && owner === null)) && hasPrice(v)) found.priced = true
    const next = product ? 'product' : types.length ? 'other' : owner
    for (const x of Object.values(v)) if (x && typeof x === 'object') stack.push({ v: x, depth: depth + 1, owner: next })
  }
  return found
}

/**
 * What robots.txt shows about a shop: Disallow rules for a cart, a checkout or an add-to-cart
 * action. Shops keep crawlers out of these, so a rule is a sign even when no page shows a cart.
 * @param {string} text @returns {string[]} the rules, as written (the first MAX_INTEGRATIONS)
 */
export function robotsCartRules(text) {
  const found = new Set()
  for (const raw of String(text).split(/\r\n|\r|\n/)) {
    const line = raw.replace(/#.*/, '').trim()
    const m = /^disallow[ \t]*:[ \t]*(.*)$/i.exec(line)
    if (!m || !m[1]) continue
    const value = m[1].toLowerCase()
    const tokens = value.split(/[^a-z0-9_-]+/)
    const cart = tokens.some((t) => CART_SEGMENTS.has(t) || CART_KEYS.has(t)) || /[?&]action=add/.test(value)
    if (cart) found.add(line)
  }
  return [...found].slice(0, MAX_INTEGRATIONS)
}

/**
 * Everything assess reads from one page.
 * @param {string} html @param {string} url @param {string} host the site's host name
 */
export function pageSignals(html, url, host) {
  const $ = load(html)
  const s = { product: false, priced: false, shop: [], payment: [], login: [], cmsLogin: [], passwordPosts: [], integrations: [], documents: new Set(), images: new Set(), links: new Set(), languages: new Set() }
  const add = (list, item) => { if (list.length < MAX_MATCHES && !list.includes(item)) list.push(item) }
  const named = new Set()
  const integration = (kind, name) => { if (s.integrations.length < MAX_INTEGRATIONS && !named.has(name)) { named.add(name); s.integrations.push({ kind, name }) } }

  for (const el of $('script').toArray().filter((e) => String($(e).attr('type') ?? '').trim().toLowerCase() === 'application/ld+json').slice(0, MAX_JSONLD_SCRIPTS)) {
    const f = jsonLd($(el).text())
    s.product ||= f.product
    s.priced ||= f.priced
  }
  for (const el of $('[itemtype]').toArray()) {
    if (!PRODUCT_TYPES.has(typeName(String($(el).attr('itemtype')).trim()))) continue
    s.product = true
    if ($(el).find('[itemprop="price"], [itemprop="lowPrice"]').length) s.priced = true
  }
  if (s.priced) add(s.shop, 'product markup with a price')
  for (const [name, re] of PLATFORMS) if (re.test(html)) add(s.shop, `${name} shop system`)
  if ($('[name="add-to-cart"], [name="add_to_cart"], .add_to_cart_button, .single_add_to_cart_button').length) add(s.shop, 'add-to-cart button')

  for (const el of $('input').toArray()) {
    if (String($(el).attr('type') ?? '').trim().toLowerCase() !== 'password') continue
    const action = normalize(String($(el).closest('form').attr('action') ?? ''), url)
    if (action && isPostPassword(new URL(action))) add(s.passwordPosts, 'password-protected post')
    else { add(s.login, 'password field'); break }
  }
  for (const el of $('form').toArray()) {
    const n = normalize(String($(el).attr('action') ?? '') || url, url)
    if (!n) continue
    const u = new URL(n)
    if (sameSite(u.hostname, host)) {
      if (isCartUrl(u)) add(s.shop, `form to ${shortPath(u)}`)
      else if (isLoginUrl(u) && !isPostPassword(u)) add(s.login, `form to ${shortPath(u)}`)
    } else if (hostIn(u.hostname, PAYMENT)) add(s.payment, `form to ${u.hostname}`)
    else integration(hostIn(u.hostname, BOOKING) ? 'booking' : 'form', `form sent to ${u.hostname}`)
  }
  for (const el of $('iframe[src]').toArray()) {
    const n = normalize(String($(el).attr('src')), url)
    if (!n) continue
    const h = new URL(n).hostname
    if (sameSite(h, host) || hostIn(h, ORDINARY_FRAMES)) continue
    if (hostIn(h, PAYMENT)) add(s.payment, `embedded ${h}`)
    else integration(hostIn(h, BOOKING) ? 'booking' : hostIn(h, FEEDS) ? 'feed' : 'app', `embedded ${h}`)
  }
  for (const el of $('script[src]').toArray()) {
    const n = normalize(String($(el).attr('src')), url)
    if (!n) continue
    const h = new URL(n).hostname
    if (hostIn(h, PAYMENT)) add(s.payment, `script from ${h}`)
    else if (hostIn(h, BOOKING)) integration('booking', `script from ${h}`)
    else if (hostIn(h, FEEDS)) integration('feed', `script from ${h}`)
  }

  for (const el of $('a[href]').toArray()) {
    if (s.links.size >= MAX_LINKS) break
    const n = normalize(String($(el).attr('href')), url)
    if (!n) continue
    const u = new URL(n)
    if (DOCUMENT.test(u.pathname)) { s.documents.add(n); continue }
    if (!sameSite(u.hostname, host)) continue
    if (IMAGE.test(u.pathname)) { s.images.add(n); continue }
    if (isCartUrl(u)) { add(s.shop, `link to ${shortPath(u)}`); continue }
    if (isCmsAdminUrl(u)) { add(s.cmsLogin, `link to ${shortPath(u)}`); continue }
    const label = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase()
    if (isLoginUrl(u) || LOGIN_TEXTS.has(label)) { add(s.login, `link to ${shortPath(u)}`); continue }
    if (!SKIP.test(u.pathname)) s.links.add(n)
  }
  for (const v of [$('html').attr('lang'), ...$('link[rel="alternate"][hreflang]').toArray().map((e) => $(e).attr('hreflang'))]) {
    const l = language(v)
    if (l) s.languages.add(l.split('-')[0])
  }
  for (const el of $('img').toArray()) {
    const n = normalize(String($(el).attr('src') || $(el).attr('data-src') || ''), url)
    if (n) s.images.add(n)
  }
  return s
}
