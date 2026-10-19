import { Prisma } from "@prisma/client";
import { prisma, requireAdminRequest, apiSuccess, apiError } from "@/lib";

const PROGRAM_SESSIONS_KEY = "program_sessions";

const INITIAL_DB_SESSIONS = [
  {
    id: "s1",
    code: "ThA01",
    title: "Autonomous Robotics & Intelligent Control",
    track: "SSE",
    trackName: "Systems Science & Engineering",
    day: "2027-10-07",
    dayLabel: "Day 1 · Oct 7, 2027",
    timeSlot: "09:00 – 10:30",
    room: "Grand Ballroom A",
    chair: "Prof. Dimitar Filev · IEEE Fellow",
    coChair: "Assoc. Prof. Nguyen Van B · HCMUTE",
    papers: [
      {
        id: "SMC27-101",
        title: "Model Predictive Control for Multi-Agent Autonomous Navigation in GPS-Denied Environments",
        authors: "Alex Chen, Min-Jun Kim, Sarah Connor",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-102",
        title: "Real-Time Trajectory Optimization for Quadruped Robots via Deep Reinforcement Learning",
        authors: "Tran Minh Tri, Hiroshi Tanaka, David Lee",
        time: "09:20 – 09:40",
      },
      {
        id: "SMC27-103",
        title: "Adaptive Sliding Mode Control with Neural Approximators for Underwater Vehicle Thrusters",
        authors: "Elena Rostova, Victor Hugo, Zhang Wei",
        time: "09:40 – 10:00",
      },
    ],
  },
  {
    id: "s2",
    code: "ThA02",
    title: "Deep Learning Foundations & Biomedical Cybernetics",
    track: "CYB",
    trackName: "Cybernetics",
    day: "2027-10-07",
    dayLabel: "Day 1 · Oct 7, 2027",
    timeSlot: "09:00 – 10:30",
    room: "Ballroom B",
    chair: "Prof. Witold Pedrycz · IEEE Life Fellow",
    coChair: "Dr. Pham Thi C · HCMUTE",
    papers: [
      {
        id: "SMC27-201",
        title: "Explainable Fuzzy Cognitive Maps for Personalized Cardiovascular Disease Diagnosis",
        authors: "Michael Zhang, Maria Garcia, Oliver Brown",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-202",
        title: "Multimodal Transformer Fusion for Early Alzheimer Detection via Retinal Imaging",
        authors: "Nguyen Quoc Anh, Sophie Martin, Robert Taylor",
        time: "09:20 – 09:40",
      },
    ],
  },
  {
    id: "s3",
    code: "FrA01",
    title: "Human-Robot Collaborative Manufacturing & Brain-Computer Interfaces",
    track: "HMS",
    trackName: "Human-Machine Systems",
    day: "2027-10-08",
    dayLabel: "Day 2 · Oct 8, 2027",
    timeSlot: "10:45 – 12:15",
    room: "Lotus Hall 1",
    chair: "Prof. Sam Kwong · IEEE Fellow",
    coChair: "Assoc. Prof. Le Hoang D · HCMUTE",
    papers: [
      {
        id: "SMC27-301",
        title: "Shared Autonomy and Intent Prediction for Industrial Exoskeleton Teleoperation",
        authors: "Chen Wei, Hoang Gia Bao, Lukas Weber",
        time: "10:45 – 11:05",
      },
      {
        id: "SMC27-302",
        title: "Cross-Subject Motor Imagery EEG Decoding via Domain-Adversarial Graph Networks",
        authors: "Yuki Takahashi, Lin Mei, Pham Minh Quan",
        time: "11:05 – 11:25",
      },
    ],
  },
  {
    id: "s4",
    code: "SaA01",
    title: "Special Session: Cybernetic Digital Twins for Smart Energy Grids",
    track: "SS",
    trackName: "Special Sessions",
    day: "2027-10-09",
    dayLabel: "Day 3 · Oct 9, 2027",
    timeSlot: "14:00 – 15:30",
    room: "Mekong Conference Suite",
    chair: "Prof. MengChu Zhou · IEEE Fellow",
    coChair: "Dr. Tran Quoc E · HCMUTE",
    papers: [
      {
        id: "SMC27-401",
        title: "Distributed Stochastic Dispatch for Microgrids with High Renewable Penetration",
        authors: "Vo Thanh Tung, Li Na, Marco Rossi",
        time: "14:00 – 14:20",
      },
    ],
  },
];

export async function GET() {
  try {
    let record = await prisma.setting.findUnique({
      where: { key: PROGRAM_SESSIONS_KEY },
    });

    if (!record) {
      record = await prisma.setting.create({
        data: {
          key: PROGRAM_SESSIONS_KEY,
          data: INITIAL_DB_SESSIONS as unknown as Prisma.InputJsonValue,
        },
      });
    }

    const sessions = Array.isArray(record.data) ? record.data : INITIAL_DB_SESSIONS;

    return apiSuccess({
      sessions,
      updatedAt: record.updatedAt,
    });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to load technical sessions from database");
  }
}

export async function PUT(request: Request) {
  const { errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { sessions } = body;

    if (!Array.isArray(sessions)) {
      return apiError("sessions must be a JSON array", 400);
    }

    const updated = await prisma.setting.upsert({
      where: { key: PROGRAM_SESSIONS_KEY },
      update: {
        data: sessions as Prisma.InputJsonValue,
      },
      create: {
        key: PROGRAM_SESSIONS_KEY,
        data: sessions as Prisma.InputJsonValue,
      },
    });

    return apiSuccess({
      sessions: updated.data,
      updatedAt: updated.updatedAt,
    });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to update technical sessions in database");
  }
}
