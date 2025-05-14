// app/fonts.ts
import localFont from 'next/font/local';

export const helveticaNeue = localFont({
  src: [
    {
      path: '../public/fonts/helvetica-neue/helvetica-neue-light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/helvetica-neue/helvetica-neue-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/helvetica-neue/helvetica-neue-medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/helvetica-neue/helvetica-neue-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-helvetica-neue',
  display: 'swap',
});
