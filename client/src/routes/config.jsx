import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import SignupPage from '../pages/SignupPage';
import TextGeneratorPage from '../pages/TextGeneratorPage';
import TravelPlannerPage from '../pages/TravelPlannerPage';

export const ROUTES = {
  public: [
    {
      path: '/login',
      component: LoginPage,
    },
    {
      path: '/signup',
      component: SignupPage,
    },
  ],
  private: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/profile',
      component: ProfilePage,
    },
    {
      path: '/text-generator',
      component: TextGeneratorPage,
    },
    {
      path: '/travel-planner',
      component: TravelPlannerPage,
    },
  ],
};
