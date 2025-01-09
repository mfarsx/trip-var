import React from "react";
import { withErrorHandling } from "../utils/error";

export function ProfilePage() {
  return (
    <div>
      <h1>Profile Page</h1>
      {/* Add your profile page content */}
    </div>
  );
}

export default withErrorHandling(ProfilePage, "profile");
