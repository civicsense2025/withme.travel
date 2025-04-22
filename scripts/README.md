# Destination Image Management Scripts

This directory contains scripts to help manage destination images for the WithMe Travel application.

## Download Destination Images Script

This script downloads images for all destinations in the database and updates the database with the image paths.

### Prerequisites

- Node.js 18+ installed
- Supabase environment variables set up
- `tsx` package installed globally or in your project

### How to Run

1. Make sure your environment variables are set up correctly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Run the script:
   \`\`\`bash
   npm run download-images
   \`\`\`
   or
   \`\`\`bash
   tsx scripts/download-destination-images.tsx
   \`\`\`

### What the Script Does

1. Fetches all destinations from the database
2. For each destination without an image:
   - Uses a predefined mapping for popular destinations
   - For other destinations, generates a filename based on the city and country
   - Downloads an image from Unsplash based on the destination name
   - Saves the image to the public/destinations directory
   - Updates the destination record with the image path

### Customizing Images

To customize the images for specific destinations, edit the `destinationImageMap` object in the `download-destination-images.tsx` file.
\`\`\`

Finally, let's update the package.json to add a script for running the image download:

```typescriptreact file="package.json"
[v0-no-op-code-block-prefix]{
  "name": "group-travel-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "download-images": "tsx scripts/download-destination-images.tsx"
  },
  "dependencies": {
    "@radix-ui/react-avatar": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.6",
    "@radix-ui/react-select": "^1.2.2",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.4",
    "@radix-ui/react-tooltip": "^1.0.6",
    "@supabase/auth-helpers-nextjs": "^0.7.4",
    "@supabase/supabase-js": "^2.32.0",
    "@tiptap/extension-collaboration": "^2.1.12",
    "@tiptap/extension-collaboration-cursor": "^2.1.12",
    "@tiptap/pm": "^2.1.12",
    "@tiptap/react": "^2.1.12",
    "@tiptap/starter-kit": "^2.1.12",
    "@types/node": "20.5.0",
    "@types/react": "18.2.20",
    "@types/react-dom": "18.2.7",
    "autoprefixer": "10.4.15",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "eslint": "8.47.0",
    "eslint-config-next": "13.4.18",
    "lucide-react": "^0.268.0",
    "next": "13.4.18",
    "next-themes": "^0.2.1",
    "postcss": "8.4.28",
    "react": "18.2.0",
    "react-day-picker": "^8.8.0",
    "react-dom": "18.2.0",
    "tailwind-merge": "^1.14.0",
    "tailwindcss": "3.3.3",
    "tailwindcss-animate": "^1.0.6",
    "typescript": "5.1.6",
    "y-webrtc": "^10.2.5",
    "yjs": "^13.6.8",
    "zod": "^3.22.2"
  }
}
