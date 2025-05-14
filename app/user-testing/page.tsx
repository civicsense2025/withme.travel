export const metadata = {
  title: 'Join WithMe User Research Beta',
  description:
    'Sign up for the withme.travel user research beta and help shape the future of group travel planning.',
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

import UserTestingClient from './page-client';

export default function UserTestingPage() {
  return <UserTestingClient />;
}
