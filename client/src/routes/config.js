import HomePage from "../pages/HomePage";
import TextGeneratorPage from "../pages/TextGeneratorPage";
import TravelPlannerPage from "../pages/TravelPlannerPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ProfilePage from "../pages/ProfilePage";

export const ROUTES = {
  // Public routes
  public: [
    {
      path: "/login",
      component: LoginPage,
    },
    {
      path: "/signup",
      component: SignupPage,
    },
  ],
  
  // Private routes
  private: [
    {
      path: "/",
      component: HomePage,
    },
    {
      path: "/text-generator",
      component: TextGeneratorPage,
    },
    {
      path: "/travel-planner",
      component: TravelPlannerPage,
    },
    {
      path: "/profile",
      component: ProfilePage,
    },
  ],
};
