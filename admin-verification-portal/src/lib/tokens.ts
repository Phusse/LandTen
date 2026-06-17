// Harbour Design Tokens
export const tokens = {
  colors: {
    bg: '#F2EDE4',
    surface: '#FFFFFF',
    primary: '#1F3B40',
    primarySoft: '#2E5158',
    accent: '#E0922F',
    accentHover: '#CC8224',
    text: '#232323',
    textSecondary: '#6B6B63',
    textTertiary: '#9B958A',
    border: '#DDD5C7',
    success: '#4A7856',
    successBg: '#E3EBE0',
    warning: '#8F5A1F',
    warningBg: '#FBEDD9',
    infoBg: '#E4ECEC',
  },
  fonts: {
    display: '"Zilla Slab", serif',
    body: '"IBM Plex Sans", sans-serif',
  },
  radius: {
    sm: '6px',
    md: '10px', // approximations for JS usage
    lg: '16px',
  }
} as const;
