
export const fallbackLng = 'en';
export const languages = [fallbackLng, 'fr', 'tw'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true, // Set to true to see i18next logs
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
