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
const LOGIN_SEGMENTS = new Set(['login', 'log-in', 'logg-inn', 'logginn', 'signin', 'sign-in', 'min-side', 'minside', 'mine-sider', 'my-account', 'myaccount', 'account', 'konto', 'min-konto', 'wp-login',
  'mina-sidor', 'mitt-konto', 'mein-konto', 'anmelden', 'einloggen', 'mon-compte', 'connexion', 'espace-membres', 'espace-membre', 'mi-cuenta', 'iniciar-sesion'])
const LOGIN_TEXTS = new Set(['logg inn', 'logg på', 'log in', 'login', 'sign in', 'min side', 'mine sider', 'my account', 'min konto', 'my page', 'logga in', 'log ind',
  'anmelden', 'einloggen', 'connexion', 'se connecter', 'iniciar sesión', 'acceder'])
// A link to the CMS's own login is a note only with plain admin wording (or none, an icon).
const ADMIN_TEXTS = new Set(['', 'logg inn', 'log in', 'login', 'admin', 'meta'])
// Account wording is a login area wherever the link goes: «Logg inn på Min side», «Mein Konto».
const ACCOUNT_TEXT = /(^|[\s(])(min side|mine sider|my account|min konto|my page|mina sidor|mitt konto|min sida|mein konto|kundenkonto|mitgliederbereich|mon compte|espace membres?|espace client|mi cuenta|área de socios)/
// Member wording alone is not: «Bli medlem» and «Våre medlemmer» are ordinary pages. It only
// keeps a link to the CMS's own login from being a note: that is the members' login.
const MEMBER_TEXT = /(^|[\s(])(medlem|member|mitglied|membre|socio)/
const MEMBER_SEGMENT = /^(min-?side|mine-sider|mina-sidor|my-?account|account|konto|min-konto|mitt-konto|mein-konto|mon-compte|mi-cuenta|profil|profile|medlem|member|mitglied|membre|espace-membre|socio)/
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
// Percent-encoding is undone, so /min%2Dside/ is /min-side/.
const decoded = (s) => { try { return decodeURIComponent(s) } catch { return s } }
const segments = (pathname) => pathname.toLowerCase().split('/').filter(Boolean).map((s) => decoded(s).replace(/\.[a-z0-9]{1,5}$/, ''))
// WordPress (PHP) acts on the last value of a repeated parameter.
const lastParam = (u, key) => { const all = u.searchParams.getAll(key); return (all[all.length - 1] ?? '').toLowerCase() }
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
  // Not under a member folder, not open registration or password reset, and a WordPress
  // redirect only into wp-admin.
  if (!s.length || s.some((x) => MEMBER_SEGMENT.test(x))) return false
  const action = lastParam(u, 'action')
  if (action && action !== 'login') return false
  const redirect = u.searchParams.get('redirect_to')
  if (redirect !== null) {
    let to = ''
    try { to = new URL(redirect, u).pathname } catch { return false }
    if (!/\/wp-admin(\/|$)/.test(to)) return false
  }
  const last = s[s.length - 1]
  if (last === 'wp-login' || last === 'wp-admin' || s.indexOf('wp-admin') === 0 || s.indexOf('wp-admin') === 1) return true
  return (['admin', 'administrator', 'umbraco', 'ghost'].includes(s[0]) && s.length <= 2) || (s[0] === 'user' && s[1] === 'login' && s.length === 2)
}

/**
 * WordPress's own form for a password-protected post: it posts to wp-login.php?action=postpass
 * (not under a member folder), is marked as that form, and has nothing but the password, hidden
 * fields and a button. Anything else is a login.
 */
function isPostPasswordForm($, form, pageUrl) {
  const n = normalize(String($(form).attr('action') ?? ''), pageUrl)
  if (!n) return false
  const u = new URL(n)
  const s = segments(u.pathname)
  if (s[s.length - 1] !== 'wp-login' || lastParam(u, 'action') !== 'postpass' || s.some((x) => MEMBER_SEGMENT.test(x))) return false
  if (!$(form).hasClass('post-password-form') && !$(form).find('[name="post_password"]').length) return false
  if ($(form).find('textarea, select').length) return false
  return $(form).find('input').toArray().every((i) => ['password', 'hidden', 'submit'].includes(String($(i).attr('type') ?? '').trim().toLowerCase()))
}

/** True when a path has a segment that shop systems use for product pages. @param {string} pathname */
export const isProductPath = (pathname) => segments(pathname).some((s) => PRODUCT_SEGMENTS.has(s))

/** The last part of a schema.org type ("https://schema.org/Product", "schema:Product") in lower case. */
const typeName = (t) => { const s = String(t); return s.slice(Math.max(s.lastIndexOf('/'), s.lastIndexOf(':')) + 1).toLowerCase() }
const PRODUCT_TYPES = new Set(['product', 'productgroup', 'individualproduct', 'productmodel'])
const OFFER_TYPES = new Set(['offer', 'aggregateoffer'])
const hasPrice = (o) => ['price', 'lowPrice', 'highPrice', 'priceSpecification'].some((k) => o[k] !== undefined && o[k] !== null && o[k] !== '')

/**
 * Whether one JSON-LD script describes a product, and one with a price. Only the items the page
 * is about count: the top-level items, their @graph members and their mainEntity. A product
 * named inside another item (an organisation's offer, a review's subject) does not, and an
 * offer counts only on its own or as a main product's offers (an event's tickets are not a
 * shop). Never throws.
 * @param {string} text
 */
export function jsonLd(text) {
  const { product, priced } = readJsonLd(text)
  return { product, priced }
}

const ARTICLE_TYPES = new Set(['article', 'blogposting', 'newsarticle'])

/** jsonLd, plus whether a main item is an article. */
function readJsonLd(text) {
  const found = { product: false, priced: false, article: false }
  if (text.length > MAX_JSONLD_BYTES) return found
  let data
  try { data = JSON.parse(text) } catch { return found }
  const stack = [{ v: data, depth: 0 }]
  let nodes = 0
  while (stack.length && nodes++ < MAX_JSONLD_NODES) {
    const { v, depth } = stack.pop()
    if (!v || typeof v !== 'object' || depth > MAX_JSONLD_DEPTH) continue
    if (Array.isArray(v)) { for (const x of v) stack.push({ v: x, depth: depth + 1 }); continue }
    const types = [].concat(v['@type'] ?? []).map(typeName)
    if (types.some((t) => PRODUCT_TYPES.has(t))) {
      found.product = true
      if ([].concat(v.offers ?? []).some((o) => o && typeof o === 'object' && hasPrice(o))) found.priced = true
    }
    if (types.some((t) => OFFER_TYPES.has(t)) && hasPrice(v)) found.priced = true
    if (types.some((t) => ARTICLE_TYPES.has(t))) found.article = true
    for (const k of ['@graph', 'mainEntity']) if (v[k] && typeof v[k] === 'object') stack.push({ v: v[k], depth: depth + 1 })
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
  const s = { product: false, priced: false, article: false, shop: [], payment: [], login: [], cmsLogin: [], passwordPosts: [], integrations: [], documents: new Set(), images: new Set(), links: new Set(), languages: new Set(), lang: language($('html').attr('lang')), alternates: [], forward: null, textLength: 0 }
  const add = (list, item) => { if (list.length < MAX_MATCHES && !list.includes(item)) list.push(item) }
  const named = new Set()
  const integration = (kind, name) => { if (s.integrations.length < MAX_INTEGRATIONS && !named.has(name)) { named.add(name); s.integrations.push({ kind, name }) } }

  for (const el of $('script').toArray().filter((e) => String($(e).attr('type') ?? '').trim().toLowerCase() === 'application/ld+json').slice(0, MAX_JSONLD_SCRIPTS)) {
    const f = readJsonLd($(el).text())
    s.product ||= f.product
    s.priced ||= f.priced
    s.article ||= f.article
  }
  // og:type=article is not used: Yoast and similar put it on ordinary pages.
  // Microdata: only top-level items (not a property of another item) or the page's mainEntity.
  for (const el of $('[itemtype]').toArray()) {
    const prop = $(el).attr('itemprop')
    if (prop !== undefined && prop !== 'mainEntity') continue
    if (!PRODUCT_TYPES.has(typeName(String($(el).attr('itemtype')).trim()))) continue
    s.product = true
    if ($(el).find('[itemprop="price"], [itemprop="lowPrice"]').length) s.priced = true
  }
  if (s.priced) add(s.shop, 'product markup with a price')
  for (const [name, re] of PLATFORMS) if (re.test(html)) add(s.shop, `${name} shop system`)
  if ($('[name="add-to-cart"], [name="add_to_cart"], .add_to_cart_button, .single_add_to_cart_button').length) add(s.shop, 'add-to-cart button')

  for (const el of $('input').toArray()) {
    if (String($(el).attr('type') ?? '').trim().toLowerCase() !== 'password') continue
    const form = $(el).closest('form')
    if (form.length && isPostPasswordForm($, form[0], url)) add(s.passwordPosts, 'password-protected post')
    else { add(s.login, 'password field'); break }
  }
  for (const el of $('form').toArray()) {
    const n = normalize(String($(el).attr('action') ?? '') || url, url)
    if (!n) continue
    const u = new URL(n)
    if (sameSite(u.hostname, host)) {
      if (isCartUrl(u)) add(s.shop, `form to ${shortPath(u)}`)
      else if (isLoginUrl(u) && !isPostPasswordForm($, el, url)) add(s.login, `form to ${shortPath(u)}`)
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
    const label = $(el).text().replace(/\s+/g, ' ').trim().toLowerCase()
    const cmsAdmin = isCmsAdminUrl(u)
    const member = MEMBER_TEXT.test(label)
    if (cmsAdmin && !member && ADMIN_TEXTS.has(label)) { add(s.cmsLogin, `link to ${shortPath(u)}`); continue }
    if (isLoginUrl(u) || LOGIN_TEXTS.has(label) || ACCOUNT_TEXT.test(label) || (cmsAdmin && member)) { add(s.login, `link to ${shortPath(u)}`); continue }
    if (!SKIP.test(u.pathname)) s.links.add(n)
  }
  for (const v of [$('html').attr('lang'), ...$('link[rel="alternate"][hreflang]').toArray().map((e) => $(e).attr('hreflang'))]) {
    const l = language(v)
    if (l) s.languages.add(l.split('-')[0])
  }
  for (const el of $('link[rel="alternate"][hreflang]').toArray().slice(0, MAX_LINKS)) {
    const l = language($(el).attr('hreflang'))
    const href = normalize(String($(el).attr('href') ?? ''), url)
    if (l && href) s.alternates.push({ lang: l, href })
  }
  for (const el of $('img').toArray()) {
    const n = normalize(String($(el).attr('src') || $(el).attr('data-src') || ''), url)
    if (n) s.images.add(n)
  }
  // A page can forward without HTTP: a meta refresh, or a frameset around another address.
  const refresh = /url[ \t]*=[ \t]*['"]?([^'"]+)/i.exec(String($('meta[http-equiv="refresh" i]').first().attr('content') ?? '').slice(0, 2048))
  const target = refresh ? refresh[1].trim() : $('frameset frame[src]').first().attr('src')
  if (target) s.forward = normalize(String(target).slice(0, 2048), url)
  // How much a visitor can read without JavaScript: the main content, or the body without one,
  // leaving out scripts, styles and cookie or consent banners.
  const content = ($('main').length ? $('main') : $('body')).first().clone()
  content.find('script, style, noscript, template, [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i]').remove()
  s.textLength = content.text().replace(/\s+/g, ' ').trim().length
  return s
}
