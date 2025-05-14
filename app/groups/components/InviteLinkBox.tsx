'use client';

import React, { useState } from 'react';

interface InviteLinkBoxProps {
  groupId: string;
}

const getInviteLink = (groupId: string): string => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/groups/${groupId}/join`;
  }
  return `https://withme.travel/groups/${groupId}/join`;
};

const InviteLinkBox: React.FC<InviteLinkBoxProps> = ({ groupId }) => {
  const [copied, setCopied] = useState(false);
  const inviteLink = getInviteLink(groupId);
  const message = encodeURIComponent(`Join our group on WithMe.Travel: ${inviteLink}`);
  const isMobile =
    typeof window !== 'undefined' && /Mobi|Android/i.test(window.navigator.userAgent);

  // Analytics stubs
  const track = (method: string) => {
    // TODO: Replace with real analytics
    // e.g. analytics.track('invite_sent', { method, groupId })
    // console.log(`Invite sent via ${method}`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      track('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      alert('Could not copy link. Please copy manually.');
    }
  };

  const handleSMS = () => {
    track('sms');
    window.location.href = `sms:?body=${message}`;
  };

  const handleWhatsApp = () => {
    track('whatsapp');
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener');
  };

  const handleEmail = () => {
    track('email');
    window.location.href = `mailto:?subject=Join our group on WithMe.Travel&body=${message}`;
  };

  const handleInstagram = () => {
    track('instagram');
    if (isMobile) {
      window.location.href = 'instagram://direct-inbox';
    } else {
      alert('Open this page on your phone to DM on Instagram, or copy the link below.');
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 mb-6 flex flex-col gap-3 max-w-xl mx-auto">
      <div className="font-semibold mb-1">Invite friends to this group</div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSMS}
          aria-label="Send invite via text message"
        >
          Text Invite
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleWhatsApp}
          aria-label="Send invite via WhatsApp"
        >
          WhatsApp Invite
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleEmail}
          aria-label="Send invite via email"
        >
          Email Invite
        </button>
        <button
          type="button"
          className="btn btn-accent"
          onClick={handleInstagram}
          aria-label="Send invite via Instagram DM"
        >
          Instagram DM
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          type="text"
          className="input input-bordered flex-1"
          value={inviteLink}
          readOnly
          aria-label="Group invite link"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          className="btn btn-outline"
          onClick={handleCopy}
          aria-label="Copy invite link"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {isMobile
          ? 'Text, WhatsApp, and Instagram will open your messaging app.'
          : 'Open this page on your phone to text, WhatsApp, or DM on Instagram, or copy the link to share.'}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        Instagram does not allow prefilled messages. Paste the invite link in your DM.
      </div>
    </div>
  );
};

export default InviteLinkBox;
