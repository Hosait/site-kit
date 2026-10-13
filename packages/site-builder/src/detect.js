// What a page loads, by pattern. Used for the consent questions and the report. Embeds are
// recognised in an iframe tag and a CMS also by its generator meta tag: those tags are found in
// one pass, each read up to its > (or the end of the page), and checked one by one, so every
// check takes linear time.
const TRACKERS = [
  ['Google Tag Manager', /googletagmanager\.com\/(gtm\.js|ns\.html)/i],
  ['Google Analytics', /google-analytics\.com\/|googletagmanager\.com\/gtag\/js/i],
  ['Meta Pixel', /connect\.facebook\.net\/[^"']{0,200}fbevents\.js/i],
  ['LinkedIn Insight', /snap\.licdn\.com\/li\.lms-analytics/i],
  ['Hotjar', /static\.hotjar\.com/i],
  ['HubSpot', /js\.hs-scripts\.com|js\.hs-analytics\.net/i],
  ['Matomo', /\/matomo\.js|\/piwik\.js/i],
  ['Plausible', /plausible\.io\/js/i],
  ['Fathom', /cdn\.usefathom\.com/i],
  ['Microsoft Clarity', /clarity\.ms\/tag/i],
]
// [name, in the page, in an iframe tag, after "generator" in a meta tag]
const EMBEDS = [
  ['YouTube', null, /(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i],
  ['Vimeo', null, /player\.vimeo\.com/i],
  ['Google Maps', null, /google\.[a-z.]{1,24}\/maps/i],
  ['Intercom', /widget\.intercom\.io/i],
  ['HubSpot forms', /js\.hsforms\.net|hbspt\.forms/i],
  ['Typeform', /embed\.typeform\.com/i],
  ['Calendly', /assets\.calendly\.com/i],
]
const CMS = [
  ['WordPress', /\/wp-content\//i, null, 'wordpress'],
  ['Prismic', /images\.prismic\.io|cdn\.prismic\.io|\.prismic\.io\/api/i],
  ['Gatsby', /id="___gatsby"/i],
  ['Next.js', /id="__NEXT_DATA__"|\/_next\/static\//i],
  ['Craft CMS', /\/cpresources\//i, null, 'craft cms'],
  ['Drupal', /\/sites\/default\/files\//i, null, 'drupal'],
  ['Umbraco', /\/umbraco\//i, null, 'umbraco'],
  ['Optimizely (Episerver)', /\/episerver\/|EPiServer/i],
  ['Squarespace', /static1\.squarespace\.com/i],
  ['Wix', /static\.wixstatic\.com/i],
  ['Webflow', /assets\.website-files\.com|data-wf-site/i],
  ['Shopify', /cdn\.shopify\.com/i],
]

/** The page's iframe and meta tags, from < up to > (or the end of the page). */
function tags(html) {
  const found = { iframe: [], meta: [] }
  for (const m of html.matchAll(/<(iframe|meta)\b[^>]*/gi)) found[m[1].toLowerCase()].push(m[0])
  return found
}

/** What follows "generator" in each meta tag that has it, in lower case. */
const generators = (metas) => metas.map((t) => t.toLowerCase()).filter((t) => t.includes('generator')).map((t) => t.slice(t.indexOf('generator') + 9))

function names(table, html) {
  const { iframe, meta } = tags(html)
  const gens = generators(meta)
  return table
    .filter(([, page, inIframe, generator]) => page?.test(html) || (inIframe && iframe.some((t) => inIframe.test(t))) || (generator && gens.some((g) => g.includes(generator))))
    .map(([n]) => n)
}

export const detect = {
  /** @param {string} html */ trackers: (html) => names(TRACKERS, html),
  /** @param {string} html */ embeds: (html) => names(EMBEDS, html),
  /** @param {string} html */ cms: (html) => names(CMS, html),
}
