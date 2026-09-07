export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  dateIso: string;
  description: string;
  category: "submission" | "notification" | "registration" | "event";
  highlight?: boolean;
}

export interface TrackTopic {
  code: string;
  name: string;
  description: string;
  keywords: string[];
}

export interface TrackPillar {
  id: "systems" | "humans" | "cybernetics";
  title: string;
  subtitle: string;
  code: string;
  description: string;
  topics: TrackTopic[];
}

export interface KeynoteSpeaker {
  id: string;
  name: string;
  title: string;
  affiliation: string;
  location: string;
  talkTitle: string;
  abstract: string;
  category: "Systems" | "Human-Machine Systems" | "Cybernetics" | "Industry";
  imageUrl?: string;
}

export interface CommitteeMember {
  name: string;
  role: string;
  affiliation: string;
  country: string;
}

export interface CommitteeGroup {
  groupName: string;
  members: CommitteeMember[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "Submission" | "Registration" | "Venue" | "Students";
}

export const CONFERENCE_INFO = {
  name: "IEEE SMC 2027",
  fullName: "2027 IEEE International Conference on Systems, Man, and Cybernetics",
  society: "IEEE Systems, Man, and Cybernetics Society",
  host: "Ho Chi Minh City University of Technology and Education (HCM-UTE)",
  hostShort: "HCM-UTE",
  theme: "Harmonizing Systems, Humans, and Cybernetic Intelligence for a Sustainable Future",
  dates: "October 10–13, 2027",
  location: "Ho Chi Minh City, Vietnam",
  venue: "HCM-UTE Grand Convention Center, 01 Vo Van Ngan Street, Thu Duc City, Ho Chi Minh City",
  address: "01 Vo Van Ngan Street, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City, Vietnam",
  submissionPortal: "https://easychair.org/conferences/?conf=ieeesmc2027",
  submissionDeadlineIso: "2027-05-15T23:59:59+07:00",
  contactEmail: "secretariat@ieeesmc2027.org",
  universityEmail: "ptchc@hcmute.edu.vn",
  hotline: "(+84) 28 3896 8641",
  ieeeXploreNotice:
    "All accepted and presented papers will be submitted for inclusion into IEEE Xplore subject to meeting IEEE Xplore's scope and quality requirements.",
};

export const IMPORTANT_DATES: ImportantDate[] = [
  {
    id: "ss-proposals",
    title: "Special Session & Workshop Proposals",
    date: "March 15, 2027",
    dateIso: "2027-03-15T23:59:59Z",
    description: "Proposals for organized special sessions and technical workshops.",
    category: "submission",
  },
  {
    id: "regular-paper",
    title: "Regular & Special Session Paper Submission",
    date: "May 15, 2027",
    dateIso: "2027-05-15T23:59:59Z",
    description: "Full draft papers (6 pages standard, up to 8 pages with extra page fees).",
    category: "submission",
    highlight: true,
  },
  {
    id: "notification",
    title: "Notification of Acceptance",
    date: "July 15, 2027",
    dateIso: "2027-07-15T23:59:59Z",
    description: "Formal review results and reviewer feedback sent to corresponding authors.",
    category: "notification",
  },
  {
    id: "camera-ready",
    title: "Final Camera-Ready Paper & Author Registration",
    date: "August 15, 2027",
    dateIso: "2027-08-15T23:59:59Z",
    description: "IEEE PDF eXpress certified final files and author registration.",
    category: "registration",
    highlight: true,
  },
  {
    id: "early-bird",
    title: "Early Bird Registration Deadline",
    date: "August 30, 2027",
    dateIso: "2027-08-30T23:59:59Z",
    description: "Discounted conference registration rates for IEEE members and students.",
    category: "registration",
  },
  {
    id: "conference-start",
    title: "Conference Opening & Workshops",
    date: "October 10, 2027",
    dateIso: "2027-10-10T08:30:00+07:00",
    description: "Workshops, Tutorials, and Welcome Reception at HCM-UTE Grand Hall.",
    category: "event",
    highlight: true,
  },
  {
    id: "conference-end",
    title: "Technical Sessions & Gala Banquet",
    date: "October 11–13, 2027",
    dateIso: "2027-10-13T18:00:00+07:00",
    description: "Oral presentations, poster tracks, plenary keynotes, and gala dinner.",
    category: "event",
  },
];

export const TECHNICAL_TRACKS: TrackPillar[] = [
  {
    id: "systems",
    title: "Systems Science & Engineering",
    subtitle: "Large-scale systems, resilience, smart infrastructure & complexity",
    code: "SSE",
    description:
      "Focuses on the formulation, analysis, modeling, simulation, and optimization of complex socio-technical systems, system of systems, cyber-physical infrastructure, and decision automation.",
    topics: [
      {
        code: "SYS-01",
        name: "Cyber-Physical Systems & Smart Grids",
        description: "Decentralized energy management, grid resilience, and real-time physical control.",
        keywords: ["Smart Microgrids", "Resilience", "CPS Control", "Fault Tolerance"],
      },
      {
        code: "SYS-02",
        name: "System of Systems (SoS) Engineering",
        description: "Heterogeneous system orchestration, interoperability architectures, and large-scale synthesis.",
        keywords: ["SoS Architecture", "Multi-Domain Integration", "Socio-Technical", "Modularity"],
      },
      {
        code: "SYS-03",
        name: "Intelligent Transportation & Autonomous Logistics",
        description: "Connected autonomous vehicles, urban traffic flow modeling, and multi-modal fleet coordination.",
        keywords: ["V2X Networks", "Traffic Automation", "Fleet Optimization", "Urban Mobility"],
      },
      {
        code: "SYS-04",
        name: "Supply Chain Resilience & Industrial Automation",
        description: "Dynamic rerouting, inventory cybernetics, and Industry 5.0 cognitive manufacturing.",
        keywords: ["Supply Chain AI", "Digital Twins", "Predictive Maintenance", "Smart Factories"],
      },
      {
        code: "SYS-05",
        name: "Complex Networks & Socio-Economic Modeling",
        description: "Epidemic propagation, contagion dynamics, and systemic financial risk architectures.",
        keywords: ["Graph Topology", "Cascading Failures", "Network Science", "Socio-Cybernetics"],
      },
      {
        code: "SYS-06",
        name: "Mission-Critical Defense & Space Systems",
        description: "Autonomous satellite swarms, fault-tolerant telemetry, and resilient space systems.",
        keywords: ["CubeSat Clusters", "Fault Isolation", "Orbital Telemetry", "Aerospace Cybernetics"],
      },
    ],
  },
  {
    id: "humans",
    title: "Human-Machine Systems",
    subtitle: "Symbiotic interaction, brain-computer interfaces & augmented cognition",
    code: "HMS",
    description:
      "Investigates the cognitive, physiological, and computational paradigms enabling seamless collaboration, communication, and mutual adaptation between humans and intelligent technological agents.",
  topics: [
      {
        code: "HUM-01",
        name: "Brain-Computer Interfaces (BCI)",
        description: "Non-invasive EEG decoding, invasive neural implants, neuroprosthetics, and motor rehabilitation.",
        keywords: ["EEG Decoding", "Neuroprosthetics", "Neural Decoding", "Adaptive BCI"],
      },
      {
        code: "HUM-02",
        name: "Cognitive Ergonomics & Mental Workload",
        description: "Eye-tracking telemetry, biometric stress evaluation, and adaptive situational awareness interfaces.",
        keywords: ["Eye-Tracking", "Stress Telemetry", "Workload Sensing", "Human Factors"],
      },
      {
        code: "HUM-03",
        name: "Collaborative Robotics (Cobots)",
        description: "Impedance control, intention inference, kinesthetic teaching, and industrial safety bounds.",
        keywords: ["Cobot Safety", "Intention Recognition", "Shared Autonomy", "Physical HRI"],
      },
      {
        code: "HUM-04",
        name: "Human-in-the-Loop AI & Teaming",
        description: "Active learning with human supervision, shared autonomy, and bidirectional trust calibration.",
        keywords: ["Active Learning", "Trust Calibration", "Human-AI Teaming", "Interactive ML"],
      },
      {
        code: "HUM-05",
        name: "Extended Reality (XR) & Telepresence",
        description: "Spatial audio, haptic gloves, neural avatars, and low-latency immersive teleoperation.",
        keywords: ["Haptics", "Spatial Computing", "Telepresence", "Immersive Interfaces"],
      },
      {
        code: "HUM-06",
        name: "Biomedical Assistive & Rehabilitation Systems",
        description: "Powered exoskeletons, orthotic biomechanics, gait kinematics, and adaptive therapy robots.",
        keywords: ["Exoskeletons", "Gait Kinematics", "Rehab Robotics", "Wearable Sensors"],
      },
    ],
  },
  {
    id: "cybernetics",
    title: "Cybernetics & Computational Intelligence",
    subtitle: "Foundation learning, neural dynamics & trustworthy autonomous agents",
    code: "CYB",
    description:
      "Drives forward fundamental methodologies in adaptive control, deep neural computation, fuzzy cognitive maps, evolutionary multi-objective optimization, and certifiably trustworthy artificial intelligence.",
    topics: [
      {
        code: "CYB-01",
        name: "Deep Reinforcement Learning & Optimal Control",
        description: "Safe policy gradients, model-based RL, actor-critic architectures, and non-linear stability guarantees.",
        keywords: ["Model-Based RL", "Safe RL", "Lyapunov Stability", "Actor-Critic"],
      },
      {
        code: "CYB-02",
        name: "Multi-Agent Systems & Swarm Cybernetics",
        description: "Consensus algorithms, decentralized game theory, decentralized auctions, and flocking dynamics.",
        keywords: ["Consensus Protocols", "Flocking", "Game Theory", "Distributed Control"],
      },
      {
        code: "CYB-03",
        name: "Fuzzy Logic & Cognitive Knowledge Graphs",
        description: "Type-2 fuzzy control, neural-symbolic deduction, uncertainty quantification, and knowledge distillation.",
        keywords: ["Type-2 Fuzzy", "Neuro-Symbolic", "Uncertainty Bounds", "Knowledge Graphs"],
      },
      {
        code: "CYB-04",
        name: "Evolutionary Computation & Swarm Intelligence",
        description: "Multi-objective optimization, genetic algorithms, ant colony, and particle swarm systems.",
        keywords: ["Genetic Algorithms", "Swarm Robotics", "Pareto Frontier", "Metaheuristics"],
      },
      {
        code: "CYB-05",
        name: "Explainable, Fair & Trustworthy AI (XAI)",
        description: "Interpretability methods, causal inference, algorithmic bias mitigation, and safety bounds.",
        keywords: ["XAI", "Causal AI", "Fairness", "Safety Verification"],
      },
      {
        code: "CYB-06",
        name: "Autonomous Robotics & Bio-Inspired Systems",
        description: "Locomotion, SLAM, collaborative manipulation, and biomimetic cybernetics.",
        keywords: ["SLAM", "Bio-Robotics", "Field Robotics", "Autonomous Navigation"],
      },
    ],
  },
];

export const KEYNOTE_SPEAKERS: KeynoteSpeaker[] = [
  {
    id: "speaker-1",
    name: "Prof. Elena Rostova",
    title: "Chair of Autonomous Cybernetics",
    affiliation: "ETH Zürich, Switzerland",
    location: "Zürich, Switzerland",
    category: "Cybernetics",
    talkTitle: "Provable Guarantees for Autonomous Cybernetic Agents in Non-Stationary Environments",
    abstract:
      "As autonomous cybernetic systems transition from closed lab benchmarks to unstructured physical domains, standard stationarity assumptions fail. This plenary explores Lyapunov-stable adaptive control paired with uncertainty-aware deep reinforcement learning.",
  },
  {
    id: "speaker-2",
    name: "Prof. Hiroshi Tanaka",
    title: "Director of Neural Engineering & BCI Lab",
    affiliation: "National University of Singapore (NUS)",
    location: "Singapore",
    category: "Human-Machine Systems",
    talkTitle: "Bidirectional Neural Interfaces: Closing the Human-Machine Sensorimotor Loop",
    abstract:
      "Recent breakthroughs in ultra-high-density neural probes and low-latency microcontrollers enable real-time bidirectional communication between the human central nervous system and prosthetic mechatronics.",
  },
  {
    id: "speaker-3",
    name: "Prof. Marcus Vance",
    title: "Distinguished Fellow in Systems Architecture",
    affiliation: "Massachusetts Institute of Technology (MIT)",
    location: "Cambridge, USA",
    category: "Systems",
    talkTitle: "Architecting Ultra-Resilient Systems of Systems for Planetary Infrastructure",
    abstract:
      "Modern urban energy, logistics, and telecommunication grids operate as tightly coupled multi-layer networks. This talk outlines a novel topological resilience framework for self-healing infrastructure.",
  },
  {
    id: "speaker-4",
    name: "Dr. Amara Chen",
    title: "Chief AI Systems Architect",
    affiliation: "DeepMind / Systems Intelligence Group",
    location: "London, UK",
    category: "Industry",
    talkTitle: "From Large Language Models to Embodied Cybernetic Reasoners",
    abstract:
      "We examine how foundational multimodal representations can be grounded into real-time physical control loops, enabling robots and industrial systems to perform zero-shot planning with high physical fidelity.",
  },
];

export const COMMITTEE_GROUPS: CommitteeGroup[] = [
  {
    groupName: "Honorary & General Chairs",
    members: [
      {
        name: "Assoc. Prof. Dr. Le Hieu Giang",
        role: "Honorary General Chair",
        affiliation: "President, HCM-UTE",
        country: "Vietnam",
      },
      {
        name: "Prof. Rodney Thorne",
        role: "Honorary General Chair",
        affiliation: "IEEE SMC Society President",
        country: "USA",
      },
      {
        name: "Assoc. Prof. Dr. Truong Nguyen Luan Vu",
        role: "General Co-Chair",
        affiliation: "Dean, FEEE, HCM-UTE",
        country: "Vietnam",
      },
      {
        name: "Prof. Wei-Min Liu",
        role: "General Co-Chair",
        affiliation: "Nanyang Technological University",
        country: "Singapore",
      },
      {
        name: "Prof. Claire Montgomery",
        role: "General Co-Chair",
        affiliation: "Imperial College London",
        country: "United Kingdom",
      },
    ],
  },
  {
    groupName: "Technical Program Chairs (TPC)",
    members: [
      {
        name: "Prof. Kenji Takahashi",
        role: "TPC Chair (Cybernetics)",
        affiliation: "Kyoto University",
        country: "Japan",
      },
      {
        name: "Prof. Sarah O'Connor",
        role: "TPC Chair (Human-Machine Systems)",
        affiliation: "University of Toronto",
        country: "Canada",
      },
      {
        name: "Prof. Arvind Ramanathan",
        role: "TPC Chair (Systems Science)",
        affiliation: "Indian Institute of Science",
        country: "India",
      },
      {
        name: "Dr. Nguyen Thanh Nam",
        role: "Local TPC Co-Chair",
        affiliation: "HCM-UTE",
        country: "Vietnam",
      },
    ],
  },
  {
    groupName: "Special Sessions & Workshops",
    members: [
      {
        name: "Dr. Matteo Bianchi",
        role: "Special Sessions Chair",
        affiliation: "Politecnico di Milano",
        country: "Italy",
      },
      {
        name: "Prof. Ling-Fei Zhang",
        role: "Workshops Chair",
        affiliation: "Tsinghua University",
        country: "China",
      },
      {
        name: "Dr. Brenda Morales",
        role: "Tutorials Chair",
        affiliation: "Tecnológico de Monterrey",
        country: "Mexico",
      },
    ],
  },
  {
    groupName: "Publications & Local Organization",
    members: [
      {
        name: "Prof. David K. Miller",
        role: "Publication Chair",
        affiliation: "Georgia Institute of Technology",
        country: "USA",
      },
      {
        name: "Dr. Tran Vu Hoang",
        role: "Local Organizing Chair",
        affiliation: "HCM-UTE",
        country: "Vietnam",
      },
      {
        name: "Prof. Stefan Lindqvist",
        role: "Industry Liaison Chair",
        affiliation: "KTH Royal Institute of Technology",
        country: "Sweden",
      },
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    category: "Submission",
    question: "What is the page limit and format for regular paper submissions?",
    answer:
      "Regular papers must be formatted according to the standard IEEE 2-column conference format. The length is strictly up to 6 pages. Up to 2 additional pages (maximum 8 pages total) are allowed subject to an extra page charge upon acceptance.",
  },
  {
    category: "Submission",
    question: "Are submissions double-blind or single-blind?",
    answer:
      "IEEE SMC 2027 operates a single-blind review process. Author names, affiliations, and acknowledgments should be included in the submitted PDF. Every submission is rigorously evaluated by at least three independent peer reviewers.",
  },
  {
    category: "Submission",
    question: "Will accepted papers be indexed in IEEE Xplore?",
    answer:
      "Yes. All accepted and presented papers will be submitted to the IEEE Xplore Digital Library and indexed in major databases including Scopus, EI Compendex, and Web of Science.",
  },
  {
    category: "Registration",
    question: "Does one registration cover multiple accepted papers?",
    answer:
      "Each accepted paper must be accompanied by at least one full (non-student) author registration by the camera-ready deadline. One full registration may cover up to two papers authored by the registrant with an additional handling surcharge.",
  },
  {
    category: "Students",
    question: "Are there travel grants available for student authors?",
    answer:
      "Yes. The IEEE SMC Society and HCM-UTE offer competitive Student Travel Grants to support IEEE Student Members presenting their papers in person in Ho Chi Minh City. Application guidelines will open following paper acceptance notifications.",
  },
  {
    category: "Venue",
    question: "How do I reach HCM-UTE from Tan Son Nhat International Airport (SGN)?",
    answer:
      "HCM-UTE is located at 01 Vo Van Ngan Street, Thu Duc City, Ho Chi Minh City, approximately 14 km from Tan Son Nhat International Airport (SGN). You can easily reach the venue by official airport taxi or Grab (approx. 35–45 minutes) or via the newly inaugurated Ho Chi Minh City Metro Line 1 connecting central districts to Thu Duc station directly adjacent to the campus.",
  },
];

export const CONFERENCE_STATS = [
  { label: "Technical Pillars", value: "3", sub: "Systems, HMS, Cybernetics" },
  { label: "Expected Delegates", value: "1,200+", sub: "From 60+ countries" },
  { label: "Technical Tracks", value: "18+", sub: "Peer-reviewed sessions" },
  { label: "Host University", value: "HCM-UTE", sub: "Ho Chi Minh City, Vietnam" },
];
