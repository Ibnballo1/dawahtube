export interface QAItem {
    id: string
    question: string
    answer: string
    scholar: string
    category: string
    publishedAt: string
    tags: string[]
    featured: boolean
    likes: number
  }
  
  export const qaItems: QAItem[] = [
    {
      id: "1",
      question: "What is the correct way to perform Wudu (ablution)?",
      answer:
        "Wudu is performed in the following order: 1) Make intention (niyyah), 2) Say Bismillah, 3) Wash hands three times, 4) Rinse mouth three times, 5) Rinse nose three times, 6) Wash face three times, 7) Wash arms up to elbows three times (right then left), 8) Wipe head once, 9) Wipe ears once, 10) Wash feet up to ankles three times (right then left). Each step should be done thoroughly while making du'a.",
      scholar: "Sheikh Ahmad Al-Fiqhi",
      category: "worship",
      publishedAt: "2024-01-21",
      tags: ["wudu", "ablution", "purification", "prayer"],
      featured: true,
      likes: 245,
    },
    {
      id: "2",
      question: "Is it permissible to listen to music in Islam?",
      answer:
        "This is a matter where scholars have different opinions. The majority of classical scholars consider musical instruments to be prohibited, while vocals without instruments (nasheed) are generally considered permissible. However, some contemporary scholars have more lenient views. It's best to avoid music that promotes immoral behavior and to focus on content that brings you closer to Allah. When in doubt, it's safer to choose alternatives like Quran recitation or Islamic nasheeds.",
      scholar: "Dr. Yasir Qadhi",
      category: "contemporary",
      publishedAt: "2024-01-19",
      tags: ["music", "halal", "haram", "entertainment"],
      featured: true,
      likes: 189,
    },
    {
      id: "3",
      question: "How should I deal with anxiety and depression from an Islamic perspective?",
      answer:
        "Islam provides comprehensive guidance for mental health. First, maintain your connection with Allah through regular prayer, dhikr, and Quran recitation. The Prophet (peace be upon him) taught us specific du'as for anxiety. Seek professional help when needed - Islam encourages seeking treatment. Practice gratitude, help others, and maintain good relationships. Remember that trials are tests from Allah and opportunities for spiritual growth. Don't hesitate to combine Islamic practices with professional mental health care.",
      scholar: "Dr. Rania Awaad",
      category: "spirituality",
      publishedAt: "2024-01-17",
      tags: ["mental health", "anxiety", "depression", "spirituality"],
      featured: false,
      likes: 312,
    },
    {
      id: "4",
      question: "What are the conditions for Hajj to be obligatory?",
      answer:
        "Hajj becomes obligatory when five conditions are met: 1) Being Muslim, 2) Being of sound mind (sane), 3) Having reached puberty, 4) Being physically able to perform Hajj, and 5) Having the financial means to afford the journey and support dependents during absence. If these conditions are met, Hajj becomes a religious obligation that should be fulfilled as soon as reasonably possible. Those who cannot afford it or are physically unable are not required to perform Hajj.",
      scholar: "Sheikh Saleh Al-Fawzan",
      category: "hajj",
      publishedAt: "2024-01-15",
      tags: ["hajj", "pilgrimage", "obligations", "conditions"],
      featured: true,
      likes: 156,
    },
    {
      id: "5",
      question: "Can women lead prayer when only women are present?",
      answer:
        "Yes, according to the majority of scholars, a woman can lead other women in prayer when only women are present. The female imam should stand in the middle of the first row rather than in front. This is based on authentic hadiths showing that Aisha (may Allah be pleased with her) and other female companions led women in prayer. However, in mixed gatherings, the imam should be male. This ruling applies to both obligatory and voluntary prayers.",
      scholar: "Dr. Ingrid Mattson",
      category: "worship",
      publishedAt: "2024-01-13",
      tags: ["women", "prayer", "imam", "leadership"],
      featured: false,
      likes: 203,
    },
    {
      id: "6",
      question: "What is the Islamic ruling on cryptocurrency and Bitcoin?",
      answer:
        "Cryptocurrency is a contemporary issue with varying scholarly opinions. Key considerations include: 1) Excessive uncertainty (gharar) in value, 2) Speculative nature resembling gambling, 3) Lack of intrinsic value, 4) Use in illegal activities. Some scholars permit it as a digital asset, while others prohibit it due to excessive speculation. If using cryptocurrency, ensure: it's for legitimate purposes, avoid excessive speculation, understand the technology, and consult knowledgeable scholars. The safest approach is to avoid highly speculative trading.",
      scholar: "Dr. Monzer Kahf",
      category: "finance",
      publishedAt: "2024-01-11",
      tags: ["cryptocurrency", "bitcoin", "finance", "halal"],
      featured: true,
      likes: 278,
    },
  ]
  