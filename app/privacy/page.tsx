import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Privacy Policy | withme.travel",
  description: "Learn how withme.travel collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 22, 2023</p>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          At withme.travel, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you use our service.
        </p>

        <h2>Information We Collect</h2>
        <p>We collect information that you provide directly to us when you:</p>
        <ul>
          <li>Create an account</li>
          <li>Create or participate in trip planning</li>
          <li>Communicate with other users</li>
          <li>Contact our support team</li>
          <li>Respond to surveys or promotions</li>
        </ul>

        <p>This information may include:</p>
        <ul>
          <li>Name, email address, and profile information</li>
          <li>Travel preferences and trip details</li>
          <li>Messages and communications within the platform</li>
          <li>Payment information (processed securely through our payment providers)</li>
          <li>Device information and usage data</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process transactions and send related information</li>
          <li>Send you technical notices, updates, and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Develop new features and services</li>
          <li>Monitor and analyze trends and usage</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
        </ul>

        <h2>Sharing Your Information</h2>
        <p>We may share your information in the following circumstances:</p>
        <ul>
          <li>With other users as part of the collaborative trip planning features</li>
          <li>With service providers who perform services on our behalf</li>
          <li>To comply with legal obligations</li>
          <li>In connection with a business transaction such as a merger or acquisition</li>
          <li>With your consent or at your direction</li>
        </ul>

        <h2>Your Rights and Choices</h2>
        <p>You have several rights regarding your personal information:</p>
        <ul>
          <li>Access and update your account information</li>
          <li>Opt out of marketing communications</li>
          <li>Request deletion of your account and personal information</li>
          <li>Object to certain processing of your information</li>
        </ul>

        <h2>Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our service and hold certain
          information. Cookies help us provide and improve our service, personalize your experience, and understand how
          our service is being used.
        </p>
        <p>
          You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if
          you do not accept cookies, you may not be able to use some portions of our service.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your personal information. However, no method of
          transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute
          security.
        </p>

        <h2>International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than the country in which you reside.
          These countries may have different data protection laws than your country.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our service is not intended for children under 13 years of age, and we do not knowingly collect personal
          information from children under 13.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@withme.travel" className="text-green-600 hover:underline dark:text-green-400">
            privacy@withme.travel
          </a>
          .
        </p>
      </div>
    </div>
  )
}
