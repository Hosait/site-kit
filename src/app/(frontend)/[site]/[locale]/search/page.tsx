import { searchRoute } from '@/components/search/searchRoute'

// Søket er alltid dynamisk: ingen forhåndsgenerering ved bygging (Hosait bygger uten database).
export const dynamic = 'force-dynamic'

const route = searchRoute('en')
export default route.Page
export const generateMetadata = route.generateMetadata
