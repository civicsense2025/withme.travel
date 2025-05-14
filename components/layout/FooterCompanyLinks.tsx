import Link from 'next/link';
import React from 'react';

interface FooterCompanyLinksProps {
  isAdmin?: boolean;
}

export function FooterCompanyLinks({ isAdmin }: FooterCompanyLinksProps) {
  const companyLinks = [
    { href: '/support', label: 'Support Us' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ];
  if (isAdmin) {
    companyLinks.push({ href: '/admin', label: 'Admin' });
  }
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium">Company</h3>
      <ul className="space-y-2">
        {companyLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
