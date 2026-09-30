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
  category: string;
}

export interface TrackPillar {
  id: "systems" | "cybernetics" | "humans";
  title: string;
  subtitle: string;
  code: string;
  description: string;
  topics: TrackTopic[];
}

export interface CommitteeMember {
  name: string;
  role: string;
  country: string;
  affiliation?: string;
}

export interface CommitteeGroup {
  groupName: string;
  members: CommitteeMember[];
}

export interface FaqItem {
  question: string;
  answer: string;
  category: "Submission" | "Registration" | "Venue" | "Visa";
}

export interface TouristAttraction {
  id: string;
  name: string;
  vietnameseName: string;
  location: string;
  openingHours: string;
  distanceFromVenue: string;
  badge: string;
  description: string;
  image: string;
  mapsQuery: string;
}

export const CONFERENCE_INFO = {
  name: "IEEE SMC 2027",
  fullName: "The 2027 IEEE International Conference on Systems, Man, and Cybernetics",
  society: "IEEE Systems, Man, and Cybernetics Society",
  host: "Ho Chi Minh City University of Technology and Engineering-Vietnam",
  hostShort: "HCM-UTE",
  theme: "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
  dates: "October 6–10, 2027",
  datesShort: "Oct 6–10, 2027",
  location: "Ho Chi Minh City, Vietnam",
  venue: "Sheraton Saigon Grand Opera Hotel",
  address: "No. 88 Dong Khoi, Saigon Ward, Ho Chi Minh City, Vietnam",
  googleMapsUrl: "https://maps.google.com/?q=Sheraton+Saigon+Grand+Opera+Hotel+88+Dong+Khoi+Ho+Chi+Minh",
  visaUrl: "https://evisa.gov.vn",
  website: "https://ieee-smc2027.org",
  contactEmail: "ieeesmc2027@hcmute.edu.vn",
  hotline: "+84 981 479 507 (Vu Van Phong)",
  hotlineRaw: "+84981479507",
  submissionSystem: "Online Submission System",
  submissionStatus: "Online submission link will be coming shortly",
  submissionPortal: "#cfp",
  cfpPdfUrl: "/cfp-ieee-smc-2027.pdf",
  submissionDeadlineIso: "2027-04-08T23:59:59+07:00",
  submissionNotice:
    "All submissions must be in English. The full papers are to be submitted electronically in PDF format via the online submission system link (will be coming shortly).",
  ieeeXploreNotice:
    "Accepted and presented papers will be copyrighted to IEEE and published in conference proceedings, which will be eligible for inclusion in the IEEE Xplore® Digital Library, once it meets the requirements of an IEEE quality review.",
  description:
    "The 2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027), hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam, will bring together leading researchers, academics, industry professionals, and innovators from around the world to exchange knowledge and explore emerging advances in systems science and engineering, human–machine systems, and cybernetics. Under the theme “Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures,” the conference will highlight cutting-edge developments in artificial intelligence, human–AI collaboration, intelligent and autonomous systems, robotics, digital twins, cyber-physical systems, trustworthy AI, and sustainable technologies. IEEE SMC 2027 will provide an international forum for sharing innovative research, fostering interdisciplinary collaboration, and developing intelligent solutions to complex technological and societal challenges.",
};

export const IMPORTANT_DATES: ImportantDate[] = [
  {
    id: "ss-proposals",
    title: "Submission of Proposals for Special Sessions, Tutorials and Workshops",
    date: "February 15, 2027",
    dateIso: "2027-02-15T23:59:59Z",
    description: "Proposals deadline for organized Special Sessions, technical Tutorials, and Workshops.",
    category: "submission",
  },
  {
    id: "ss-notification",
    title: "Special Sessions, Tutorials and Workshops Acceptance Notification",
    date: "March 04, 2027",
    dateIso: "2027-03-04T23:59:59Z",
    description: "Formal notification of accepted Special Sessions, Tutorials, and Workshops proposals.",
    category: "notification",
  },
  {
    id: "paper-submission",
    title: "Paper Submission for Workshops, Regular and Special Sessions",
    date: "April 08, 2027",
    dateIso: "2027-04-08T23:59:59Z",
    description: "Full manuscript submission deadline for Workshops, Regular, and Special Sessions.",
    category: "submission",
    highlight: true,
  },
  {
    id: "paper-acceptance",
    title: "Notification of Papers Acceptance for Workshops, Regular and Special Sessions",
    date: "May 30, 2027",
    dateIso: "2027-05-30T23:59:59Z",
    description: "Acceptance notifications and peer-review feedback sent to authors.",
    category: "notification",
    highlight: true,
  },
  {
    id: "early-bird",
    title: "Deadline for Early Bird Registrations",
    date: "July 05, 2027",
    dateIso: "2027-07-05T23:59:59Z",
    description: "Discounted early bird registration rates deadline for attendees and authors.",
    category: "registration",
  },
  {
    id: "camera-ready",
    title: "Final Paper Camera-Ready Submission of Regular, Special Sessions and Workshops",
    date: "July 15, 2027",
    dateIso: "2027-07-15T23:59:59Z",
    description: "Final camera-ready manuscript submission deadline for proceedings inclusion.",
    category: "submission",
    highlight: true,
  },
  {
    id: "late-reg-author",
    title: "Deadline for Late Registration (Author)",
    date: "August 05, 2027",
    dateIso: "2027-08-05T23:59:59Z",
    description: "Strict author registration deadline to ensure paper publication in IEEE SMC 2027 proceedings.",
    category: "registration",
  },
  {
    id: "late-reg-non-author",
    title: "Deadline for Late Registration (Non-Author)",
    date: "October 04, 2027",
    dateIso: "2027-10-04T23:59:59Z",
    description: "Registration deadline for non-author participants and attendees.",
    category: "registration",
  },
  {
    id: "conference-opening",
    title: "IEEE SMC 2027 Conference in Ho Chi Minh City",
    date: "October 6–10, 2027",
    dateIso: "2027-10-06T08:30:00+07:00",
    description: "Conference sessions, plenary talks, workshops, industrial exhibits, and gala banquet at Sheraton Saigon.",
    category: "event",
    highlight: true,
  },
];

export const TECHNICAL_TRACKS: TrackPillar[] = [
  {
    id: "systems",
    title: "Systems Science & Engineering",
    subtitle: "Robotics, complex networks, distributed systems, resilient CPS & smart infrastructure",
    code: "SSE",
    description:
      "Focuses on the formulation, analysis, modeling, simulation, and optimization of complex socio-technical systems, cyber-physical infrastructure, autonomous bionic robotics, and decision systems.",
    topics: [
      { code: "SSE-01", name: "Autonomous Bionic Robotic Aircraft", category: "Robotics & Aerospace" },
      { code: "SSE-02", name: "Bio-mechatronics and Bio-robotics Systems", category: "Robotics & Biomimicry" },
      { code: "SSE-03", name: "Blockchain", category: "Distributed Systems" },
      { code: "SSE-04", name: "Conflict Resolution", category: "Decision & Systems Theory" },
      { code: "SSE-05", name: "Cyber-Physical Cloud Systems", category: "Cloud & CPS" },
      { code: "SSE-06", name: "Cyber Humanities", category: "Socio-Technical" },
      { code: "SSE-07", name: "Cyber Systems and Engineering", category: "Systems Engineering" },
      { code: "SSE-08", name: "Discrete Event Systems", category: "Control & Automation" },
      { code: "SSE-09", name: "Distributed Intelligent Systems", category: "Distributed Intelligence" },
      { code: "SSE-10", name: "Embodied AI Systems", category: "AI & Physical Systems" },
      { code: "SSE-11", name: "Enterprise Architecture and Engineering", category: "Enterprise Systems" },
      { code: "SSE-12", name: "Enterprise Information Systems", category: "Enterprise Systems" },
      { code: "SSE-13", name: "Flexible Electronic Systems", category: "Hardware & Electronics" },
      { code: "SSE-14", name: "Grey Systems", category: "Uncertainty & Modeling" },
      { code: "SSE-15", name: "Homeland Security", category: "Security & Safety" },
      { code: "SSE-16", name: "Intelligent Learning in Control Systems", category: "Learning Control" },
      { code: "SSE-17", name: "Intelligent Power and Energy Systems", category: "Smart Energy" },
      { code: "SSE-18", name: "Security Systems", category: "Security & Safety" },
      { code: "SSE-19", name: "Intelligent Systems to Human-Aware Sustainability", category: "Sustainability" },
      { code: "SSE-20", name: "Intelligent Transportation Systems", category: "Mobility & Transport" },
      { code: "SSE-21", name: "Logistics Informatics and Industrial", category: "Industrial Systems" },
      { code: "SSE-22", name: "Medical Mechatronics", category: "Biomedical Systems" },
      { code: "SSE-23", name: "Model-Based Systems Engineering", category: "Systems Engineering" },
      { code: "SSE-24", name: "Robotics and Intelligent Sensing", category: "Robotics & Sensors" },
      { code: "SSE-25", name: "Service Systems and Organization", category: "Service Science" },
      { code: "SSE-26", name: "Systems Biology", category: "Biological Systems" },
      { code: "SSE-27", name: "System of Systems", category: "Complex Systems" },
    ],
  },
  {
    id: "cybernetics",
    title: "Cybernetics",
    subtitle: "Cognitive systems, machine learning, collective intelligence & evolutionary computation",
    code: "CYB",
    description:
      "Drives forward foundational and applied cybernetic methods in cognitive architectures, deep learning, fuzzy sets, granular computing, quantum cybernetics, and social intelligence.",
    topics: [
      { code: "CYB-01", name: "Awareness Computing", category: "Cognitive Cybernetics" },
      { code: "CYB-02", name: "Big Data Computing", category: "Data Science" },
      { code: "CYB-03", name: "Brain-Inspired Cognitive Systems", category: "Neuro-Cybernetics" },
      { code: "CYB-04", name: "Cognitive Situation Management", category: "Cognitive Systems" },
      { code: "CYB-05", name: "Computational Collective Intelligence", category: "Collective Intelligence" },
      { code: "CYB-06", name: "Computational Cybernetics", category: "Cybernetics Theory" },
      { code: "CYB-07", name: "AI-Based Smart Manufacturing Systems", category: "Smart Manufacturing" },
      { code: "CYB-08", name: "Computational Intelligence", category: "CI & Neural Systems" },
      { code: "CYB-09", name: "Computational Life Science", category: "Life Sciences" },
      { code: "CYB-10", name: "Computational Psychophysiology", category: "Psychophysiology" },
      { code: "CYB-11", name: "Cyber-enabled World", category: "Pervasive Cybernetics" },
      { code: "CYB-12", name: "Cyber-Medical Systems", category: "Medical Cybernetics" },
      { code: "CYB-13", name: "Cybernetics for Cyber-Physical Systems", category: "CPS Cybernetics" },
      { code: "CYB-14", name: "Cyber Humanities", category: "Humanities & Cybernetics" },
      { code: "CYB-15", name: "Cyber Systems and Engineering", category: "Systems Cybernetics" },
      { code: "CYB-16", name: "Evolving Intelligent Systems", category: "Adaptive Systems" },
      { code: "CYB-17", name: "Granular Computing", category: "Granular & Fuzzy Sets" },
      { code: "CYB-18", name: "Information Assurance & Intelligent Multimedia-Mobile Communications", category: "Communications & Security" },
      { code: "CYB-19", name: "Intelligent Industrial Systems", category: "Industrial Cybernetics" },
      { code: "CYB-20", name: "Intelligent Internet Systems", category: "Network Cybernetics" },
      { code: "CYB-21", name: "Intelligent Vehicular Systems & Control", category: "Vehicular Cybernetics" },
      { code: "CYB-22", name: "Knowledge Acquisition in Intelligent Systems", category: "Knowledge Engineering" },
      { code: "CYB-23", name: "Machine Learning", category: "Machine Learning" },
      { code: "CYB-24", name: "Medical Informatics", category: "Health Informatics" },
      { code: "CYB-25", name: "Social and Economic Security", category: "Socio-Economic Systems" },
      { code: "CYB-26", name: "Social Computing and Social Intelligence", category: "Social Intelligence" },
      { code: "CYB-27", name: "Soft Computing", category: "Soft Computing" },
      { code: "CYB-28", name: "Quantum Cybernetics", category: "Quantum Computing" },
    ],
  },
  {
    id: "humans",
    title: "Human-Machine Systems",
    subtitle: "Brain-machine interfaces, cooperative design, augmented cognition & interactive systems",
    code: "HMS",
    description:
      "Investigates the cognitive, physiological, ergonomic, and interactive paradigms enabling mutual adaptation and symbiosis between human operators and machine intelligence.",
    topics: [
      { code: "HMS-01", name: "Biometrics and Applications", category: "Biometrics" },
      { code: "HMS-02", name: "Brain-Machine Interface Systems", category: "Neural Interfaces" },
      { code: "HMS-03", name: "Cognitive Computing", category: "Cognitive Ergonomics" },
      { code: "HMS-04", name: "Companion Technology", category: "Companion Systems" },
      { code: "HMS-05", name: "Computer Supported Cooperative Work in Design", category: "CSCW" },
      { code: "HMS-06", name: "Cyber Humanities", category: "Human Factors" },
      { code: "HMS-07", name: "Cyber Systems and Engineering", category: "Human-System Engineering" },
      { code: "HMS-08", name: "Environmental Sensing, Networking and Decision Making", category: "Decision Support" },
      { code: "HMS-09", name: "Human Centered Transportation Systems", category: "Transportation HMI" },
      { code: "HMS-10", name: "Humanized Crowd Computing", category: "Crowd Computing" },
      { code: "HMS-11", name: "Human-Machine Interaction for Connected and Automated Vehicles", category: "Automated Driving HMI" },
      { code: "HMS-12", name: "Information Systems for Design and Marketing", category: "Design Systems" },
      { code: "HMS-13", name: "Interactive and Wearable Computing and Devices Shared Control", category: "Wearables & Shared Control" },
      { code: "HMS-14", name: "Visual Analytics and Communications", category: "Visual Analytics" },
    ],
  },
];

export const COMMITTEE_GROUPS: CommitteeGroup[] = [
  {
    groupName: "Honorary Chairs",
    members: [
      {
        name: "Hieu-Giang Le",
        role: "Honorary Chair",
        country: "Vietnam",
        affiliation: "Acting President, HCM-UTE",
      },
      {
        name: "Saeid Nahavandi",
        role: "Honorary Chair",
        country: "Australia",
        affiliation: "President, IEEE SMC Society • Swinburne Univ.",
      },
    ],
  },
  {
    groupName: "Steering Committee",
    members: [
      { name: "Sam Kwong", role: "Steering Committee", country: "China" },
      { name: "Imre Rudas", role: "Steering Committee", country: "Hungary" },
      { name: "Adrian Stoica", role: "Steering Committee", country: "USA" },
      { name: "Ljiljana Trajkovic", role: "Steering Committee", country: "Canada" },
      { name: "Eddie Tunstel", role: "Steering Committee", country: "USA" },
    ],
  },
  {
    groupName: "General Chairs & Co-Chairs",
    members: [
      {
        name: "Dinh-Thanh Chau",
        role: "General Chair",
        country: "Vietnam",
        affiliation: "Vice President, HCM-UTE",
      },
      {
        name: "Yo-Ping Huang",
        role: "General Chair",
        country: "Taiwan",
        affiliation: "National Taipei University of Technology",
      },
      { name: "Thanh-Hai Quach", role: "General Co-Chair", country: "Vietnam" },
      { name: "Philip Chen", role: "General Co-Chair", country: "China" },
      { name: "Levente Kovacs", role: "General Co-Chair", country: "Hungary" },
    ],
  },
  {
    groupName: "Program Chairs & Co-Chairs",
    members: [
      { name: "Van-Phong Vu", role: "Program Chair", country: "Vietnam" },
      { name: "Shun-Feng Su", role: "Program Chair", country: "Taiwan" },
      { name: "Li-Wei Ko", role: "Program Co-Chair", country: "Taiwan" },
      { name: "Van-Chung Nguyen", role: "Program Co-Chair", country: "Vietnam" },
      { name: "An-Quoc Hoang", role: "Program Co-Chair", country: "Vietnam" },
    ],
  },
  {
    groupName: "Special Sessions, Tutorials & Workshops",
    members: [
      { name: "Naoyuki Kubota", role: "Special Session Chair", country: "Japan" },
      { name: "Chunsing Lai", role: "Special Session Chair", country: "China" },
      { name: "My-Ha Le", role: "Special Session Chair", country: "Vietnam" },
      { name: "Xiaojie Su", role: "Special Session Chair", country: "China" },
      { name: "Yan Wan", role: "Special Session Chair", country: "USA" },
      { name: "Mariagrazia Dotoli", role: "Tutorial Chair", country: "Italy" },
      { name: "Ming Ho", role: "Tutorial Chair", country: "Canada" },
      { name: "Peng Shi", role: "Tutorial Chair", country: "Australia" },
      { name: "Huei-Yung Lin", role: "Workshop Chair", country: "Taiwan" },
      { name: "Chao Shen", role: "Workshop Chair", country: "China" },
      { name: "Haibin Zhu", role: "Workshop Chair", country: "Canada" },
    ],
  },
  {
    groupName: "Awards, Publications & Organization",
    members: [
      { name: "Van-Phong Vu", role: "Publications Chair", country: "Vietnam" },
      { name: "Philip Chen", role: "Best Paper Award Chair", country: "China" },
      { name: "Tom Gedeon", role: "Best Paper Award Chair", country: "Australia" },
      { name: "Robert Kozma", role: "Best Paper Award Chair", country: "USA" },
      { name: "Ngoc-Thin Chau", role: "Web Chair", country: "Vietnam" },
      { name: "Thi-Hien Truong", role: "Financial Chair", country: "Vietnam" },
      { name: "Jay Wang", role: "Financial Chair", country: "USA" },
      { name: "Meng-Yun Chung", role: "Publicity Chair", country: "Taiwan" },
      { name: "Do Thanh Trung", role: "Publicity Chair", country: "Vietnam" },
      { name: "Dinh-Nhon Truong", role: "Publicity Chair", country: "Vietnam" },
    ],
  },
  {
    groupName: "Industrial Chairs",
    members: [
      { name: "Ngoc-Son Pham", role: "Industrial Exhibition Chair", country: "Vietnam" },
      { name: "Vi-Do Tran", role: "Industrial Exhibition Chair", country: "Vietnam" },
      { name: "Duc-Thien Tran", role: "Industrial Exhibition Chair", country: "Vietnam" },
      { name: "Foun-Yuan Liu", role: "Industrial Coordinator Chair", country: "Taiwan" },
      { name: "Chien-Hsun Chen", role: "Industrial Coordinator Chair", country: "Taiwan" },
    ],
  },
  {
    groupName: "Local Organizing Committee",
    members: [
      { name: "Ngoc-Thin Chau", role: "Local Organizing Committee", country: "Vietnam" },
      { name: "Dang-Nam Nguyen", role: "Local Organizing Committee", country: "Vietnam" },
      { name: "Bao-Huy Dinh", role: "Local Organizing Committee", country: "Vietnam" },
      { name: "Van-Nguyen Nguyen", role: "Local Organizing Committee", country: "Vietnam" },
      { name: "Phuong-Thu-Thuy Phung", role: "Local Organizing Committee", country: "Vietnam" },
      { name: "Thi-Thanh-Truc Tran", role: "Local Organizing Committee", country: "Vietnam" },
      { name: "Pham-Viet-Anh-Thu Le", role: "Local Organizing Committee", country: "Vietnam" },
    ],
  },
];

export const FAQS: FaqItem[] = [
  {
    category: "Submission",
    question: "What is the official submission system and format?",
    answer:
      "All submissions must be in English. The full papers are to be submitted electronically in PDF format via the official online submission system link (will be coming shortly).",
  },
  {
    category: "Submission",
    question: "What are the important deadlines for paper submission?",
    answer:
      "Paper submission for Workshops, Regular, and Special Sessions is April 08, 2027. Notification of paper acceptance is scheduled for May 30, 2027, and camera-ready papers are due July 15, 2027.",
  },
  {
    category: "Submission",
    question: "Will accepted papers be published in IEEE Xplore?",
    answer:
      "Accepted and presented papers will be copyrighted to IEEE and published in conference proceedings, which will be eligible for inclusion in the IEEE Xplore® Digital Library, once it meets the requirements of an IEEE quality review.",
  },
  {
    category: "Venue",
    question: "Where is the conference held?",
    answer:
      "IEEE SMC 2027 will take place at the Sheraton Saigon Grand Opera Hotel, located at No. 88 Dong Khoi, Saigon Ward, Ho Chi Minh City, Vietnam. The conference is proudly hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam.",
  },
  {
    category: "Visa",
    question: "How do international delegates apply for a Vietnam visa?",
    answer:
      "International delegates can apply for Vietnam electronic visas (e-Visa) directly through the official Vietnam government visa portal: https://evisa.gov.vn.",
  },
  {
    category: "Registration",
    question: "What are the registration deadlines?",
    answer:
      "Early bird registration closes on July 05, 2027. The author registration deadline is August 05, 2027, and late registration for non-author attendees closes on October 04, 2027.",
  },
];

export const CONFERENCE_STATS = [
  { label: "Technical Pillars", value: "3", sub: "SSE • CYB • HMS" },
  { label: "Topics & Sub-tracks", value: "68+", sub: "Peer-reviewed domains" },
  { label: "Conference Dates", value: "Oct 6–10", sub: "2027 in Ho Chi Minh City" },
  { label: "Host Institution", value: "HCM-UTE", sub: "HCMC Univ. of Tech. & Engineering" },
];

export const MUST_VISIT_ATTRACTIONS: TouristAttraction[] = [
  {
    id: "ben-thanh",
    name: "Ben Thanh Market",
    vietnameseName: "Chợ Bến Thành",
    location: "Ben Thanh Ward, District 1, Ho Chi Minh City",
    openingHours: "7:00 AM – 7:00 PM (Night market outside until 10:00 PM)",
    distanceFromVenue: "~1.0 km (12 mins walk / 4 mins taxi)",
    badge: "Iconic Landmark",
    description:
      "One of Saigon's earliest surviving historic structures and a vibrant symbol of the city. Delegates can browse authentic handicrafts, lacquerware, textiles, Vietnamese coffee, and experience local street gastronomy.",
    image: "/images/attractions/ben-thanh.jpg",
    mapsQuery: "Ben+Thanh+Market+Ho+Chi+Minh",
  },
  {
    id: "post-office",
    name: "Saigon Central Post Office",
    vietnameseName: "Bưu điện Trung tâm Sài Gòn",
    location: "02 Paris Commune, Ben Nghe Ward, District 1, Ho Chi Minh City",
    openingHours: "7:30 AM – 6:00 PM (Mon–Sat) • 8:00 AM – 5:00 PM (Sun)",
    distanceFromVenue: "~650 m (8 mins walk)",
    badge: "French Heritage",
    description:
      "Designed in the late 19th century with striking French colonial architecture and vaulted iron beams. Still a fully functioning post office where visitors can send vintage postcards worldwide.",
    image: "/images/attractions/post-office.jpg",
    mapsQuery: "Saigon+Central+Post+Office",
  },
  {
    id: "notre-dame",
    name: "Saigon Notre Dame Cathedral",
    vietnameseName: "Nhà thờ Đức Bà Sài Gòn",
    location: "01 Paris Commune, Ben Nghe Ward, District 1, Ho Chi Minh City",
    openingHours: "8:00 AM – 10:30 AM & 2:30 PM – 3:30 PM (Mon–Fri)",
    distanceFromVenue: "~650 m (8 mins walk)",
    badge: "Architectural Marvel",
    description:
      "Established between 1863 and 1880, this neo-Romanesque cathedral features twin 58-meter bell towers built entirely from imported French red bricks that have retained their warm color for over a century.",
    image: "/images/attractions/notre-dame.jpg",
    mapsQuery: "Notre+Dame+Cathedral+Saigon",
  },
  {
    id: "fine-arts",
    name: "Ho Chi Minh City Museum of Fine Arts",
    vietnameseName: "Bảo tàng Mỹ thuật TP. Hồ Chí Minh",
    location: "97A Pho Duc Chinh Street, Nguyen Thai Binh Ward, District 1",
    openingHours: "8:00 AM – 5:00 PM (Open daily)",
    distanceFromVenue: "~1.2 km (15 mins walk / 5 mins taxi)",
    badge: "Art & Culture",
    description:
      "Housed in a gorgeous yellow French-Chinese Art Deco colonial mansion, showcasing masterpieces of Vietnamese painting, historic silk paintings, contemporary sculptures, and lacquer art.",
    image: "/images/attractions/fine-arts.jpg",
    mapsQuery: "Ho+Chi+Minh+City+Museum+of+Fine+Arts",
  },
  {
    id: "independence-palace",
    name: "Independence Palace",
    vietnameseName: "Dinh Độc Lập / Hội trường Thống Nhất",
    location: "135 Nam Ky Khoi Nghia Street, Ben Thanh Ward, District 1",
    openingHours: "8:30 AM – 4:30 PM (Open daily)",
    distanceFromVenue: "~1.1 km (14 mins walk / 4 mins taxi)",
    badge: "National Monument",
    description:
      "A landmark of Vietnamese modern history with 1960s modernist architecture designed by Ngo Viet Thu. Features expansive reception chambers, presidential offices, and historic underground telecommunication bunkers.",
    image: "/images/attractions/independence-palace.jpg",
    mapsQuery: "Independence+Palace+Ho+Chi+Minh",
  },
  {
    id: "war-museum",
    name: "War Remnants Museum",
    vietnameseName: "Bảo tàng Chứng tích Chiến tranh",
    location: "28 Vo Van Tan Street, Vo Thi Sau Ward, District 3",
    openingHours: "7:30 AM – 5:30 PM (Open daily)",
    distanceFromVenue: "~2.0 km (8 mins taxi / Grab)",
    badge: "Historical Insight",
    description:
      "One of Vietnam's most visited museums, offering deep insights into the nation's wartime past, international peace movements, historic military aircraft displays, and Pulitzer-winning photojournalism collections.",
    image: "/images/attractions/war-museum.jpg",
    mapsQuery: "War+Remnants+Museum+Ho+Chi+Minh",
  },
  {
    id: "nguyen-hue",
    name: "Nguyen Hue Walking Street",
    vietnameseName: "Phố đi bộ Nguyễn Huệ",
    location: "Nguyen Hue Boulevard, Ben Nghe Ward, District 1",
    openingHours: "Open 24/7 (Most vibrant in evenings from 6:00 PM)",
    distanceFromVenue: "150 m (2 mins walk from Sheraton)",
    badge: "Steps from Venue",
    description:
      "A grand 64-meter-wide pedestrian promenade stretching from Saigon City Hall to Bach Dang Riverfront. Filled with live street performances, ambient lighting, coffee shops, and panoramic skyline vistas.",
    image: "/images/attractions/nguyen-hue.jpg",
    mapsQuery: "Nguyen+Hue+Walking+Street+Ho+Chi+Minh",
  },
  {
    id: "cu-chi",
    name: "Cu Chi Tunnels",
    vietnameseName: "Địa đạo Củ Chi",
    location: "TL15, Phu Hiep, Cu Chi District, Ho Chi Minh City",
    openingHours: "8:00 AM – 5:00 PM (7 days a week)",
    distanceFromVenue: "~55 km (Recommended half-day tour)",
    badge: "Subterranean Legend",
    description:
      "An immense 250-km interconnected underground tunnel network demonstrating legendary human ingenuity and resilience. A world-famous excursion accessible via guided bus or scenic Saigon River speedboat.",
    image: "/images/attractions/cu-chi.jpg",
    mapsQuery: "Cu+Chi+Tunnels+Phu+Hiep",
  },
];

