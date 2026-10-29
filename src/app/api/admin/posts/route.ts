import { NextResponse } from "next/server";
import { PostStatus } from "@prisma/client";
import {
  prisma,
  slugify,
  requireAdminRequest,
  apiSuccess,
  apiError,
} from "@/lib";

const SEED_NEWS_DATA = [
  {
    title: "IEEE SMC 2027 Announces Plenary Keynote Speakers from Top Global AI Institutions",
    slug: "announces-plenary-keynote-speakers-top-global-ai",
    category: "Keynote",
    summary: "World-renowned pioneers in Cybernetics, Human-Machine Systems, and Autonomous Intelligence will convene in Ho Chi Minh City.",
    content: "<p>The IEEE Systems, Man, and Cybernetics Society (SMC) is proud to unveil the preliminary roster of keynote luminaries for IEEE SMC 2027 in Ho Chi Minh City, Vietnam.</p><p>Keynotes explore foundational breakthroughs in neuro-adaptive robotic systems, ethical agentic AI, cybernetic control loops, and large-scale socio-technical engineering.</p>",
    coverImage: "/news/keynote-hoi-thao.jpg",
    views: 2450,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2027-04-14"),
  },
  {
    title: "Call for Special Sessions & Workshops Proposals Now Open",
    slug: "call-for-special-sessions-workshops-proposals-open",
    category: "Call for Papers",
    summary: "Researchers and industry leaders are invited to organize targeted sessions on cutting-edge systems science topics.",
    content: "<p>IEEE SMC 2027 invites academic researchers, technical working groups, and industrial laboratories to submit proposals for Special Sessions, Tutorials, and Workshops.</p><p>Approved sessions will enjoy featured presentation slots, indexing in IEEE Xplore, and dedicated discussion panels.</p>",
    coverImage: "/news/paper-hcmute.jpg",
    views: 1980,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2027-02-15"),
  },
  {
    title: "Robotics & Autonomous Systems Industrial Partnership Program Launched",
    slug: "robotics-autonomous-systems-industrial-partnership-program",
    category: "Partnership",
    summary: "Leading technology enterprises, robotics developers, and academic institutions are invited to participate as conference partners.",
    content: "<p>IEEE SMC 2027 offers premier exhibition booths, industrial demonstration tracks, and diamond/platinum/gold sponsorship packages at the Sheraton Saigon Grand Opera Hotel in Ho Chi Minh City.</p>",
    coverImage: "/news/giai-nha-robot.jpeg",
    views: 1640,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2027-01-20"),
  },
  {
    title: "HCM-UTE to Host IEEE SMC 2027 – Vietnam's Premier Systems & AI Gathering",
    slug: "hcm-ute-to-host-ieee-smc-2027-vietnam",
    category: "Announcements",
    summary: "HCM-UTE welcomes the international systems, cybernetics, and human-machine systems community to Ho Chi Minh City on October 6–10, 2027.",
    content: "<p>With over six decades of leadership in engineering and technological education, Ho Chi Minh City University of Technology and Engineering (HCM-UTE) is honored to host the flagship annual conference of the IEEE Systems, Man, and Cybernetics Society.</p>",
    coverImage: "/news/vina-ute.png",
    views: 3820,
    status: PostStatus.PUBLISHED,
    publishedAt: new Date("2027-01-04"),
  },
];

async function seedDefaultPosts(authorId?: string) {
  for (const item of SEED_NEWS_DATA) {
    const existing = await prisma.post.findUnique({
      where: { slug: item.slug },
    });
    if (!existing) {
      await prisma.post.create({
        data: {
          ...item,
          authorId: authorId || null,
        },
      });
    }
  }
}

export async function GET() {
  try {
    let posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Auto-seed default conference posts if database is empty
    if (posts.length === 0) {
      await seedDefaultPosts();
      posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ posts });
  } catch (error: unknown) {
    console.error("Error fetching posts:", error);
    return apiError(error, 500);
  }
}

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    // Support explicit re-seed action
    if (body.action === "seed") {
      await seedDefaultPosts(user.id);
      const posts = await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
      });
      return apiSuccess({ posts, message: "Sample conference news seeded successfully!" });
    }

    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      category = "General",
      status = "DRAFT",
    } = body;

    if (!title || !content) {
      return apiError("Post title and content cannot be empty", 400);
    }

    const finalSlug = slugify(slug || title);

    const newPost = await prisma.post.create({
      data: {
        title,
        slug: `${finalSlug}-${Date.now().toString().slice(-4)}`,
        summary: summary || null,
        content,
        coverImage: coverImage || null,
        category,
        status: status === "PUBLISHED" ? PostStatus.PUBLISHED : PostStatus.DRAFT,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
      },
    });

    return apiSuccess({ post: newPost });
  } catch (error: unknown) {
    console.error("Error creating post:", error);
    return apiError(error, 500);
  }
}
