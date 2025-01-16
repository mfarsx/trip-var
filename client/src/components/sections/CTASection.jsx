import PropTypes from 'prop-types';
import React from 'react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Section } from '../ui/Section';

export const CTASection = ({ user, title, subtitle, buttonText }) => (
  <Section>
    <Card className="cta-section">
      <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
        <div className="lg:self-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">{title}</span>
            <span className="block">{subtitle}</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            Join thousands of satisfied users who are already creating amazing content with Tripvar
            AI.
          </p>
          <Button to={user ? '/text-generator' : '/signup'} variant="secondary" className="mt-8">
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
  </Section>
);

CTASection.propTypes = {
  user: PropTypes.object,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string.isRequired,
};

export default CTASection;
