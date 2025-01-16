import React from "react";
import { useAuth } from "../hooks/useAuth.js";
import { withErrorHandling } from "../utils/error";
import { Feature } from "../components/Feature";
import { Testimonial } from "../components/Testimonial";
import { Button } from "../components/ui/Button";
import { Section } from "../components/ui/Section";
import { HeroPattern } from "../components/ui/HeroPattern";
import { FeaturePill } from "../components/ui/FeaturePill";
import { StatsCard } from "../components/ui/StatsCard";
import { CTASection } from "../components/sections/CTASection";
import { stats, features, testimonials } from "../constants/homePageData";
import { commonStyles } from "../constants/styles";
import "../styles/HomePage.css";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <Section className="relative overflow-hidden">
        <HeroPattern />

        <div className="text-center">
          <h1 className={commonStyles.heading.h1}>
            <span className="block xl:inline">Transform your content with</span>{" "}
            <span className={`block ${commonStyles.text.accent} xl:inline`}>
              Tripvar AI
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Experience the next generation of AI-powered content creation. Fast,
            accurate, and tailored to your needs.
          </p>

          {/* Feature Pills */}
          <div className="mt-8 flex justify-center space-x-4 animate-float">
            <FeaturePill icon="🚀" text="Lightning Fast" variant="indigo" />
            <FeaturePill icon="🎯" text="High Accuracy" variant="green" />
            <FeaturePill icon="🔒" text="Enterprise Security" variant="purple" />
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
            <div className="rounded-md shadow">
              <Button
                to={user ? "/text-generator" : "/signup"}
                variant="primary"
              >
                {user ? "Start Creating" : "Get Started"}
              </Button>
            </div>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Button to="/test" variant="secondary">
                Try Demo
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section>
        <StatsCard stats={stats} />
      </Section>

      {/* Features Section */}
      <Section
        title="Everything you need to create amazing content"
        subtitle="Powerful features to help you create, collaborate, and succeed"
        centered
      >
        <div
          className={`mt-12 ${commonStyles.grid.base} ${commonStyles.grid.cols4}`}
        >
          {features.map((feature) => (
            <Feature key={feature.title} {...feature} />
          ))}
        </div>
      </Section>

      {/* Testimonials Section */}
      <Section title="Trusted by industry leaders" centered>
        <div
          className={`mt-12 ${commonStyles.grid.base} ${commonStyles.grid.cols2}`}
        >
          {testimonials.map((testimonial) => (
            <Testimonial key={testimonial.author} {...testimonial} />
          ))}
        </div>
      </Section>

      {/* CTA Section */}
      <CTASection
        user={user}
        title="Ready to get started?"
        subtitle="Start your free trial today."
        buttonText={user ? "Go to Dashboard" : "Sign up for free"}
      />
    </div>
  );
}

export default withErrorHandling(HomePage, "home");
