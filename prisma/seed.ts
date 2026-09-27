import { PrismaClient, Role, PostStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting IEEE SMC 2027 Database Seeding...");

  // 1. Seed Real Admin User requested by user: tctoan1024@gmail.com
  const adminUser = await prisma.user.upsert({
    where: { email: "tctoan1024@gmail.com" },
    update: {
      role: Role.ADMIN,
      name: "Toan Tran",
      updatedAt: new Date(),
    },
    create: {
      id: "usr_tctoan1024",
      email: "tctoan1024@gmail.com",
      name: "Toan Tran",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tctoan",
      role: Role.ADMIN,
      provider: "google",
    },
  });
  console.log(`✅ Seeded Admin User: ${adminUser.email} (${adminUser.role})`);

  // 2. Ensure system backup admin account
  const systemAdmin = await prisma.user.upsert({
    where: { email: "admin@hcmute.edu.vn" },
    update: {
      role: Role.ADMIN,
      updatedAt: new Date(),
    },
    create: {
      id: "usr_hcmute_admin",
      email: "admin@hcmute.edu.vn",
      name: "Ban Quản Trị IEEE SMC 2027",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hcmute",
      role: Role.ADMIN,
      provider: "dev_mock",
    },
  });
  console.log(`✅ Seeded System Admin: ${systemAdmin.email} (${systemAdmin.role})`);

  // 3. Seed Sample Posts for News & Announcements
  const samplePosts = [
    {
      slug: "cfp-announcement-ieee-smc-2027",
      title: "Official Call for Papers (CFP) Released for IEEE SMC 2027",
      summary: "IEEE SMC 2027 invites authors to submit original research papers in Systems Science & Engineering, Human-Machine Systems, and Cybernetics.",
      content: `<h2>Official Call for Papers (CFP) Released for IEEE SMC 2027</h2>
<p>The 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027) will be held at <strong>Sheraton Saigon Grand Opera Hotel</strong>, Ho Chi Minh City, Vietnam, from <strong>October 6–10, 2027</strong>.</p>
<p>Hosted by <em>Ho Chi Minh City University of Technology and Engineering (HCM-UTE)</em>, the flagship conference focuses on the theme <strong>"Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures"</strong>.</p>
<h3>Important Milestones:</h3>
<ul>
  <li>Special Session Proposals: <strong>January 15, 2027</strong></li>
  <li>Regular Paper Submissions: <strong>April 08, 2027</strong></li>
  <li>Acceptance Notification: <strong>May 30, 2027</strong></li>
  <li>Camera-Ready Deadline: <strong>July 15, 2027</strong></li>
</ul>
<p>All accepted papers will be submitted for inclusion into IEEE Xplore subject to meeting IEEE Xplore’s scope and quality requirements.</p>`,
      coverImage: "/carousel/slide-1-conference.webp",
      status: PostStatus.PUBLISHED,
      category: "Announcements",
      publishedAt: new Date("2026-09-01T08:00:00Z"),
      authorId: adminUser.id,
    },
    {
      slug: "special-session-proposals-open",
      title: "Call for Special Session & Workshop Proposals Open",
      summary: "Leading researchers are invited to submit proposals for specialized sessions and workshops addressing cutting-edge cybernetics and human-AI topics.",
      content: `<h2>Special Sessions & Workshop Proposals</h2>
<p>We welcome researchers and industry leaders to organize Special Sessions focusing on specific emerging topics within Systems Science, Cybernetics, and Human-Machine Systems.</p>
<p>Proposals must include the session title, list of organizers with affiliations, aim and scope, and tentative list of invited contributions.</p>`,
      coverImage: "/carousel/slide-2-saigon.webp",
      status: PostStatus.PUBLISHED,
      category: "CFP",
      publishedAt: new Date("2026-09-10T10:00:00Z"),
      authorId: adminUser.id,
    },
    {
      slug: "sheraton-saigon-official-host-venue",
      title: "Sheraton Saigon Grand Opera Hotel Confirmed as Venue",
      summary: "Located in the historic heart of District 1 on Dong Khoi Street, Sheraton Saigon offers 5-star conference facilities for global attendees.",
      content: `<h2>Venue Confirmed: Sheraton Saigon Grand Opera Hotel</h2>
<p>The organizing committee is delighted to confirm <strong>Sheraton Saigon Grand Opera Hotel</strong> as the official venue for IEEE SMC 2027.</p>
<p>Situated in Saigon's vibrant heritage district, the hotel provides world-class grand ballrooms, breakout conference halls, and international culinary hospitality.</p>`,
      coverImage: "/carousel/slide-3-hcmute.webp",
      status: PostStatus.PUBLISHED,
      category: "Venue",
      publishedAt: new Date("2026-09-18T14:30:00Z"),
      authorId: adminUser.id,
    },
  ];

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        content: post.content,
        coverImage: post.coverImage,
        status: post.status,
        category: post.category,
        publishedAt: post.publishedAt,
      },
      create: post,
    });
  }
  console.log(`✅ Seeded ${samplePosts.length} Official Announcements/Posts`);

  // 4. Ensure Committees Page Record exists in website_pages
  await prisma.page.upsert({
    where: { slug: "committees" },
    update: {
      title: "Organizing Committee & Leadership",
      isPublished: true,
      updatedAt: new Date(),
    },
    create: {
      id: "page_committees",
      slug: "committees",
      title: "Organizing Committee & Leadership",
      blocks: [
        {
          id: "committees-section-1",
          type: "CommitteesSection",
          props: {
            title: "Organizing Committee & Leadership",
            subtitle: "International Steering & Local Organizing Committees for IEEE SMC 2027",
            autoplayDuration: 4,
          },
          hidden: false,
        },
      ],
      isPublished: true,
      metaTitle: "Committees | IEEE SMC 2027",
      metaDescription: "Honorary Chairs, General Chairs, Steering Committee and Local Organizing Committee of IEEE SMC 2027.",
    },
  });
  console.log("✅ Seeded Committees Page record");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
