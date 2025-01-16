// Layout
export { Layout } from './Layout';

// UI Components
export { default as Button } from './ui/Button';
export { default as Section } from './ui/Section';
export { default as FormInput } from './forms/FormInput';
export { default as Alert } from './profile/Alert';
export { default as LoadingSpinner } from './ui/LoadingSpinner';
export { Card } from './ui/Card';
export { default as HeroPattern } from './ui/HeroPattern';
export { default as FeaturePill } from './ui/FeaturePill';
export { default as StatsCard } from './ui/StatsCard';

// Auth Components
export { default as LoginForm } from './auth/LoginForm';
export { default as SignupForm } from './auth/SignupForm';

// Profile Components
export { default as ProfileForm } from './profile/ProfileForm';
export { default as ProfileInput } from './profile/ProfileInput';

// Travel Components
export { default as TravelForm } from './travel/TravelForm';
export { default as TravelHeader } from './travel/TravelHeader';
export { default as TravelPlan } from './travel/TravelPlan';

// Feature Components
export { default as Feature } from './Feature';
export { default as Testimonial } from './Testimonial';

// Route Components
export { default as PrivateRoute } from './route/PrivateRoute';
export { default as PublicRoute } from './route/PublicRoute';

// Error Handling Components
export {
  ErrorBoundaryWithFallback as ErrorBoundary,
  ErrorFallback,
} from '../utils/error/errorHandler';

// Section Components
export { default as CTASection } from './sections/CTASection';

// Chat Components
export { default as ChatContainer } from './chat/ChatContainer';
