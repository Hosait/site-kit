import assert from 'node:assert/strict'
import { test } from 'node:test'

import { isCartUrl, isLoginUrl, isProductPath, jsonLd, pageSignals, robotsCartRules } from '../src/signals.js'

const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`
const html = (body, head = '') => `<!doctype html><html lang="nb"><head>${head}</head><body>${body}</body></html>`

test('JSON-LD: a product, a product with a price, and an offer only counts on its own or in a product', () => {
  assert.deepEqual(jsonLd(JSON.stringify({ '@type': 'Product', name: 'Drill' })), { product: true, priced: false })
  assert.deepEqual(jsonLd(JSON.stringify({ '@type': 'Product', offers: { '@type': 'Offer', price: '199' } })), { product: true, priced: true })
  assert.deepEqual(jsonLd(JSON.stringify({ '@graph': [{ '@type': 'WebPage' }, { '@type': 'https://schema.org/Product', offers: [{ lowPrice: 10 }] }] })), { product: true, priced: true })
  assert.deepEqual(jsonLd(JSON.stringify({ '@type': 'Offer', price: 5 })), { product: false, priced: true })
  assert.deepEqual(jsonLd(JSON.stringify({ '@type': 'Event', offers: { '@type': 'Offer', price: 250 } })), { product: false, priced: false })
})

test('JSON-LD that is invalid, too large or nested very deep is read safely and quickly', () => {
  assert.deepEqual(jsonLd('{not json'), { product: false, priced: false })
  assert.deepEqual(jsonLd(JSON.stringify({ '@type': 'Product', pad: 'x'.repeat(300 * 1024) })), { product: false, priced: false })
  const deep = '['.repeat(5000) + JSON.stringify({ '@type': 'Product' }) + ']'.repeat(5000)
  const t = Date.now()
  assert.deepEqual(jsonLd(deep), { product: false, priced: false })
  const wide = JSON.stringify(Array.from({ length: 20000 }, () => ({ a: { b: 1 } })))
  jsonLd(wide)
  assert.ok(Date.now() - t < 500, `took ${Date.now() - t} ms`)
})

test('cart, login and product addresses are recognised by path segment and query, not by substring', () => {
  for (const u of ['https://x.no/handlekurv/', 'https://x.no/checkout', 'https://x.no/?add-to-cart=12', 'https://x.no/ajax?action=add&id=3', 'https://x.no/cart.php', 'https://x.no/kasse'])
    assert.ok(isCartUrl(new URL(u)), u)
  for (const u of ['https://x.no/cartography', 'https://x.no/om-oss', 'https://x.no/?action=view', 'https://x.no/kassebil'])
    assert.ok(!isCartUrl(new URL(u)), u)
  for (const u of ['https://x.no/min-side', 'https://x.no/wp-login.php', 'https://x.no/customer/account/login']) assert.ok(isLoginUrl(new URL(u)), u)
  assert.ok(!isLoginUrl(new URL('https://x.no/accountants')))
  assert.ok(isProductPath('/produkter/drill-x'))
  assert.ok(!isProductPath('/production-notes'))
})

test('robots.txt rules for a cart or an add-to-cart action are found, ordinary rules are not', () => {
  const text = 'User-agent: *\nDisallow: /ajax?action=add*\nDisallow: /handlekurv\nDisallow: /*?add-to-cart=*\nDisallow: /wp-admin/\nDisallow: /search # cart is not here\nAllow: /cart-info'
  assert.deepEqual(robotsCartRules(text), ['Disallow: /ajax?action=add*', 'Disallow: /handlekurv', 'Disallow: /*?add-to-cart=*'])
  assert.deepEqual(robotsCartRules('User-agent: *\nDisallow: /private\n'), [])
})

test('robots.txt with very long lines is read in linear time', () => {
  const t = Date.now()
  robotsCartRules('Disallow:' + ' \t'.repeat(200_000) + 'x\n' + 'Disallow: /' + 'a/'.repeat(200_000))
  assert.ok(Date.now() - t < 500, `took ${Date.now() - t} ms`)
})

test('a page shows a shop by priced product markup, a shop system, add-to-cart buttons and cart links', () => {
  const s = pageSignals(html(
    `<a href="/handlekurv/">Handlekurv</a><form action="/?add-to-cart=5"><button name="add-to-cart" value="5">Kjøp</button></form><div itemscope itemtype="https://schema.org/Product"><span itemprop="price">99</span></div>`,
    '<link rel="stylesheet" href="/wp-content/plugins/woocommerce/assets/css/woocommerce.css">' + ld({ '@type': 'Product', offers: { price: 99 } }),
  ), 'https://x.no/drill', 'x.no')
  assert.equal(s.product, true)
  assert.equal(s.priced, true)
  for (const m of ['product markup with a price', 'WooCommerce shop system', 'add-to-cart button', 'link to /handlekurv/', 'form to /?add-to-cart=5']) assert.ok(s.shop.includes(m), m)
})

// The old site's own CMS login (WordPress's Meta widget «Logg inn» → /wp-login.php, /wp-admin,
// Joomla's /administrator, Drupal's /user/login, Umbraco, Ghost) is how its editors get in, not a
// member area: it is noted, not counted as a login. Most Norwegian sites are WordPress.
test('a link to the CMS\'s own admin login is noted, not counted as a login area', () => {
  const s = pageSignals(html('<footer><a href="/wp-login.php">Logg inn</a> <a href="/blogg/wp-admin/">Admin</a> <a href="/administrator">Log in</a> <a href="/user/login">Logg inn</a> <a href="/umbraco">Logg inn</a></footer>'), 'https://x.no/', 'x.no')
  assert.deepEqual(s.login, [])
  assert.deepEqual(s.cmsLogin, ['link to /wp-login.php', 'link to /blogg/wp-admin/', 'link to /administrator', 'link to /user/login', 'link to /umbraco'])
})

test('a WordPress password-protected post is noted, not counted as a login area', () => {
  const s = pageSignals(html('<form action="https://x.no/wp-login.php?action=postpass" class="post-password-form" method="post"><input name="post_password" type="password"><input type="submit"></form>'), 'https://x.no/', 'x.no')
  assert.deepEqual(s.login, [])
  assert.deepEqual(s.passwordPosts, ['password-protected post'])
})

test('a login form on the site is still a login area, also when it posts to wp-login.php', () => {
  const s = pageSignals(html('<form action="/wp-login.php" method="post"><input name="log"><input type="password" name="pwd"></form><a href="/min-side">Logg inn</a>'), 'https://x.no/', 'x.no')
  assert.deepEqual(s.login, ['password field', 'form to /wp-login.php', 'link to /min-side'])
  assert.deepEqual(s.cmsLogin, [])
})

test('a page shows a login area by a password field, a login form or a login link on the same site', () => {
  const s = pageSignals(html('<form action="/kunde"><input type="Password" name="pw"></form><a href="/min-side">Min side</a><a href="/portal">Logg inn</a><a href="https://app.other.no/login">Logg inn</a>'), 'https://x.no/', 'x.no')
  assert.deepEqual(s.login, ['password field', 'link to /min-side', 'link to /portal'])
  assert.deepEqual(pageSignals(html('<p>Ring oss</p>'), 'https://x.no/', 'x.no').login, [])
})

test('services: payment is its own signal, booking and other apps are integrations, videos and maps are not', () => {
  const s = pageSignals(html(
    `<iframe src="https://www.youtube.com/embed/x"></iframe><iframe src="https://www.google.com/maps/embed?pb=1"></iframe>
     <iframe src="https://booking.timma.no/x"></iframe><iframe src="https://app.somecrm.io/widget"></iframe>
     <form action="https://list.example.com/subscribe"></form><script src="https://js.stripe.com/v3/"></script>`), 'https://x.no/', 'x.no')
  assert.deepEqual(s.payment, ['script from js.stripe.com'])
  assert.deepEqual(s.integrations.map((i) => i.kind + ' ' + i.name), ['form form sent to list.example.com', 'booking embedded booking.timma.no', 'app embedded app.somecrm.io'])
})

test('documents, images, links and languages are collected from a page', () => {
  const s = pageSignals(html('<a href="/a.pdf">a</a><a href="https://cdn.other.no/b.docx">b</a><a href="/c">c</a><a href="https://other.no/d">d</a><img src="/i.jpg"><a href="/big.png">p</a>', '<link rel="alternate" hreflang="en-GB" href="/en/">'), 'https://x.no/', 'x.no')
  assert.deepEqual([...s.documents], ['https://x.no/a.pdf', 'https://cdn.other.no/b.docx'])
  assert.deepEqual([...s.images].sort(), ['https://x.no/big.png', 'https://x.no/i.jpg'])
  assert.deepEqual([...s.links], ['https://x.no/c'])
  assert.deepEqual([...s.languages].sort(), ['en', 'nb'])
})

test('a page with very many links, forms, frames and images is read in linear time', () => {
  const group = (i) => `<div>${`<a href="/a${i}">A</a><a href="/d${i}.pdf">d</a><img src="/i${i}.jpg"><form action="/f${i}"><input type="text"></form><iframe src="https://app${i}.example.io/"></iframe>`.repeat(50)}</div>`
  const t = Date.now()
  const s = pageSignals(html(Array.from({ length: 300 }, (_, i) => group(i)).join('')), 'https://x.no/', 'x.no')
  assert.ok(Date.now() - t < 1500, `took ${Date.now() - t} ms`)
  assert.equal(s.documents.size, 300)
  assert.equal(s.integrations.length, 20)
})

test('a robots.txt with very many cart rules is read in linear time and gives a short list', () => {
  const t = Date.now()
  const rules = robotsCartRules(Array.from({ length: 40_000 }, (_, i) => `Disallow: /cart${i % 2 ? '' : '/'}${i}`).join('\n'))
  assert.ok(Date.now() - t < 500, `took ${Date.now() - t} ms`)
  assert.equal(rules.length, 20)
})
