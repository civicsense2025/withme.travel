import { useState, useEffect } from 'react';

interface Props {
  url?: string | null;
  width?: number | string;
  height?: number | string;
}

export function PlaylistEmbed({ url, width = 300, height = 150 }: Props) {
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  
  useEffect(() => {
    if (!url) {
      setEmbedHtml(null);
      return;
    }

    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();

      if (host.includes('spotify.com')) {
        // Use Spotify oEmbed endpoint
        fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
          .then((res) => res.json())
          .then((data: { html: string }) => setEmbedHtml(data.html))
          .catch(() => {
            // Fallback manual embed
            const match = u.pathname.match(/playlist\/([a-zA-Z0-9]+)/);
            if (match) {
              setEmbedHtml(
                `<iframe src="https://open.spotify.com/embed/playlist/${match[1]}" ` +
                  `width="${width}" height="${height}" allow="encrypted-media" sandbox="allow-same-origin allow-scripts" ` +
                  `title="Spotify Embed Player"></iframe>`
              );
            }
          });
      } else if (host.includes('tidal.com')) {
        // Manual Tidal embed
        const match = u.pathname.match(/playlist\/([0-9a-fA-F-]+)/);
        if (match) {
          setEmbedHtml(
            `<iframe src="https://embed.tidal.com/playlists/${match[1]}" ` +
              `width="${width}" height="${height}" allow="encrypted-media" sandbox="allow-same-origin allow-scripts allow-forms allow-popups" ` +
              `title="TIDAL Embed Player"></iframe>`
          );
        }
      } else {
        setEmbedHtml(null);
      }
    } catch {
      setEmbedHtml(null);
    }
  }, [url, width, height]);

  if (!embedHtml) return null;
  return <div dangerouslySetInnerHTML={{ __html: embedHtml }} />;
}