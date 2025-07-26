"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Download, Search, Filter, Clock, Heart, Share2, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { audioLectures } from "@/data/audio"

interface AudioPlayerProps {
  lecture: (typeof audioLectures)[0]
  isPlaying: boolean
  onPlayPause: () => void
}

function AudioPlayer({ lecture, isPlaying, onPlayPause }: AudioPlayerProps) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(75)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = value[0] / 100
      setVolume(value[0])
    }
  }

  return (
    <Card className="sticky top-24 bg-gradient-to-r from-primary/5 to-primary-light/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-4">
          <img
            src={lecture.image || "/placeholder.svg"}
            alt={lecture.speaker}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <CardTitle className="text-lg">{lecture.title}</CardTitle>
            <p className="text-sm text-gray-600">{lecture.speaker}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <audio ref={audioRef} src="/audio/sample.mp3" />

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider value={[currentTime]} max={duration || 100} step={1} onValueChange={handleSeek} className="w-full" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{lecture.duration}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onPlayPause} className="w-12 h-12 rounded-full">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-32 ml-4">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" className="flex-1">
            <Heart className="h-4 w-4 mr-1" />
            Like
          </Button>
          <Button size="sm" variant="ghost" className="flex-1">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AudioPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentLecture, setCurrentLecture] = useState(audioLectures[0])
  const [isPlaying, setIsPlaying] = useState(false)

  const categories = [
    { id: "all", name: "All Categories", count: audioLectures.length },
    { id: "seerah", name: "Seerah", count: audioLectures.filter((l) => l.category === "seerah").length },
    { id: "aqeedah", name: "Aqeedah", count: audioLectures.filter((l) => l.category === "aqeedah").length },
    {
      id: "spirituality",
      name: "Spirituality",
      count: audioLectures.filter((l) => l.category === "spirituality").length,
    },
    { id: "education", name: "Education", count: audioLectures.filter((l) => l.category === "education").length },
    { id: "worship", name: "Worship", count: audioLectures.filter((l) => l.category === "worship").length },
    { id: "family", name: "Family", count: audioLectures.filter((l) => l.category === "family").length },
  ]

  const filteredLectures = audioLectures.filter((lecture) => {
    const matchesCategory = selectedCategory === "all" || lecture.category === selectedCategory
    const matchesSearch =
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePlayPause = (lecture?: (typeof audioLectures)[0]) => {
    if (lecture && lecture.id !== currentLecture.id) {
      setCurrentLecture(lecture)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Audio Lectures</h1>
            <p className="text-xl text-blue-100 mb-8">
              Listen to inspiring lectures from renowned Islamic scholars and teachers from around the world.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search lectures or speakers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-3 text-gray-900 bg-white border-0 focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4 space-y-6">
            {/* Audio Player */}
            <AudioPlayer lecture={currentLecture} isPlaying={isPlaying} onPlayPause={() => handlePlayPause()} />

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
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all" ? "All Lectures" : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {filteredLectures.length} lecture{filteredLectures.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid gap-6">
              {filteredLectures.map((lecture) => (
                <Card
                  key={lecture.id}
                  className={`group hover:shadow-lg transition-all duration-300 ${
                    currentLecture.id === lecture.id ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={lecture.image || "/placeholder.svg"}
                          alt={lecture.speaker}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                        <button
                          onClick={() => handlePlayPause(lecture)}
                          className="absolute inset-0 bg-primary/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {currentLecture.id === lecture.id && isPlaying ? (
                            <Pause className="h-6 w-6 text-white" />
                          ) : (
                            <Play className="h-6 w-6 text-white" />
                          )}
                        </button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                              {lecture.title}
                            </h3>
                            <p className="text-primary font-medium">{lecture.speaker}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {lecture.category}
                            </Badge>
                            {lecture.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">{lecture.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {lecture.duration}
                            </div>
                            <div className="flex items-center">
                              <Play className="h-4 w-4 mr-1" />
                              {lecture.plays.toLocaleString()} plays
                            </div>
                            <span>{new Date(lecture.publishedAt).toLocaleDateString()}</span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handlePlayPause(lecture)}
                              className={currentLecture.id === lecture.id && isPlaying ? "bg-primary-dark" : ""}
                            >
                              {currentLecture.id === lecture.id && isPlaying ? (
                                <Pause className="mr-2 h-4 w-4" />
                              ) : (
                                <Play className="mr-2 h-4 w-4" />
                              )}
                              {currentLecture.id === lecture.id && isPlaying ? "Pause" : "Play"}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          {lecture.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredLectures.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No lectures found</h3>
                <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
