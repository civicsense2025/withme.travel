import SurveyClient from './SurveyClient';

/**
 * Page for displaying a standalone user testing survey
 */
export default function UserTestingSurveyPage() {
  return <SurveyClient />;
}

/**
 * Static metadata for the user testing survey page
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata = {
  title: 'User Research Survey | Group Travel Planning - withme.travel',
  description: 'Help us improve withme.travel by taking our survey',
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
