-- Add attributionHtml column to image_metadata table
ALTER TABLE image_metadata 
ADD COLUMN IF NOT EXISTS attribution_html TEXT;

-- Update the attribution_html column for existing records with Unsplash attribution
UPDATE image_metadata
SET attribution_html = 
  CASE 
    WHEN source = 'unsplash' AND attribution IS NOT NULL THEN
      REGEXP_REPLACE(
        attribution, 
        'Photo by ([^(]+) \(([^)]+)\) on Unsplash \(([^)]+)\)',
        'Photo by <a href="\2" target="_blank" rel="noopener noreferrer">\1</a> on <a href="\3" target="_blank" rel="noopener noreferrer">Unsplash</a>'
      )
    WHEN source = 'pexels' AND attribution IS NOT NULL THEN
      REGEXP_REPLACE(
        attribution,
        'Photo by ([^(]+) on Pexels \(([^)]+)\)',
        'Photo by <a href="\2" target="_blank" rel="noopener noreferrer">\1</a> on <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a>'
      )
    ELSE
      NULL
  END
WHERE attribution IS NOT NULL;

COMMENT ON COLUMN image_metadata.attribution_html IS 'HTML-formatted attribution with clickable links'; 