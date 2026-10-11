import { searchRoute } from '@/components/search/searchRoute'

// Søket er alltid dynamisk: ingen forhåndsgenerering ved bygging (Hosait bygger uten database).
export const dynamic = 'force-dynamic'

// /no/sok, /en/search … are rewritten here by src/proxy.ts (segments come from site/config.ts).
const route = searchRoute()
export default route.Page
export const generateMetadata = route.generateMetadata
