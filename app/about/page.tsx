import { Header } from "app/header";
import {
  Brain,
  Search,
  Tag,
  Zap,
  Database,
  Shield,
  Layout,
  Globe,
} from "lucide-react";

import { StashAnimation } from "./stash-animation";

export const metadata = {
  title: "About Stashly - AI-Powered Bookmarking",
  description:
    "Learn how Stashly uses AI to organize your bookmarks with intelligent summaries and automatic tagging.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 sm:py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="text-center lg:text-left animate-fade-in-up">
                <h1 className="mb-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
                  Bookmarking, <span className="text-primary">Reimagined</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl lg:mx-0">
                  Stashly isn&apos;t just a place to save links. It&apos;s an
                  intelligent assistant that reads, analyzes, and organizes your
                  content for you.
                </p>
              </div>
              <div className="animate-scale-in">
                <StashAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-muted/50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Powered by Intelligence
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Brain className="h-10 w-10 text-primary" />}
                title="AI Analysis"
                description="AI analyzes every URL you save, understanding the context and content automatically."
              />
              <FeatureCard
                icon={<Layout className="h-10 w-10 text-primary" />}
                title="Smart Summaries"
                description="Get both concise and detailed summaries of articles, videos, and papers without opening them."
              />
              <FeatureCard
                icon={<Tag className="h-10 w-10 text-primary" />}
                title="Auto-Tagging"
                description="Content is automatically categorized with relevant tags, making organization effortless."
              />
              <FeatureCard
                icon={<Search className="h-10 w-10 text-primary" />}
                title="Full-Text Search"
                description="Search through the actual content of your bookmarks, not just the titles."
              />
              <FeatureCard
                icon={<Globe className="h-10 w-10 text-primary" />}
                title="URL Grounding"
                description="Uses Google Search Grounding to fetch the most up-to-date context for every link."
              />
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Instant Processing"
                description="Links are processed in seconds, giving you immediate access to insights."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-16 text-center text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <div className="relative mx-auto max-w-4xl">
              <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-border hidden md:block" />

              <TimelineItem
                step="1"
                title="Save a URL"
                description="Paste any link into Stashly. That&apos;s it. We handle the rest."
                align="left"
              />
              <TimelineItem
                step="2"
                title="Content Extraction"
                description="We fetch the page content, cleaning up clutter and ads."
                align="right"
              />
              <TimelineItem
                step="3"
                title="AI Processing"
                description="AI analyzes the text to generate a title, summary, and tags."
                align="left"
              />
              <TimelineItem
                step="4"
                title="Ready to Search"
                description="Your bookmark is saved and indexed, ready to be found instantly."
                align="right"
              />
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t bg-card py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-12 text-3xl font-bold tracking-tight sm:text-4xl">
              Built with Modern Tech
            </h2>
            <div className="flex flex-wrap justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Stack Auth</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <span className="font-semibold">Neon Postgres</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <span className="font-semibold">Google AI</span>
              </div>
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                <span className="font-semibold">Next.js 14</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="mb-4 inline-block rounded-xl bg-primary/10 p-3 transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function TimelineItem({
  step,
  title,
  description,
  align,
}: {
  step: string;
  title: string;
  description: string;
  align: "left" | "right";
}) {
  return (
    <div className={`relative mb-12 flex items-center justify-between md:mb-24 ${align === "left" ? "flex-row-reverse" : ""}`}>
      <div className="hidden w-5/12 md:block" />
      <div className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground font-bold shadow md:left-1/2 md:-translate-x-1/2">
        {step}
      </div>
      <div className="ml-16 w-full rounded-2xl border bg-card p-6 shadow-sm md:ml-0 md:w-5/12">
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
