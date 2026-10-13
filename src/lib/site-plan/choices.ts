import { LOCALES, SITE_CONFIG } from '../sites'

/** The values Payload stores as selects, so a plan can only use what the site offers. */
export const PLAN_CHOICES = {
  articleKind: Object.keys(SITE_CONFIG.articleKinds),
  documentType: Object.keys(SITE_CONFIG.documentTypes),
  documentLanguage: [...LOCALES, 'multi'],
}
