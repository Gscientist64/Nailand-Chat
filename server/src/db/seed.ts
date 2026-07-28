import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from './index.js';
import { users, communities, communityMembers, chatThreads, threadParticipants, chatMessages } from './schema.js';

async function seed() {
  console.log('🌱 Seeding NaiLand database...\n');

  // ============================================================
  // 1. Create sample users
  // ============================================================
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('Test1234!', salt);

  const sampleUsers = [
    {
      email: 'john.doe@nailand.com',
      passwordHash,
      firstName: 'John',
      secondName: 'Doe',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120',
      interests: ['Figma', 'UI/UX', 'Mobile Product Design'],
      region: 'Africa',
      emailVerified: true,
    },
    {
      email: 'afolabi@nailand.com',
      passwordHash,
      firstName: 'Afolabi',
      secondName: 'Emmanuel',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120',
      interests: ['Web Design', 'Backend Engineering', 'Figma'],
      region: 'Africa',
      emailVerified: true,
    },
    {
      email: 'lola@nailand.com',
      passwordHash,
      firstName: 'Lola',
      secondName: 'Adebinpe',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120',
      interests: ['React', 'Frontend', 'UI Design'],
      region: 'Africa',
      emailVerified: true,
    },
    {
      email: 'tomiwa@nailand.com',
      passwordHash,
      firstName: 'Tomiwa',
      secondName: 'Adebayo',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120',
      interests: ['Mobile Dev', 'Flutter', 'React Native'],
      region: 'Africa',
      emailVerified: true,
    },
  ];

  const createdUsers = [];
  for (const userData of sampleUsers) {
    const [user] = await db.insert(users).values(userData).returning();
    createdUsers.push(user);
    console.log(`  ✓ User: ${user.firstName} ${user.secondName} (${user.email})`);
  }

  // ============================================================
  // 2. Create communities
  // ============================================================
  const communityData = [
    {
      name: 'Figma Buddies',
      description: 'Figma Buddies is a group of designers who come together to learn, collaborate and share skills. We focus on design tokens, UX guides, and collaborative prototyping.',
      avatar: 'https://images.unsplash.com/photo-1628005182384-a83a8bd57fbe?q=80&w=120',
      tags: ['Design', 'Figma', 'UI/UX', 'Prototyping'],
      createdBy: createdUsers[0].id,
    },
    {
      name: 'UIUX Coven',
      description: 'Advanced wireframing labs and design systems exploration. For experienced designers pushing the boundaries of user experience.',
      avatar: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=120',
      tags: ['UI/UX', 'Wireframing', 'Design Systems'],
      createdBy: createdUsers[1].id,
    },
    {
      name: 'Adobe Expert',
      description: 'Chroma & layout experts. Master Adobe Creative Suite — Photoshop, Illustrator, XD, and After Effects for professional design work.',
      avatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=120',
      tags: ['Adobe', 'Photoshop', 'Illustrator', 'Design'],
      createdBy: createdUsers[2].id,
    },
    {
      name: 'Web3 Builders',
      description: 'Build the decentralized future. Smart contracts, dApps, and blockchain infrastructure for Web3 developers.',
      avatar: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=120',
      tags: ['Web3', 'Blockchain', 'Solidity', 'dApps'],
      createdBy: createdUsers[3].id,
    },
    {
      name: 'Code Collab',
      description: 'Peer programming and code review community. Share knowledge on React, Node.js, TypeScript, and modern web development.',
      avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=120',
      tags: ['Coding', 'React', 'Node.js', 'TypeScript'],
      createdBy: createdUsers[0].id,
    },
  ];

  const createdCommunities = [];
  for (const comData of communityData) {
    const [community] = await db.insert(communities).values(comData).returning();
    createdCommunities.push(community);

    // Add creator as admin
    await db.insert(communityMembers).values({
      communityId: community.id,
      userId: comData.createdBy,
      role: 'admin',
      rating: 5,
    });

    console.log(`  ✓ Community: ${community.name}`);
  }

  // Add more members to communities
  for (let i = 0; i < createdCommunities.length; i++) {
    for (let j = 0; j < createdUsers.length; j++) {
      if (createdUsers[j].id !== createdCommunities[i].createdBy) {
        await db.insert(communityMembers).values({
          communityId: createdCommunities[i].id,
          userId: createdUsers[j].id,
          role: 'member',
          rating: Math.floor(Math.random() * 3) + 3,
        });
      }
    }
  }

  // Update member counts
  for (const com of createdCommunities) {
    await db
      .update(communities)
      .set({ memberCount: createdUsers.length })
      .where(eq(communities.id, com.id));
  }

  // ============================================================
  // 3. Create chat threads with messages
  // ============================================================
  // Direct chat between user 0 and user 1
  const [directThread] = await db.insert(chatThreads).values({
    name: `${createdUsers[1].firstName} ${createdUsers[1].secondName}`,
    avatar: createdUsers[1].avatarUrl,
    category: 'chat',
    lastMessage: 'Awesome workspace! Let us review the database schema tonight.',
    timeString: '14:20',
    createdBy: createdUsers[0].id,
  }).returning();

  await db.insert(threadParticipants).values([
    { threadId: directThread.id, userId: createdUsers[0].id },
    { threadId: directThread.id, userId: createdUsers[1].id },
  ]);

  const directMessages = [
    { threadId: directThread.id, senderId: createdUsers[1].id, content: "Hello! I am excited to kickstart this mock collaboration on Nailand workspace." },
    { threadId: directThread.id, senderId: createdUsers[0].id, content: "Same here! The Web3 peer design looks highly accurate and responsive." },
    { threadId: directThread.id, senderId: createdUsers[1].id, content: "Awesome workspace! Let us review the database schema tonight." },
  ];

  for (const msg of directMessages) {
    await db.insert(chatMessages).values(msg);
  }

  // Community threads
  for (const com of createdCommunities) {
    const [thread] = await db.insert(chatThreads).values({
      name: com.name,
      avatar: com.avatar,
      category: 'community',
      isCommunity: true,
      communityId: com.id,
      lastMessage: `Welcome to ${com.name}!`,
      timeString: 'Active',
      createdBy: com.createdBy,
    }).returning();

    for (const user of createdUsers) {
      await db.insert(threadParticipants).values({
        threadId: thread.id,
        userId: user.id,
      });
    }
  }

  console.log('\n✅ Seeding complete!');
  console.log(`   ${createdUsers.length} users`);
  console.log(`   ${createdCommunities.length} communities`);
  console.log(`   ${directMessages.length} sample messages`);
  console.log('\n   Test login credentials:');
  console.log('   Email: john.doe@nailand.com');
  console.log('   Password: Test1234!\n');
  process.exit(0);
}

// Need to import eq for the update
import { eq } from 'drizzle-orm';

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
