"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

interface PaperItem {
  id: string;
  title: string;
  authors: string;
  time: string;
}

interface SessionItem {
  id: string;
  code: string;
  title: string;
  track: "SSE" | "CYB" | "HMS" | "SS" | "WS";
  trackName: string;
  day: string;
  dayLabel: string;
  timeSlot: string;
  room: string;
  chair: string;
  coChair?: string;
  papers: PaperItem[];
}

const SESSIONS_DATA: SessionItem[] = [
  // Day 1 - Morning
  {
    id: "s1",
    code: "ThA01",
    title: "Autonomous Robotics & Intelligent Control",
    track: "SSE",
    trackName: "Systems Science & Engineering",
    day: "2027-10-07",
    dayLabel: "Day 1 (Thu, Oct 7)",
    timeSlot: "09:00 – 10:30",
    room: "Grand Ballroom A",
    chair: "Prof. Dimitar Filev (Ford Motor / IEEE Fellow)",
    coChair: "Assoc. Prof. Nguyen Van B (HCMUTE)",
    papers: [
      {
        id: "SMC27-101",
        title: "Model Predictive Control for Multi-Agent Autonomous Navigation in Dense GPS-Denied Environments",
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
      {
        id: "SMC27-104",
        title: "Decentralized Collision Avoidance Protocol for Autonomous Swarm Delivery Systems",
        authors: "Le Hoang Nam, Kenji Sato, Alice Wong",
        time: "10:00 – 10:20",
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
    dayLabel: "Day 1 (Thu, Oct 7)",
    timeSlot: "09:00 – 10:30",
    room: "Ballroom B",
    chair: "Prof. Witold Pedrycz (Univ. of Alberta / IEEE Life Fellow)",
    coChair: "Dr. Pham Thi C (HCMUTE)",
    papers: [
      {
        id: "SMC27-201",
        title: "Explainable Fuzzy Cognitive Maps for Personalized Cardiovascular Disease Diagnosis",
        authors: "Michael Zhang, Maria Garcia, Oliver Brown",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-202",
        title: "Multimodal Transformer Fusion for Early Alzheimer's Detection via Retinal Imaging",
        authors: "Nguyen Quoc Anh, Sophie Martin, Robert Taylor",
        time: "09:20 – 09:40",
      },
      {
        id: "SMC27-203",
        title: "Neuromorphic Spike-Timing-Dependent Plasticity in Wearable Prosthetic Neural Interfaces",
        authors: "Klaus Schmidt, Anna Ivanova, Chen Lu",
        time: "09:40 – 10:00",
      },
      {
        id: "SMC27-204",
        title: "Federated Learning across Heterogeneous Clinical Datasets with Privacy Preserving Guarantees",
        authors: "Emily Davis, Johnathan Vance, Wu Xiaolong",
        time: "10:00 – 10:20",
      },
    ],
  },
  {
    id: "s3",
    code: "ThA03",
    title: "Brain-Machine Interfaces & Shared Autonomy",
    track: "HMS",
    trackName: "Human-Machine Systems",
    day: "2027-10-07",
    dayLabel: "Day 1 (Thu, Oct 7)",
    timeSlot: "09:00 – 10:30",
    room: "Saigon Suite 1",
    chair: "Prof. C. L. Philip Chen (South China Univ. of Tech / IEEE Fellow)",
    coChair: "Dr. Le Dinh D (HCMUTE)",
    papers: [
      {
        id: "SMC27-301",
        title: "Non-Invasive EEG-Based Shared Autonomy for Exoskeleton Gait Rehabilitation",
        authors: "Yuki Takahashi, Lucas Silva, Nguyen Hoang Long",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-302",
        title: "Adaptive Cognitive Load Estimation Using Eye-Tracking and Galvanic Skin Response in Air Traffic Control",
        authors: "Claire Delacroix, Mark Henderson, Raj Patel",
        time: "09:20 – 09:40",
      },
      {
        id: "SMC27-303",
        title: "Haptic Feedback Synthesis for Tele-Surgical Manipulators in Micro-Invasive Surgery",
        authors: "Vo Van Thuan, Francesca Romano, Simon King",
        time: "09:40 – 10:00",
      },
      {
        id: "SMC27-304",
        title: "Human-in-the-Loop Supervisory Control for Semi-Autonomous Industrial Excavation",
        authors: "Takahiro Morita, Daniel Evans, George Clark",
        time: "10:00 – 10:20",
      },
    ],
  },

  // Day 1 - Afternoon
  {
    id: "s4",
    code: "ThP01",
    title: "Smart Grid Cyber-Physical Security & Distributed Resiliency",
    track: "SSE",
    trackName: "Systems Science & Engineering",
    day: "2027-10-07",
    dayLabel: "Day 1 (Thu, Oct 7)",
    timeSlot: "14:00 – 15:30",
    room: "Grand Ballroom A",
    chair: "Prof. MengChu Zhou (NJIT / IEEE Fellow)",
    coChair: "Assoc. Prof. Vu Van E (HCMUTE)",
    papers: [
      {
        id: "SMC27-111",
        title: "Detection of False Data Injection Attacks in Microgrids Using Graph Attention Networks",
        authors: "Li Na, James O'Connor, Vu Dinh H",
        time: "14:00 – 14:20",
      },
      {
        id: "SMC27-112",
        title: "Decentralized Energy Trading via Zero-Knowledge Rollups on Blockchain",
        authors: "Pham Gia Bao, Chloe Tremblay, Sunita Rao",
        time: "14:20 – 14:40",
      },
      {
        id: "SMC27-113",
        title: "Resilient Frequency Regulation Under Actuator Saturation and Communication Delays",
        authors: "Mohammed Al-Mansoor, Peter Becker, Li Qiang",
        time: "14:40 – 15:00",
      },
    ],
  },
  {
    id: "s5",
    code: "ThP02",
    title: "Generative AI & LLMs in Decision Support Systems",
    track: "CYB",
    trackName: "Cybernetics",
    day: "2027-10-07",
    dayLabel: "Day 1 (Thu, Oct 7)",
    timeSlot: "14:00 – 15:30",
    room: "Ballroom B",
    chair: "Prof. Rodney Brooks (MIT / IEEE Fellow)",
    coChair: "Dr. Tran Bao F (HCMUTE)",
    papers: [
      {
        id: "SMC27-211",
        title: "Retrieval-Augmented Reasoning with Neuro-Symbolic Verification for Safety-Critical Decision Support",
        authors: "Alexander Miller, Nguyen Thi Kim, Hans Zimmer",
        time: "14:00 – 14:20",
      },
      {
        id: "SMC27-212",
        title: "Calibrated Uncertainty Quantification in Large Multimodal Models for Industrial Fault Diagnosis",
        authors: "Guo Feng, Sarah Jenkins, Liam O'Sullivan",
        time: "14:20 – 14:40",
      },
      {
        id: "SMC27-213",
        title: "Multi-Agent Consensus Modeling via Iterative Dialogue Refinement",
        authors: "Do Tuan Anh, Elena Gomez, Arthur Dent",
        time: "14:40 – 15:00",
      },
    ],
  },
  {
    id: "s6",
    code: "ThP03",
    title: "Special Session: Human-Centric AI for Sustainable Smart Cities",
    track: "SS",
    trackName: "Special Sessions",
    day: "2027-10-07",
    dayLabel: "Day 1 (Thu, Oct 7)",
    timeSlot: "14:00 – 15:30",
    room: "Mekong Hall",
    chair: "Prof. Hiroshi Ishiguro (Osaka Univ)",
    coChair: "Assoc. Prof. Dang Quoc G (HCMUTE)",
    papers: [
      {
        id: "SMC27-401",
        title: "Adaptive Urban Traffic Signal Coordination Using Multi-Agent Reinforcement Learning with Human Feedback",
        authors: "Bui Thanh Tung, Hiroto Takahashi, Grace Hopper",
        time: "14:00 – 14:20",
      },
      {
        id: "SMC27-402",
        title: "Urban Heat Island Mitigation Modeling with Remote Sensing and Edge IoT Sensor Mesh",
        authors: "Ngo Thi Mai, Carlos Santana, Julia Roberts",
        time: "14:20 – 14:40",
      },
    ],
  },

  // Day 2
  {
    id: "s7",
    code: "FrA01",
    title: "Collaborative Human-Robot Teaming & Physical Ergonomics",
    track: "HMS",
    trackName: "Human-Machine Systems",
    day: "2027-10-08",
    dayLabel: "Day 2 (Fri, Oct 8)",
    timeSlot: "09:00 – 10:30",
    room: "Grand Ballroom A",
    chair: "Prof. Oussama Khatib (Stanford Univ)",
    coChair: "Dr. Nguyen Duc H (HCMUTE)",
    papers: [
      {
        id: "SMC27-321",
        title: "Impedance Control Adaptation Based on Muscle Fatigue Estimation During Co-Manipulation",
        authors: "Antoine Dubois, Nguyen Van Khai, Jennifer Aniston",
        time: "09:00 – 09:20",
      },
      {
        id: "SMC27-322",
        title: "Intent Recognition from Hand Motion Micro-Vibrations for Seamless Cobot Tool Handover",
        authors: "Kenzo Mori, Sven Larsson, Tran Quang I",
        time: "09:20 – 09:40",
      },
    ],
  },
  {
    id: "s8",
    code: "FrA02",
    title: "Workshop: Quantum Computing for Systems Optimization",
    track: "WS",
    trackName: "Workshops & Tutorials",
    day: "2027-10-08",
    dayLabel: "Day 2 (Fri, Oct 8)",
    timeSlot: "09:00 – 12:00",
    room: "Saigon Suite 2",
    chair: "Prof. Seth Lloyd (MIT / Quantum Systems)",
    coChair: "Assoc. Prof. Hoang Van K (HCMUTE)",
    papers: [
      {
        id: "SMC27-501",
        title: "Variational Quantum Algorithms for Large-Scale Supply Chain Routing Optimization",
        authors: "Naveen Kumar, Alice Cooper, Le Van L",
        time: "09:00 – 10:00",
      },
    ],
  },
];

export default function TechnicalSessionsPage() {
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [selectedRoom, setSelectedRoom] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>("s1");

  const filteredSessions = useMemo(() => {
    return SESSIONS_DATA.filter((session) => {
      if (selectedTrack !== "ALL" && session.track !== selectedTrack) return false;
      if (selectedDay !== "ALL" && session.day !== selectedDay) return false;
      if (selectedRoom !== "ALL" && session.room !== selectedRoom) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSession =
          session.title.toLowerCase().includes(q) ||
          session.code.toLowerCase().includes(q) ||
          session.chair.toLowerCase().includes(q) ||
          session.room.toLowerCase().includes(q);

        const matchesPaper = session.papers.some(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.authors.toLowerCase().includes(q)
        );

        if (!matchesSession && !matchesPaper) return false;
      }

      return true;
    });
  }, [selectedTrack, selectedDay, selectedRoom, searchQuery]);

  const toggleSession = (id: string) => {
    setExpandedSessionId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="sessions-header" fullWidthBg="bg-white" className="py-10 sm:py-14">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#115eff] border border-blue-100">
              <Calendar className="w-3.5 h-3.5" />
              <span>Technical Program & Parallel Tracks</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Lịch Trình Báo Cáo <span className="text-[#115eff]">Các Phiên Song Song</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Chương trình chi tiết các phiên báo cáo khoa học theo 3 trụ cột (Systems Science, Cybernetics, Human-Machine Systems) và các phiên chuyên đề đặc biệt tại Hội nghị IEEE SMC 2027.
            </p>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="sessions-filter" fullWidthBg="transparent" className="pt-8">
        {/* Search & Filters Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Box */}
            <div className="md:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Tìm theo Mã bài (SMC27-...), tên bài báo, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
              />
            </div>

            {/* Track Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff] font-medium text-slate-800"
              >
                <option value="ALL">Tất cả Phân ban (All Tracks)</option>
                <option value="SSE">Systems Science & Eng (SSE)</option>
                <option value="CYB">Cybernetics (CYB)</option>
                <option value="HMS">Human-Machine Systems (HMS)</option>
                <option value="SS">Special Sessions (SS)</option>
                <option value="WS">Workshops & Tutorials (WS)</option>
              </select>
            </div>

            {/* Day Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff] font-medium text-slate-800"
              >
                <option value="ALL">Tất cả các ngày (All Days)</option>
                <option value="2027-10-07">Ngày 1 (Thứ 5, 07/10/2027)</option>
                <option value="2027-10-08">Ngày 2 (Thứ 6, 08/10/2027)</option>
                <option value="2027-10-09">Ngày 3 (Thứ 7, 09/10/2027)</option>
                <option value="2027-10-10">Ngày 4 (Chủ nhật, 10/10/2027)</option>
              </select>
            </div>

            {/* Room Filter */}
            <div className="md:col-span-2">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff] font-medium text-slate-800"
              >
                <option value="ALL">Mọi Phòng họp</option>
                <option value="Grand Ballroom A">Ballroom A</option>
                <option value="Ballroom B">Ballroom B</option>
                <option value="Saigon Suite 1">Saigon Suite 1</option>
                <option value="Saigon Suite 2">Saigon Suite 2</option>
                <option value="Mekong Hall">Mekong Hall</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Tìm thấy <strong>{filteredSessions.length}</strong> phiên báo cáo song song phù hợp
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> SSE
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> CYB
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> HMS
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> SS
              </span>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              Không tìm thấy phiên báo cáo nào phù hợp với bộ lọc đã chọn.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className={`bg-white border rounded-2xl transition-all shadow-xs ${
                    isExpanded ? "border-[#115eff] ring-2 ring-blue-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Session Header Clickable */}
                  <div
                    onClick={() => toggleSession(session.id)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-start gap-4">
                      {/* Code Badge */}
                      <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-200 flex flex-col items-center justify-center shrink-0">
                        <span className="font-mono text-xs font-black text-[#115eff]">
                          {session.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {session.track}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {session.trackName}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {session.dayLabel}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {session.title}
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#115eff]" />
                            <span>{session.timeSlot}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>{session.room}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            <span>Chair: {session.chair}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <span className="text-xs font-bold text-[#115eff] bg-blue-50 px-2.5 py-1 rounded-lg">
                        {session.papers.length} bài báo
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Papers List */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6 rounded-b-2xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Danh sách bài báo trình bày trong phiên ({session.timeSlot})
                      </h4>

                      <div className="space-y-3">
                        {session.papers.map((paper, pIdx) => (
                          <div
                            key={paper.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-[#115eff] bg-blue-50 px-2 py-0.5 rounded">
                                  {paper.id}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">
                                  {paper.time}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                {paper.title}
                              </h5>
                              <p className="text-xs text-slate-500">
                                <strong>Tác giả:</strong> {paper.authors}
                              </p>
                            </div>

                            <div className="shrink-0">
                              <Link
                                href={`/registration?type=AUTHOR`}
                                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
                              >
                                <span>Đăng ký tham dự</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SectionContainer>
    </main>
  );
}
