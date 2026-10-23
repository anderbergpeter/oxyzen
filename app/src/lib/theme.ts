import { Platform } from 'react-native';

// Varm spa-palett: sand, kalksten och valnöt.
export const colors = {
  bg: '#F3EDE4',
  card: '#FCF9F4',
  border: '#E6DDD0',
  text: '#2B2420',
  textSecondary: '#6F635A',
  textMuted: '#9A8E83',

  // Primär accent: valnöt
  teal: '#6B4A33',
  tealDark: '#4E3424',
  tealDarker: '#33211A',
  tealLight: '#EFE6DC',
  tealMid: '#C9AE95',

  // Sekundär varm: terrakotta (maskpaus, varningar)
  amber: '#B5603A',
  amberLight: '#F6E3D8',
  amberMid: '#E3A98C',
  amberText: '#8F4A2A',
  amberDark: '#6E3A20',

  // Lugn grön för information
  blue: '#5C7A5E',
  blueLight: '#E6EDE3',
  blueMid: '#B9CDB6',
  blueDark: '#2F4631',

  red: '#A33A2E',
  redLight: '#F8E4E0',

  gray: '#D6CCBF',
  grayLight: '#EDE6DB',
  grayText: '#4A423B',
  segmentBg: '#E8E0D4',
  wood: '#A8784A',
  brass: '#B3A078',
};

export const fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' }),
  logo: 'Jost_300Light',
  logoSub: 'Jost_400Regular',
};

export const radius = { sm: 12, md: 18, lg: 24, xl: 28 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
