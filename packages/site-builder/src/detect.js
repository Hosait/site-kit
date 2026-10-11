// What a page loads, by pattern. Used for the consent questions and the report.
const TRACKERS = [
  ['Google Tag Manager', /googletagmanager\.com\/(gtm\.js|ns\.html)/i],
  ['Google Analytics', /google-analytics\.com\/|googletagmanager\.com\/gtag\/js/i],
  ['Meta Pixel', /connect\.facebook\.net\/[^"']*fbevents\.js/i],
  ['LinkedIn Insight', /snap\.licdn\.com\/li\.lms-analytics/i],
  ['Hotjar', /static\.hotjar\.com/i],
  ['HubSpot', /js\.hs-scripts\.com|js\.hs-analytics\.net/i],
  ['Matomo', /\/matomo\.js|\/piwik\.js/i],
  ['Plausible', /plausible\.io\/js/i],
  ['Fathom', /cdn\.usefathom\.com/i],
  ['Microsoft Clarity', /clarity\.ms\/tag/i],
]
const EMBEDS = [
  ['YouTube', /<iframe[^>]+(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i],
  ['Vimeo', /<iframe[^>]+player\.vimeo\.com/i],
  ['Google Maps', /<iframe[^>]+google\.[a-z.]+\/maps/i],
  ['Intercom', /widget\.intercom\.io/i],
  ['HubSpot forms', /js\.hsforms\.net|hbspt\.forms/i],
  ['Typeform', /embed\.typeform\.com/i],
  ['Calendly', /assets\.calendly\.com/i],
]
const CMS = [
  ['WordPress', /\/wp-content\/|<meta[^>]+generator[^>]+WordPress/i],
  ['Prismic', /images\.prismic\.io|cdn\.prismic\.io|\.prismic\.io\/api/i],
  ['Gatsby', /id="___gatsby"/i],
  ['Next.js', /id="__NEXT_DATA__"|\/_next\/static\//i],
  ['Craft CMS', /<meta[^>]+generator[^>]+Craft CMS|\/cpresources\//i],
  ['Drupal', /<meta[^>]+generator[^>]+Drupal|\/sites\/default\/files\//i],
  ['Umbraco', /<meta[^>]+generator[^>]+Umbraco|\/umbraco\//i],
  ['Optimizely (Episerver)', /\/episerver\/|EPiServer/i],
  ['Squarespace', /static1\.squarespace\.com/i],
  ['Wix', /static\.wixstatic\.com/i],
  ['Webflow', /assets\.website-files\.com|data-wf-site/i],
  ['Shopify', /cdn\.shopify\.com/i],
]
const names = (table, html) => table.filter(([, re]) => re.test(html)).map(([n]) => n)

export const detect = {
  /** @param {string} html */ trackers: (html) => names(TRACKERS, html),
  /** @param {string} html */ embeds: (html) => names(EMBEDS, html),
  /** @param {string} html */ cms: (html) => names(CMS, html),
}
