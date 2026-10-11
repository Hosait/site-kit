import localFont from 'next/font/local'

// The site's typeface, self-hosted so visitors never call Google. next/font needs literal
// options, so a new typeface means editing this file (and adding its @fontsource package).
export const siteFont = localFont({
  src: [{ path: '../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2', weight: '100 1000', style: 'normal' }],
  variable: '--font-site',
  display: 'swap',
})
