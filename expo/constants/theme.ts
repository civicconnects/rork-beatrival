export const theme = {
  colors: {
    primary: '#FF006E',
    secondary: '#8338EC',
    accent: '#FB5607',
    success: '#06FFB4',
    warning: '#FFBE0B',
    error: '#FF4365',
    
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#252525',
    
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    
    border: '#333333',
    
    gradients: {
      primary: ['#FF006E', '#8338EC'] as const,
      fire: ['#FB5607', '#FF006E'] as const,
      electric: ['#8338EC', '#3A86FF'] as const,
      neon: ['#06FFB4', '#FFBE0B'] as const,
      surface: ['#1A1A1A', '#252525'] as const,
    }
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '800' as const,
      letterSpacing: -1,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
    }
  }
};