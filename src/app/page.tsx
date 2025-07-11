import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <section className="bg-white py-12 px-4 md:px-8">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold text-primary">
          Welcome to Da'wahTube
        </h1>
        <p className="text-gray-700 text-base md:text-lg">
          Your gateway to Islamic knowledge — articles, lectures, and news to uplift your understanding of Islam.
        </p>
        <Button asChild className="mt-4">
          <Link href="/articles">Start Learning</Link>
        </Button>
      </div>

      {/* Featured Sections */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {[
          {
            title: "Articles",
            description: "Deep Islamic teachings, stories, and lessons from trusted sources.",
            href: "/articles",
          },
          {
            title: "Audio",
            description: "Listen to inspiring Islamic lectures — stream or download.",
            href: "/audio",
          },
          {
            title: "News",
            description: "Stay informed with current affairs from the Islamic world.",
            href: "/news",
          },
        ].map((section) => (
          <Link href={section.href} key={section.title}>
            <Card className="hover:shadow-lg transition-all h-full">
              <CardContent className="p-6 space-y-3">
                <h2 className="text-xl font-semibold text-secondary">{section.title}</h2>
                <p className="text-sm text-gray-600">{section.description}</p>
                <span className="text-primary font-medium">Explore →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
