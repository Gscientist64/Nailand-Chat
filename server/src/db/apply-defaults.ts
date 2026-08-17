// One-off script: apply the NaiLAND default regions & communities to an
// existing database WITHOUT deleting anything. Run: npm run db:defaults
import 'dotenv/config';
import { ensureDefaultCommunities } from './defaults.js';

async function main() {
  console.log('🌱 Applying NaiLAND default regions & communities...\n');
  await ensureDefaultCommunities();
  console.log('\n✅ Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
