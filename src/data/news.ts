export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  author: string;
  image: string;
  tags: string[];
  featured: boolean;
}

export const newsItems: NewsItem[] = [
  {
    id: "1",
    title: "New Islamic Center Opens in Downtown Community",
    excerpt:
      "A state-of-the-art Islamic center featuring prayer halls, educational facilities, and community spaces officially opens its doors.",
    content:
      "The new Islamic Center of Downtown officially opened its doors last weekend, marking a significant milestone for the local Muslim community...",
    category: "community",
    publishedAt: "2024-01-22",
    author: "Sarah Ahmed",
    image: "/images/dawahtube-logo.png",
    tags: ["community", "mosque", "opening", "local"],
    featured: true,
  },
  {
    id: "2",
    title: "International Quran Recitation Competition Announced",
    excerpt:
      "Young reciters from around the world will compete in the annual international Quran recitation championship.",
    content:
      "The International Islamic Foundation has announced the dates for this year's global Quran recitation competition...",
    category: "events",
    publishedAt: "2024-01-20",
    author: "Ahmed Hassan",
    image: "/images/dawahtube-logo.png",
    tags: ["quran", "competition", "international", "youth"],
    featured: true,
  },
  {
    id: "3",
    title: "Ramadan Food Drive Collects Record Donations",
    excerpt:
      "Local mosques collaborate to organize the largest food drive in the city's history, helping thousands of families.",
    content:
      "This year's Ramadan food drive has broken all previous records, collecting over 50,000 pounds of food and raising $100,000...",
    category: "charity",
    publishedAt: "2024-01-18",
    author: "Fatima Al-Zahra",
    image: "/images/dawahtube-logo.png",
    tags: ["ramadan", "charity", "food drive", "community"],
    featured: false,
  },
  {
    id: "4",
    title: "New Islamic Studies Program Launched at University",
    excerpt:
      "Major university introduces comprehensive Islamic Studies program with renowned scholars joining the faculty.",
    content:
      "The University has announced the launch of a new Islamic Studies program, bringing together world-renowned scholars...",
    category: "education",
    publishedAt: "2024-01-15",
    author: "Dr. Omar Suleiman",
    image: "/images/dawahtube-logo.png",
    tags: ["education", "university", "islamic studies", "academia"],
    featured: false,
  },
  {
    id: "5",
    title: "Interfaith Dialogue Summit Promotes Understanding",
    excerpt:
      "Religious leaders from various faiths gather to discuss common values and promote peaceful coexistence.",
    content:
      "The annual Interfaith Dialogue Summit brought together leaders from different religious communities...",
    category: "interfaith",
    publishedAt: "2024-01-12",
    author: "Imam Abdullah",
    image: "/images/dawahtube-logo.png",
    tags: ["interfaith", "dialogue", "peace", "understanding"],
    featured: true,
  },
  {
    id: "6",
    title: "Youth Islamic Leadership Conference Set for Summer",
    excerpt:
      "Young Muslim leaders will gather for intensive training in community leadership and Islamic principles.",
    content:
      "The Youth Islamic Leadership Conference will take place this summer, featuring workshops and seminars...",
    category: "youth",
    publishedAt: "2024-01-10",
    author: "Ustadha Aisha",
    image: "/images/dawahtube-logo.png",
    tags: ["youth", "leadership", "conference", "training"],
    featured: false,
  },
];
