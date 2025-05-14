export const metadata = {
  title: 'Help Us Understand Your Travel Plans',
  description:
    'Share how you currently plan group travel to help us build a better experience for you.',
  appleWebApp: {
    title: 'WithMe User Research',
    statusBarStyle: 'default',
    capable: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-precomposed.png' },
    ],
  },
};

import UserTestingSurveyClient from './page-client';

export default function UserTestingSurveyPage() {
  return <UserTestingSurveyClient />;
}
