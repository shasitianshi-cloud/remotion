import {loadFont} from '@remotion/google-fonts/NotoSansSC';

const loaded = loadFont('normal', {
  weights: ['400', '700', '800'],
  subsets: ['chinese-simplified', 'latin']
});

export const contentFontFamily = loaded.fontFamily;
