"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  MessageCircle,
  Star,
  Clock,
  User,
  Play,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { articles } from "@/data/articles";
import { audioLectures } from "@/data/audio";
import { newsItems } from "@/data/news";
import { qaItems } from "@/data/qa";
import Image from "next/image";

export default function HomePage() {
  const featuredArticles = articles
    .filter((article) => article.featured)
    .slice(0, 3);
  const featuredAudio = audioLectures
    .filter((lecture) => lecture.featured)
    .slice(0, 3);
  const latestNews = newsItems.slice(0, 3);
  const popularQA = qaItems.filter((qa) => qa.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary-light text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-white to-primary-light bg-clip-text text-transparent">
                Da'wahTube
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Your trusted source for authentic Islamic knowledge, connecting
              hearts and minds to the beauty of Islam through education and
              guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-3"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Articles
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-primary font-semibold px-8 py-3 bg-transparent"
              >
                <Headphones className="mr-2 h-5 w-5" />
                Listen to Lectures
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                500+
              </div>
              <div className="text-gray-600">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                200+
              </div>
              <div className="text-gray-600">Audio Lectures</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                50K+
              </div>
              <div className="text-gray-600">Monthly Readers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                1000+
              </div>
              <div className="text-gray-600">Q&A Answered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Articles
              </h2>
              <p className="text-gray-600 text-lg">
                Discover insightful articles on Islamic teachings and
                contemporary issues
              </p>
            </div>
            <Link href="/articles">
              <Button
                variant="outline"
                className="hidden md:flex bg-transparent"
              >
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <Card
                key={article.id}
                className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-light to-primary overflow-hidden">
                  <Image
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={640}
                    height={360}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {article.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime} min read
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {article.author}
                    </div>
                    <Link href={`/articles/${article.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary-dark"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Audio Lectures */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Audio Lectures
              </h2>
              <p className="text-gray-600 text-lg">
                Listen to inspiring lectures from renowned Islamic scholars
              </p>
            </div>
            <Link href="/audio">
              <Button
                variant="outline"
                className="hidden md:flex bg-transparent"
              >
                View All Lectures
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredAudio.map((lecture) => (
              <Card
                key={lecture.id}
                className="group hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Image
                        src={lecture.image || "/placeholder.svg"}
                        alt={lecture.speaker}
                        className="w-16 h-16 rounded-full object-cover"
                        width={64}
                        height={64}
                      />
                      <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {lecture.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{lecture.speaker}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{lecture.duration}</span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {lecture.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{lecture.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest Islamic News
              </h2>
              <p className="text-gray-600 text-lg">
                Stay updated with the latest news from the Muslim community
              </p>
            </div>
            <Link href="/news">
              <Button
                variant="outline"
                className="hidden md:flex bg-transparent"
              >
                View All News
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestNews.map((news) => (
              <Card
                key={news.id}
                className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-br from-primary-light to-primary overflow-hidden">
                  <Image
                    src={news.image || "/placeholder.svg"}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    width={300}
                    height={360}
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      {news.category}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(news.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {news.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{news.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {news.author}
                    </div>
                    <Link href={`/news/${news.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary-dark"
                      >
                        Read More
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Q&A */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Popular Q&A
              </h2>
              <p className="text-gray-600 text-lg">
                Get answers to common Islamic questions from qualified scholars
              </p>
            </div>
            <Link href="/qa">
              <Button
                variant="outline"
                className="hidden md:flex bg-transparent"
              >
                View All Q&A
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-6">
            {popularQA.map((qa) => (
              <Card
                key={qa.id}
                className="group hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <MessageCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                        {qa.question}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Answered by {qa.scholar}</span>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          {qa.category}
                        </Badge>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500" />
                          {qa.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3">{qa.answer}</p>
                  <Link href={`/qa/${qa.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-primary hover:text-primary-dark"
                    >
                      Read Full Answer
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Community
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Subscribe to our newsletter and stay updated with the latest Islamic
            content, articles, and lectures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold px-8"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
