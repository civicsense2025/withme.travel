import fs from 'fs';

const filePath = 'app/trips/[tripId]/trip-page-client.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldImport =
  "import { ITINERARY_CATEGORIES, ITEM_STATUSES, type TripRole, type ItemStatus } from '@/utils/constants';";
const newImport =
  "import { ITINERARY_CATEGORIES, ITEM_STATUSES, type TripRole } from '@/utils/constants';";

if (content.includes(oldImport)) {
  content = content.replace(oldImport, newImport);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully fixed imports');
} else {
  console.log('Pattern not found. Current imports:');
  console.log(content.split('\n').slice(80, 86).join('\n'));
}
