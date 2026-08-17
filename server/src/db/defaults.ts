import { and, eq, count } from 'drizzle-orm';
import { db } from './index.js';
import { users, communities, communityMembers, chatThreads, threadParticipants, feedPosts, collabOffers, skillRequests } from './schema.js';

// ============================================================
// NaiLAND DEFAULT REGIONS & COMMUNITIES (owner spec: V1)
// Seven regions: Creative, Wellness, Business, Politics,
// Economics, Tech, Sciences. Plus the global/cross-region spaces.
// ============================================================

export const NAILAND_REGIONS = ['Creative', 'Wellness', 'Business', 'Politics', 'Economics', 'Tech', 'Sciences'];

// Global (cross-region) default communities
export const DEFAULT_GLOBAL_COMMUNITIES = [
  {
    name: 'Sojourners\' Camp',
    description: 'The universal starting community for every new NaiLAND member. Get welcomed, orientated and connected with the wider community. NaiLAND announcements, new-user interaction and community challenges live here.',
    avatar: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=120',
    tags: ['Welcome', 'Orientation', 'Announcements', 'New Users', 'Global'],
    region: '',
  },
  {
    name: 'NaiLAND Commons',
    description: 'The cross-region social space of NaiLAND. General conversations, ideas, announcements and interaction between every region.',
    avatar: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=120',
    tags: ['General', 'Ideas', 'Announcements', 'Global', 'Social'],
    region: '',
  },
  {
    name: 'Collaboration Ground',
    description: 'A dedicated place for people looking to build together. "I have an idea for an education app — I need a developer and a designer." Post it here and find your team.',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=120',
    tags: ['Collaboration', 'Projects', 'Team Up', 'Global', 'Building'],
    region: '',
  },
];

// Starter content definitions per default community (real, non-fake material to respond to)
type StarterContent = {
  communityName: string;
  welcomePost: string;
  collabOffer: { title: string; description: string; roles: string[]; monetary: string; skillExchange: string };
  skillRequest: { title: string; description: string; roles: string[]; monetary: string; projectLength: string };
};

export const DEFAULT_STARTER_CONTENT: StarterContent[] = [
  {
    communityName: 'Sojourners\' Camp',
    welcomePost: 'Welcome to Sojourners\' Camp — the starting point for every NaiLAND journey. 👋 Tell us who you are, what you love building and which region drew you in. Your journey starts here: Explore → Connect → Contribute → Collaborate → Build → Grow.',
    collabOffer: { title: 'NaiLAND Welcome Crew', description: 'Help new members feel at home: onboarding guides, welcome threads and community challenges.', roles: ['Community Manager', 'Writer'], monetary: 'Skill exchange', skillExchange: 'Publicity + early feature access' },
    skillRequest: { title: 'Orientation helpers wanted', description: 'Help shape the new-member orientation flow — what should a first-time Sojourner see?', roles: ['Researcher', 'Designer'], monetary: 'Recognition + points', projectLength: '2 weeks' },
  },
  {
    communityName: 'NaiLAND Commons',
    welcomePost: 'Welcome to NaiLAND Commons — the cross-region social space. 🏛️ This is where every region overlaps: general conversations, big ideas and announcements. What are you thinking about this week?',
    collabOffer: { title: 'Commons Weekly Digest', description: 'A weekly recap of the best ideas and announcements from across all seven regions.', roles: ['Editor', 'Curator'], monetary: 'Skill exchange', skillExchange: 'Credits on every edition' },
    skillRequest: { title: 'Idea stage collaborator', description: 'I have a concept for a cross-region community event. Need help structuring it into a plan.', roles: ['Project Planner'], monetary: 'Skill exchange', projectLength: '1 month' },
  },
  {
    communityName: 'Collaboration Ground',
    welcomePost: 'Welcome to Collaboration Ground — where builders find each other. 🛠️ Post what you want to build, the skills you need, and the skills you can offer. "I have an idea + I need a developer and designer" starts here.',
    collabOffer: { title: 'Education App MVP', description: 'I have an idea for an education app. I need a developer and a designer to build the MVP together.', roles: ['React Developer', 'UI/UX Designer'], monetary: 'Equity split', skillExchange: 'Equal collaboration' },
    skillRequest: { title: 'Solidity developer for Web3 bridge', description: 'Looking for a Solidity dev to help prototype a Web2×Web3 bridge concept.', roles: ['Solidity Developer'], monetary: 'Skill exchange', projectLength: '6 weeks' },
  },
];

// Find the Sojourners' Camp community id (or create it) and auto-join a user
export async function findSojournersCamp(): Promise<string | null> {
  const [camp] = await db
    .select({ id: communities.id })
    .from(communities)
    .where(eq(communities.name, 'Sojourners\' Camp'))
    .limit(1);
  return camp?.id ?? null;
}

export async function autoJoinCommunity(userId: string, communityId: string) {
  const [existing] = await db
    .select()
    .from(communityMembers)
    .where(and(eq(communityMembers.communityId, communityId), eq(communityMembers.userId, userId)))
    .limit(1);
  if (existing) return;

  await db.insert(communityMembers).values({ communityId, userId, role: 'member' });

  // Recompute the real member count (role = member only)
  const [{ value }] = await db
    .select({ value: count() })
    .from(communityMembers)
    .where(eq(communityMembers.communityId, communityId));
  await db.update(communities).set({ memberCount: Number(value) }).where(eq(communities.id, communityId));

  // Add to the community chat thread
  const [thread] = await db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.communityId, communityId))
    .limit(1);
  if (thread) {
    const [alreadyInThread] = await db
      .select()
      .from(threadParticipants)
      .where(and(eq(threadParticipants.threadId, thread.id), eq(threadParticipants.userId, userId)))
      .limit(1);
    if (!alreadyInThread) {
      await db.insert(threadParticipants).values({ threadId: thread.id, userId });
    }
  }
}

// Ensure all default communities + starter content exist (idempotent)
export async function ensureDefaultCommunities(authorId?: string) {
  // Resolve an author for starter content (fall back to any user)
  let author = authorId;
  if (!author) {
    const [anyUser] = await db.select({ id: users.id }).from(users).limit(1);
    author = anyUser?.id;
  }
  if (!author) {
    console.log('  ⚠️  No users exist yet — skipping default content');
  }

  // 1. Rename / re-region the Web3 flagship to match the spec's Technology community
  const [web3] = await db.select().from(communities).where(eq(communities.name, 'Web3 Builders')).limit(1);
  if (web3) {
    await db
      .update(communities)
      .set({ name: 'Web2 × Web3 Builders', region: 'Tech' })
      .where(eq(communities.id, web3.id));
    console.log('  ✓ Renamed Web3 Builders → Web2 × Web3 Builders (Tech)');
  }

  // 2. Tag existing seeded communities with their regions
  const regionMap: Record<string, string> = {
    'Figma Buddies': 'Creative',
    'UIUX Coven': 'Creative',
    'Adobe Expert': 'Creative',
    'Code Collab': 'Tech',
  };
  for (const [name, region] of Object.entries(regionMap)) {
    await db
      .update(communities)
      .set({ region })
      .where(and(eq(communities.name, name), eq(communities.region, '')));
  }

  // 3. Insert the global communities if missing + ensure each has a chat thread
  for (const c of DEFAULT_GLOBAL_COMMUNITIES) {
    let [community] = await db.select().from(communities).where(eq(communities.name, c.name)).limit(1);
    if (!community) {
      const [created] = await db
        .insert(communities)
        .values({ ...c, createdBy: author ?? undefined })
        .returning();
      community = created;
      console.log(`  ✓ Created community: ${c.name}`);
    }

    // Ensure a community chat thread exists
    const [thread] = await db.select().from(chatThreads).where(eq(chatThreads.communityId, community.id)).limit(1);
    if (!thread) {
      await db.insert(chatThreads).values({
        name: community.name,
        avatar: community.avatar,
        category: 'community',
        isCommunity: true,
        communityId: community.id,
        createdBy: author ?? undefined,
      });
    }
  }

  // 4. Auto-join every existing user to Sojourners' Camp
  const campId = await findSojournersCamp();
  if (campId) {
    const allUsers = await db.select({ id: users.id }).from(users);
    for (const u of allUsers) {
      await autoJoinCommunity(u.id, campId);
    }
    console.log(`  ✓ Auto-joined ${allUsers.length} user(s) to Sojourners' Camp`);
  }

  // 5. Seed starter content for each default community (only if community has no posts)
  if (author) {
    for (const sc of DEFAULT_STARTER_CONTENT) {
      const [com] = await db.select().from(communities).where(eq(communities.name, sc.communityName)).limit(1);
      if (!com) continue;

      const [existingPost] = await db.select().from(feedPosts).where(eq(feedPosts.communityId, com.id)).limit(1);
      if (existingPost) continue;

      await db.insert(feedPosts).values({
        communityId: com.id,
        authorId: author,
        content: sc.welcomePost,
        attachmentTypes: [],
        images: [],
      });

      await db.insert(collabOffers).values({
        title: sc.collabOffer.title,
        description: sc.collabOffer.description,
        roles: sc.collabOffer.roles,
        monetary: sc.collabOffer.monetary,
        skillExchange: sc.collabOffer.skillExchange,
        creatorId: author,
      });

      await db.insert(skillRequests).values({
        title: sc.skillRequest.title,
        description: sc.skillRequest.description,
        roles: sc.skillRequest.roles,
        monetary: sc.skillRequest.monetary,
        projectLength: sc.skillRequest.projectLength,
        creatorId: author,
      });

      console.log(`  ✓ Seeded starter content for ${sc.communityName}`);
    }
  }

  // 6. Recompute member counts for all communities (role = member only)
  const allComms = await db.select({ id: communities.id }).from(communities);
  for (const com of allComms) {
    const [{ value }] = await db
      .select({ value: count() })
      .from(communityMembers)
      .where(eq(communityMembers.communityId, com.id));
    await db.update(communities).set({ memberCount: Number(value) }).where(eq(communities.id, com.id));
  }

  console.log('  ✓ Default regions & communities ensured');
}
