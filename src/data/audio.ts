export interface AudioLecture {
    id: string
    title: string
    speaker: string
    description: string
    duration: string
    category: string
    publishedAt: string
    audioUrl: string
    downloadUrl: string
    image: string
    tags: string[]
    featured: boolean
    plays: number
  }
  
  export const audioLectures: AudioLecture[] = [
    {
      id: "1",
      title: "The Night Journey (Isra and Mi'raj)",
      speaker: "Sheikh Muhammad Al-Shareef",
      description:
        "A detailed explanation of the Prophet's miraculous night journey from Mecca to Jerusalem and his ascension to the heavens.",
      duration: "45:32",
      category: "seerah",
      publishedAt: "2024-01-20",
      audioUrl: "/audio/night-journey.mp3",
      downloadUrl: "/downloads/night-journey.mp3",
      image: "/placeholder.svg?height=300&width=300",
      tags: ["prophet", "miracle", "journey", "seerah"],
      featured: true,
      plays: 15420,
    },
    {
      id: "2",
      title: "Patience in Times of Trial",
      speaker: "Dr. Yasmin Mogahed",
      description: "Finding strength and wisdom through Islamic teachings during life's most challenging moments.",
      duration: "38:15",
      category: "spirituality",
      publishedAt: "2024-01-18",
      audioUrl: "/audio/patience-trials.mp3",
      downloadUrl: "/downloads/patience-trials.mp3",
      image: "/placeholder.svg?height=300&width=300",
      tags: ["patience", "trials", "spirituality", "wisdom"],
      featured: true,
      plays: 12890,
    },
    {
      id: "3",
      title: "Understanding Tawheed",
      speaker: "Imam Suhaib Webb",
      description: "A comprehensive explanation of the concept of monotheism in Islam and its practical implications.",
      duration: "52:18",
      category: "aqeedah",
      publishedAt: "2024-01-15",
      audioUrl: "/audio/tawheed.mp3",
      downloadUrl: "/downloads/tawheed.mp3",
      image: "/placeholder.svg?height=300&width=300",
      tags: ["tawheed", "monotheism", "aqeedah", "faith"],
      featured: false,
      plays: 9876,
    },
    {
      id: "4",
      title: "The Etiquettes of Seeking Knowledge",
      speaker: "Sheikh Hamza Yusuf",
      description: "Islamic principles and manners for students seeking religious and worldly knowledge.",
      duration: "41:27",
      category: "education",
      publishedAt: "2024-01-12",
      audioUrl: "/audio/seeking-knowledge.mp3",
      downloadUrl: "/downloads/seeking-knowledge.mp3",
      image: "/placeholder.svg?height=300&width=300",
      tags: ["knowledge", "education", "etiquettes", "learning"],
      featured: true,
      plays: 8765,
    },
    {
      id: "5",
      title: "Ramadan: A Month of Transformation",
      speaker: "Ustadha Ieasha Prime",
      description: "Maximizing the spiritual benefits of Ramadan through proper preparation and mindful practice.",
      duration: "36:44",
      category: "worship",
      publishedAt: "2024-01-10",
      audioUrl: "/audio/ramadan-transformation.mp3",
      downloadUrl: "/downloads/ramadan-transformation.mp3",
      image: "/placeholder.svg?height=300&width=300",
      tags: ["ramadan", "fasting", "spirituality", "transformation"],
      featured: false,
      plays: 11234,
    },
    {
      id: "6",
      title: "Marriage in Islam: Rights and Responsibilities",
      speaker: "Dr. Altaf Husain",
      description: "Understanding the Islamic perspective on marriage, family life, and the rights of spouses.",
      duration: "49:33",
      category: "family",
      publishedAt: "2024-01-08",
      audioUrl: "/audio/marriage-islam.mp3",
      downloadUrl: "/downloads/marriage-islam.mp3",
      image: "/placeholder.svg?height=300&width=300",
      tags: ["marriage", "family", "rights", "relationships"],
      featured: false,
      plays: 7654,
    },
  ]
  