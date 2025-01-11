import React from "react";
import { useAuth } from "../hooks/useAuth";
import { withErrorHandling } from "../utils/error";
import { Feature } from "../components/Feature";
import { Testimonial } from "../components/Testimonial";
import { Button } from "../components/ui/Button";
import { Section } from "../components/ui/Section";
import { Card } from "../components/ui/Card";
import { stats, features, testimonials } from "../constants/homePageData";
import { commonStyles } from "../constants/styles";
import "../styles/HomePage.css";

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <Section className="relative overflow-hidden">
        <div className="hero-background">
          <div className="relative h-full max-w-7xl mx-auto">
            {/* Background SVG patterns */}
            <svg
              className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
              width="404"
              height="784"
              fill="none"
              viewBox="0 0 404 784"
            >
              <defs>
                <pattern
                  id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x="0"
                    y="0"
                    width="4"
                    height="4"
                    className="text-gray-200 dark:text-gray-700"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width="404"
                height="784"
                fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
              />
            </svg>
          </div>
        </div>

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
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              🚀 Lightning Fast
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              🎯 High Accuracy
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              🔒 Enterprise Security
            </span>
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
        <Card className="stats-grid">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p
                className={`text-2xl font-semibold ${commonStyles.text.accent}`}
              >
                {stat.value}
              </p>
              <p
                className={`mt-2 text-sm font-medium ${commonStyles.text.secondary}`}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </Card>
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
      <Section>
        <Card className="cta-section">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to get started?</span>
                <span className="block">Start your free trial today.</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-indigo-200">
                Join thousands of satisfied users who are already creating
                amazing content with Tripvar AI.
              </p>
              <Button
                to={user ? "/text-generator" : "/signup"}
                variant="secondary"
                className="mt-8"
              >
                {user ? "Go to Dashboard" : "Sign up for free"}
              </Button>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
}

export default withErrorHandling(HomePage, "home");
