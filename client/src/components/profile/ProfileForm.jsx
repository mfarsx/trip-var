import { ProfileInput } from "./ProfileInput";

export function ProfileForm({ formData, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ProfileInput
        label="Display Name"
        id="displayName"
        value={formData.displayName}
        onChange={onChange}
      />

      <ProfileInput
        label="Email"
        type="email"
        id="email"
        value={formData.email}
        onChange={onChange}
      />

      <ProfileInput
        label="Current Password"
        type="password"
        id="currentPassword"
        value={formData.currentPassword}
        onChange={onChange}
      />

      <ProfileInput
        label="New Password"
        type="password"
        id="newPassword"
        value={formData.newPassword}
        onChange={onChange}
      />

      <ProfileInput
        label="Confirm New Password"
        type="password"
        id="confirmNewPassword"
        value={formData.confirmNewPassword}
        onChange={onChange}
      />

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
}
