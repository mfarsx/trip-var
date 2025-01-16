import React from 'react';
import { Link } from 'react-router-dom';

import { Section, Feature, Testimonial } from '../components';

const commonStyles = {
  container: 'mx-auto max-w-7xl',
  grid: {
    base: 'grid grid-cols-1 gap-x-8 gap-y-10',
    cols3: 'sm:grid-cols-2 lg:grid-cols-3',
  },
};

const HomePage = () => {
  return (
    <div className="bg-white" role="main">
      <Section
        title="Welcome to TripVar"
        subtitle="Your AI-powered travel companion"
        centered
        className="bg-slate-900 relative overflow-hidden"
        titleClassName="text-white sm:text-6xl"
        subtitleClassName="text-slate-300 sm:text-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.emerald.100),theme(colors.slate.900))] opacity-20" />
        <div className="relative">
          <div className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
            <Link
              to="/travel-planner"
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg bg-emerald-500 px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-emerald-600 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 transition-all duration-200"
            >
              Plan Your Trip
            </Link>
            <Link
              to="/text-generator"
              className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg bg-slate-800 px-5 py-3 text-base font-semibold text-white shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-200"
            >
              Generate Text
            </Link>
          </div>
        </div>
      </Section>

      <Section className="bg-white">
        <div className={commonStyles.container}>
          <dl className={`${commonStyles.grid.base} ${commonStyles.grid.cols3}`} role="list">
            <div
              className="relative p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group"
              role="listitem"
            >
              <Feature
                icon="✈️"
                title="AI Travel Planning"
                description="Get personalized travel itineraries created by our advanced AI system"
              />
            </div>
            <div
              className="relative p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group"
              role="listitem"
            >
              <Feature
                icon="📝"
                title="Smart Text Generation"
                description="Generate high-quality text for various purposes using our AI models"
              />
            </div>
            <div
              className="relative p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all duration-200 group"
              role="listitem"
            >
              <Feature
                icon="🔒"
                title="Secure & Private"
                description="Your data is encrypted and protected with industry-standard security"
              />
            </div>
          </dl>
        </div>
      </Section>

      <Section>
        <div className={commonStyles.container}>
          <div className="mx-auto mt-16 flow-root sm:mt-20">
            <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
              <Testimonial
                content="This app has revolutionized how I plan my trips. The AI suggestions are spot-on!"
                author="Sarah Johnson"
                userRole="Travel Enthusiast"
                company="TripVar User"
              />
              <Testimonial
                content="The text generation feature is incredibly useful for creating content quickly."
                author="Mike Chen"
                userRole="Content Creator"
                company="TripVar User"
              />
              <Testimonial
                content="I love how the app combines AI technology with travel planning. It's genius!"
                author="Emma Davis"
                userRole="Travel Blogger"
                company="TripVar User"
              />
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default HomePage;
