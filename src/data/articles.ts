export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  publishedAt: string;
  readTime: number;
  image: string;
  tags: string[];
  featured: boolean;
}

export const articles: Article[] = [
  {
    id: "1",
    title: "Understanding the Five Pillars of Islam",
    excerpt:
      "A comprehensive guide to the fundamental practices that form the foundation of Islamic faith and worship.",
    content:
      "The Five Pillars of Islam are the foundation of Muslim life. They are the testimony of faith (shahada), prayer (salah), giving zakat (charity), fasting during Ramadan (sawm), and the pilgrimage to Mecca (hajj)...",
    author: "Dr. Ahmad Hassan",
    category: "aqeedah",
    publishedAt: "2024-01-15",
    readTime: 8,
    image: "/images/dawahtube-logo.png",
    tags: ["pillars", "faith", "worship", "basics"],
    featured: true,
  },
  {
    id: "2",
    title: "The Beautiful Names of Allah (Asma ul-Husna)",
    excerpt:
      "Exploring the 99 beautiful names of Allah and their profound meanings in our daily spiritual journey.",
    content:
      "Allah has 99 beautiful names, each reflecting His perfect attributes. Understanding these names helps us develop a deeper connection with our Creator...",
    author: "Sheikh Fatima Al-Zahra",
    category: "aqeedah",
    publishedAt: "2024-01-12",
    readTime: 12,
    image: "/images/dawahtube-logo.png",
    tags: ["names", "attributes", "spirituality"],
    featured: true,
  },
  {
    id: "3",
    title: "Prophetic Medicine: Natural Healing in Islam",
    excerpt:
      "Discover the wisdom of prophetic medicine and natural remedies mentioned in Islamic traditions.",
    content:
      "The Prophet Muhammad (peace be upon him) provided guidance not only for spiritual matters but also for physical health and well-being...",
    author: "Dr. Yusuf Ibrahim",
    category: "hadith",
    publishedAt: "2024-01-10",
    readTime: 10,
    image: "/images/dawahtube-logo.png",
    tags: ["medicine", "health", "sunnah", "natural"],
    featured: false,
  },
  {
    id: "4",
    title: "The Art of Dhikr: Remembrance of Allah",
    excerpt:
      "Learn about the various forms of dhikr and how remembrance of Allah can transform your spiritual state.",
    content:
      "Dhikr, the remembrance of Allah, is one of the most powerful spiritual practices in Islam. It purifies the heart and brings peace to the soul...",
    author: "Imam Abdullah Rahman",
    category: "spirituality",
    publishedAt: "2024-01-08",
    readTime: 6,
    image: "/images/dawahtube-logo.png",
    tags: ["dhikr", "remembrance", "spirituality", "peace"],
    featured: false,
  },
  {
    id: "5",
    title: "Islamic Finance: Principles and Modern Applications",
    excerpt:
      "Understanding Sharia-compliant financial principles and their application in contemporary banking and investment.",
    content:
      "Islamic finance is based on principles derived from the Quran and Sunnah, emphasizing ethical and equitable financial practices...",
    author: "Dr. Aisha Malik",
    category: "contemporary",
    publishedAt: "2024-01-05",
    readTime: 15,
    image: "/images/dawahtube-logo.png",
    tags: ["finance", "banking", "halal", "economics"],
    featured: true,
  },
  {
    id: "6",
    title: "The Golden Age of Islamic Civilization",
    excerpt:
      "Exploring the remarkable achievements of Muslim scholars, scientists, and philosophers during Islam's golden age.",
    content:
      "The Islamic Golden Age (8th to 13th centuries) was a period of remarkable intellectual and cultural flourishing in the Muslim world...",
    author: "Prof. Omar Al-Andalusi",
    category: "history",
    publishedAt: "2024-01-03",
    readTime: 20,
    image: "/images/dawahtube-logo.png",
    tags: ["history", "civilization", "science", "culture"],
    featured: false,
  },
];

export const categories = [
  { id: "all", name: "All Categories", count: articles.length },
  {
    id: "aqeedah",
    name: "Aqeedah",
    count: articles.filter((a) => a.category === "aqeedah").length,
  },
  {
    id: "hadith",
    name: "Hadith",
    count: articles.filter((a) => a.category === "hadith").length,
  },
  {
    id: "fiqh",
    name: "Fiqh",
    count: articles.filter((a) => a.category === "fiqh").length,
  },
  {
    id: "quran",
    name: "Quran Studies",
    count: articles.filter((a) => a.category === "quran").length,
  },
  {
    id: "history",
    name: "Islamic History",
    count: articles.filter((a) => a.category === "history").length,
  },
  {
    id: "contemporary",
    name: "Contemporary Issues",
    count: articles.filter((a) => a.category === "contemporary").length,
  },
  {
    id: "spirituality",
    name: "Spirituality",
    count: articles.filter((a) => a.category === "spirituality").length,
  },
];
