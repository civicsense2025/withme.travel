import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

// --- Argument Parsing ---
const args = process.argv.slice(2); // Skip node executable and script path
let pattern: string | null = null;

const patternFlagIndex = args.indexOf('--pattern');
if (patternFlagIndex !== -1 && args.length > patternFlagIndex + 1) {
  pattern = args[patternFlagIndex + 1];
} else {
  console.error(chalk.red('Error: --pattern flag with a search string is required.'));
  console.log(
    chalk.yellow('Example: npx tsx scripts/clear-specific-images.ts --pattern "1460317442991"')
  );
  process.exit(1);
}

console.log(
  chalk.blue(`Searching for destinations with image_url containing pattern: "${pattern}``)
);
// --- End Argument Parsing ---

// --- Supabase Client Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key is missing in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
// --- End Supabase Client Setup ---

async function clearImagesByPattern(searchPattern: string) {
  try {
    console.log('Fetching destinations matching pattern...');
    const { data: destinations, error } = await supabase
      .from('destinations')
      .select('id, city, country, state_province, image_url') // Select only needed fields
      .like('image_url', `%${searchPattern}%`); // Use like for contains search

    if (error) {
      console.error(chalk.red('Error fetching destinations:'), error);
      throw error;
    }
    if (!destinations || destinations.length === 0) {
      console.log(chalk.yellow('No destinations found with image_url containing the pattern.'));
      return;
    }

    console.log(chalk.cyan(`Found ${destinations.length} destinations to clear.`));

    for (const destination of destinations) {
      const locationString = `${destination.city}${destination.state_province ? `, ` + destination.state_province : ''}${destination.country ? ', ' + destination.country : ''}`;
      console.log(`Clearing image data for: ${locationString} (ID: ${destination.id})`);
      console.log(chalk.dim(`  Current URL: ${destination.image_url}`));

      try {
        const { error: updateError } = await supabase
          .from('destinations')
          .update({
            image_url: null, // Set image_url to null
            image_metadata: null, // Set image_metadata to null
          })
          .eq('id', destination.id);

        if (updateError) {
          console.error(
            chalk.red(`  Failed to clear data for ${locationString}:`),
            updateError.message
          );
          // Optionally continue to next destination or stop script
        } else {
          console.log(chalk.green(`  Successfully cleared data for ${locationString}.`));
        }
      } catch (updateErr) {
        console.error(chalk.red(`  Unexpected error updating ${locationString}:`), updateErr);
      }
      // Add a small delay between updates to be nice to the DB
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(chalk.magenta('Finished clearing specific destination images.'));
  } catch (err) {
    const error = err as Error;
    console.error(chalk.red('Fatal error during script execution:'), error.message);
    process.exitCode = 1;
  }
}

// Run the clear function
clearImagesByPattern(pattern!).catch(console.error);
