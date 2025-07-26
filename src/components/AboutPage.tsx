import {
  BookOpen,
  Users,
  Globe,
  Heart,
  Star,
  Award,
  Target,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Dr. Ahmad Hassan",
      role: "Chief Islamic Scholar",
      image: "/placeholder.svg?height=200&width=200",
      bio: "PhD in Islamic Studies from Al-Azhar University with 20+ years of teaching experience.",
      specialization: "Quran & Hadith Studies",
    },
    {
      name: "Sheikh Fatima Al-Zahra",
      role: "Senior Scholar",
      image: "/placeholder.svg?height=200&width=200",
      bio: "Renowned Islamic scholar specializing in women's issues and family guidance.",
      specialization: "Family & Women's Issues",
    },
    {
      name: "Imam Abdullah Rahman",
      role: "Community Outreach Director",
      image: "/placeholder.svg?height=200&width=200",
      bio: "Leading community programs and interfaith dialogue initiatives for over 15 years.",
      specialization: "Community Building",
    },
    {
      name: "Dr. Aisha Malik",
      role: "Contemporary Issues Specialist",
      image: "/placeholder.svg?height=200&width=200",
      bio: "Expert in Islamic finance and contemporary ethical issues in modern society.",
      specialization: "Islamic Finance & Ethics",
    },
  ];

  const values = [
    {
      icon: BookOpen,
      title: "Authentic Knowledge",
      description:
        "We provide only authentic Islamic knowledge based on Quran and Sunnah, verified by qualified scholars.",
    },
    {
      icon: Users,
      title: "Community Building",
      description:
        "Fostering a strong, supportive Muslim community through education and shared learning experiences.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Making Islamic knowledge accessible to Muslims worldwide, regardless of location or background.",
    },
    {
      icon: Heart,
      title: "Compassionate Guidance",
      description:
        "Providing guidance with wisdom, compassion, and understanding of modern challenges.",
    },
  ];

  const achievements = [
    { number: "500+", label: "Articles Published", icon: BookOpen },
    { number: "200+", label: "Audio Lectures", icon: Users },
    { number: "50K+", label: "Monthly Readers", icon: Globe },
    { number: "1000+", label: "Questions Answered", icon: Heart },
    { number: "25+", label: "Countries Reached", icon: Star },
    { number: "5+", label: "Years of Service", icon: Award },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-dark to-primary-light text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About Da'wahTube
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Connecting hearts and minds to the beauty of Islam through
              authentic education, compassionate guidance, and community
              building.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Target className="mr-3 h-8 w-8 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To provide authentic, accessible Islamic knowledge that
                  empowers Muslims to live according to Islamic principles while
                  navigating the challenges of modern life. We strive to build
                  bridges of understanding and create a supportive global
                  community of learners.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Eye className="mr-3 h-8 w-8 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  To become the world's most trusted platform for Islamic
                  education, where every Muslim can find reliable guidance,
                  connect with scholars, and grow in their faith journey. We
                  envision a world where Islamic knowledge is accessible to all,
                  fostering unity and understanding.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              These fundamental principles guide everything we do and shape our
              approach to Islamic education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-shadow duration-300"
                >
                  <CardHeader>
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Through Allah's blessing, we've been able to serve the Muslim
              community in meaningful ways.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {achievements.map((achievement, index) => {
              const IconComponent = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {achievement.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Scholars
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our team of qualified Islamic scholars and educators are dedicated
              to providing authentic guidance and knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="mx-auto w-32 h-32 rounded-full overflow-hidden mb-4">
                    <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      width={128}
                      height={128}
                    />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">{member.bio}</p>
                  <Badge variant="outline" className="text-xs">
                    {member.specialization}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Story
              </h2>
            </div>

            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-xl leading-relaxed mb-6">
                Da'wahTube was born from a simple yet profound vision: to make
                authentic Islamic knowledge accessible to every Muslim,
                regardless of their location, background, or level of Islamic
                education.
              </p>

              <p className="leading-relaxed mb-6">
                Founded in 2019 by a group of Islamic scholars and technology
                enthusiasts, our platform emerged from the recognition that the
                digital age presents both challenges and opportunities for
                Islamic education. While misinformation and confusion about
                Islamic teachings were spreading online, we saw the potential to
                use technology as a force for authentic Islamic guidance.
              </p>

              <p className="leading-relaxed mb-6">
                What started as a small collection of articles has grown into a
                comprehensive platform featuring hundreds of articles, audio
                lectures, news updates, and a thriving Q&A community. Our
                content is carefully curated and reviewed by qualified scholars
                to ensure authenticity and relevance to contemporary Muslim
                life.
              </p>

              <p className="leading-relaxed mb-6">
                Today, Da'wahTube serves Muslims in over 25 countries, with
                content available in multiple languages. We continue to expand
                our offerings while maintaining our commitment to authentic,
                scholarly-verified Islamic knowledge.
              </p>

              <p className="leading-relaxed">
                Our journey is far from over. As we look to the future, we
                remain committed to our mission of connecting hearts and minds
                to the beauty of Islam, one article, one lecture, and one
                answered question at a time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Get in Touch</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Have questions about our mission or want to contribute to our
            platform? We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@dawahtube.com"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/qa"
              className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Ask a Question
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
