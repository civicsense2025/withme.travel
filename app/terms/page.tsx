import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from '@/components/page-header'

export const metadata = {
  title: "Terms of Service | withme.travel",
  description: "Read the terms and conditions for using withme.travel's services.",
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>

      <h1 className="text-5xl leading-loose font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-6">Last updated: April 22, 2023</p>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          Welcome to withme.travel. Please read these Terms of Service carefully before using our platform. By accessing
          or using withme.travel, you agree to be bound by these Terms.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using any part of withme.travel, you agree to these Terms of Service and our Privacy
          Policy. If you do not agree to these Terms, you may not access or use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          withme.travel provides a collaborative travel planning platform that allows users to create, share, and manage
          group trips. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
        </p>

        <h2>3. User Accounts</h2>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and complete information when creating an account</li>
          <li>Notifying us immediately of any unauthorized use of your account</li>
        </ul>

        <h2>4. User Content</h2>
        <p>
          You retain ownership of content you submit to withme.travel. By submitting content, you grant us a worldwide,
          non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and display such content in
          connection with providing and promoting our services.
        </p>
        <p>You agree not to post content that:</p>
        <ul>
          <li>Is illegal, harmful, threatening, abusive, or discriminatory</li>
          <li>Infringes on intellectual property rights</li>
          <li>Contains malware or other harmful code</li>
          <li>Impersonates another person or entity</li>
          <li>Violates the privacy of others</li>
        </ul>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use our services for any illegal purpose</li>
          <li>Interfere with or disrupt our services or servers</li>
          <li>Attempt to gain unauthorized access to any part of our services</li>
          <li>Use automated means to access or collect data from our services</li>
          <li>Use our services to send unsolicited communications</li>
        </ul>

        <h2>6. Third-Party Services</h2>
        <p>
          Our service may contain links to third-party websites or services that are not owned or controlled by
          withme.travel. We have no control over, and assume no responsibility for, the content, privacy policies, or
          practices of any third-party websites or services.
        </p>

        <h2>7. Termination</h2>
        <p>
          We may terminate or suspend your account and access to our services immediately, without prior notice, for
          conduct that we determine violates these Terms or is harmful to other users, us, or third parties, or for any
          other reason at our discretion.
        </p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>
          Our services are provided "as is" and "as available" without warranties of any kind, either express or
          implied. We do not warrant that our services will be uninterrupted, secure, or error-free.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, withme.travel shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or
          indirectly.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We may modify these Terms at any time. We will notify you of material changes by posting the updated Terms on
          our website and updating the "Last updated" date. Your continued use of our services after such modifications
          constitutes your acceptance of the revised Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by the laws of the jurisdiction in which withme.travel is established, without
          regard to its conflict of law provisions.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <a href="mailto:terms@withme.travel" className="text-green-600 hover:underline dark:text-green-400">
            terms@withme.travel
          </a>
          .
        </p>
      </div>
    </div>
  )
}
