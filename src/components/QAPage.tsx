"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Search, Filter, MessageCircle, ThumbsUp, Share2, User, Calendar, Star, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { qaItems } from "@/data/qa"

export default function QAPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showAskForm, setShowAskForm] = useState(false)
  const [newQuestion, setNewQuestion] = useState("")

  const categories = [
    { id: "all", name: "All Questions", count: qaItems.length },
    { id: "worship", name: "Worship & Prayer", count: qaItems.filter((q) => q.category === "worship").length },
    {
      id: "contemporary",
      name: "Contemporary Issues",
      count: qaItems.filter((q) => q.category === "contemporary").length,
    },
    { id: "spirituality", name: "Spirituality", count: qaItems.filter((q) => q.category === "spirituality").length },
    { id: "hajj", name: "Hajj & Umrah", count: qaItems.filter((q) => q.category === "hajj").length },
    { id: "finance", name: "Islamic Finance", count: qaItems.filter((q) => q.category === "finance").length },
    { id: "family", name: "Family & Marriage", count: qaItems.filter((q) => q.category === "family").length },
  ]

  const filteredQA = qaItems.filter((qa) => {
    const matchesCategory = selectedCategory === "all" || qa.category === selectedCategory
    const matchesSearch =
      qa.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qa.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qa.scholar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qa.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const featuredQA = qaItems.filter((qa) => qa.featured)
  const popularQA = qaItems.sort((a, b) => b.likes - a.likes).slice(0, 5)

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle question submission
    console.log("New question:", newQuestion)
    setNewQuestion("")
    setShowAskForm(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Questions & Answers</h1>
            <p className="text-xl text-blue-100 mb-8">
              Get authentic Islamic answers from qualified scholars and learn from the community's questions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-gray-900 bg-white border-0 focus:ring-2 focus:ring-white"
                />
              </div>

              <Button
                onClick={() => setShowAskForm(!showAskForm)}
                className="bg-white text-primary hover:bg-gray-100 font-semibold px-6"
              >
                <Plus className="mr-2 h-5 w-5" />
                Ask Question
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Ask Question Form */}
        {showAskForm && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <Textarea
                  placeholder="Type your Islamic question here. Be specific and clear to get the best answer from our scholars."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="min-h-32"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={!newQuestion.trim()}>
                    Submit Question
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAskForm(false)}>
                    Cancel
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Your question will be reviewed by our scholars and answered within 24-48 hours.
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Featured Q&A Section */}
        {selectedCategory === "all" && !searchTerm && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredQA.slice(0, 2).map((qa) => (
                <Card key={qa.id} className="group hover:shadow-lg transition-shadow duration-300 border-primary/20">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {qa.question}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Answered by {qa.scholar}</span>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {qa.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-4 mb-4">{qa.answer}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {qa.likes}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(qa.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Link href={`/qa/${qa.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                          Read Full Answer
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
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                          {category.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Questions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5" />
                  Most Liked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularQA.map((qa) => (
                    <div key={qa.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                      <Link href={`/qa/${qa.id}`}>
                        <h4 className="font-medium text-sm hover:text-primary transition-colors line-clamp-2 mb-1">
                          {qa.question}
                        </h4>
                      </Link>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{qa.scholar}</span>
                        <div className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {qa.likes}
                        </div>
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
                {selectedCategory === "all" ? "All Questions" : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {filteredQA.length} question{filteredQA.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="space-y-6">
              {filteredQA.map((qa) => (
                <Card key={qa.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <MessageCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {qa.question}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Answered by {qa.scholar}
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {qa.category}
                          </Badge>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(qa.publishedAt).toLocaleDateString()}
                          </div>
                          {qa.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 line-clamp-4">{qa.answer}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {qa.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          {qa.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-primary">
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                      <Link href={`/qa/${qa.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                          Read Full Answer
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredQA.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MessageCircle className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
