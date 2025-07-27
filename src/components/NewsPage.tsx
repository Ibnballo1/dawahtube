"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  Globe,
  Users,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { newsItems } from "@/data/news";
import Image from "next/image";

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { id: "all", name: "All News", count: newsItems.length, icon: Globe },
    {
      id: "community",
      name: "Community",
      count: newsItems.filter((n) => n.category === "community").length,
      icon: Users,
    },
    {
      id: "events",
      name: "Events",
      count: newsItems.filter((n) => n.category === "events").length,
      icon: Calendar,
    },
    {
      id: "charity",
      name: "Charity",
      count: newsItems.filter((n) => n.category === "charity").length,
      icon: TrendingUp,
    },
    {
      id: "education",
      name: "Education",
      count: newsItems.filter((n) => n.category === "education").length,
      icon: BookOpen,
    },
    {
      id: "interfaith",
      name: "Interfaith",
      count: newsItems.filter((n) => n.category === "interfaith").length,
      icon: Users,
    },
    {
      id: "youth",
      name: "Youth",
      count: newsItems.filter((n) => n.category === "youth").length,
      icon: Users,
    },
  ];

  const filteredNews = newsItems.filter((news) => {
    const matchesCategory =
      selectedCategory === "all" || news.category === selectedCategory;
    const matchesSearch =
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const featuredNews = newsItems.filter((news) => news.featured);
  const latestNews = newsItems.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Islamic News
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Stay updated with the latest news and developments from the global
              Muslim community.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-gray-900 bg-white border-0 focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured News Section */}
        {selectedCategory === "all" && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Featured News
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredNews.map((news) => (
                <Card
                  key={news.id}
                  className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="aspect-video bg-gradient-to-br from-primary-light to-primary overflow-hidden relative">
                    <Image
                      src={news.image || "/placeholder.svg"}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      width={300}
                      height={200}
                    />
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                      Breaking
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {news.category}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(news.publishedAt).toLocaleDateString()}
                      </div>
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
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <IconComponent className="h-4 w-4 mr-2" />
                            <span>{category.name}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-gray-200 text-gray-700"
                          >
                            {category.count}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Latest News Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestNews.map((news) => (
                    <div
                      key={news.id}
                      className="border-b border-gray-100 last:border-0 pb-3 last:pb-0"
                    >
                      <Link href={`/news/${news.id}`}>
                        <h4 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2">
                          {news.title}
                        </h4>
                      </Link>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(news.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "All News"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {filteredNews.length} article
                {filteredNews.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid gap-6">
              {filteredNews.map((news, index) => (
                <Card
                  key={news.id}
                  className="group hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className={`${index === 0 ? "md:flex" : "md:flex"}`}>
                    <div className={`${index === 0 ? "md:w-1/2" : "md:w-1/3"}`}>
                      <div className="aspect-video bg-gradient-to-br from-primary-light to-primary overflow-hidden">
                        <Image
                          src={news.image || "/placeholder.svg"}
                          alt={news.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={200}
                        />
                      </div>
                    </div>
                    <div className={`${index === 0 ? "md:w-1/2" : "md:w-2/3"}`}>
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            {news.category}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(news.publishedAt).toLocaleDateString()}
                          </div>
                          {news.featured && (
                            <Badge className="bg-red-100 text-red-800">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardTitle
                          className={`${
                            index === 0 ? "text-2xl" : "text-xl"
                          } group-hover:text-primary transition-colors`}
                        >
                          {news.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {news.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {news.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
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
                              Read Full Story
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredNews.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No news found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
