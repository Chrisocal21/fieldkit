/**
 * Clerk theme for the sign-in and sign-up pages, matched to the landing page
 * (black, zinc, white primary button). Passed as plain values because Clerk
 * derives its own shades from them.
 */
export const authAppearance = {
  variables: {
    colorPrimary: '#fafafa',
    colorTextOnPrimaryBackground: '#09090b',
    colorBackground: '#09090b',
    colorText: '#fafafa',
    colorTextSecondary: '#a1a1aa',
    colorInputBackground: '#000000',
    colorInputText: '#fafafa',
    colorNeutral: '#ffffff',
    colorDanger: '#f87171',
    colorSuccess: '#34d399',
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    rootBox: { width: '100%' },
    cardBox: {
      width: '100%',
      maxWidth: '26rem',
      boxShadow: 'none',
      border: '1px solid #27272a',
      borderRadius: '1rem',
    },
    card: { boxShadow: 'none' },
    headerTitle: {
      fontFamily: 'var(--font-sora), var(--font-inter), ui-sans-serif, system-ui, sans-serif',
      fontSize: '1.25rem',
      letterSpacing: '-0.02em',
    },
    formButtonPrimary: {
      fontWeight: 600,
      boxShadow: 'none',
      '&:hover': { backgroundColor: '#e4e4e7' },
    },
    footerActionLink: { color: '#22d3ee', '&:hover': { color: '#67e8f9' } },
  },
}
