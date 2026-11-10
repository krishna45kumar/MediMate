
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Palette,
  Trash2,
  Save,
  Moon,
  Sun,
} from "lucide-react";

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("Light");

  useEffect(() => {
    try {
      const savedProfile = JSON.parse(
        localStorage.getItem("userProfile") || "{}"
      );

      setProfile({
        name: savedProfile.name || "",
        email: savedProfile.email || "",
      });

      setNotifications(
        localStorage.getItem("medicineNotificationsEnabled") !== "false"
      );

      setTheme(localStorage.getItem("medimateTheme") || "Light");
    } catch (error) {
      console.error("Settings loading error:", error);
    }
  }, []);


function saveProfile() {
  const updatedProfile = {
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
  };

  if (!updatedProfile.name || !updatedProfile.email) {
    alert("Please enter your name and email.");
    return;
  }

  try {
    const loggedInUserId = localStorage.getItem("loggedInUser");

    const users = JSON.parse(
      localStorage.getItem("medimateUsers") || "[]"
    );

    const currentUserIndex = users.findIndex(
      (user) => String(user.id) === String(loggedInUserId)
    );

    if (currentUserIndex === -1) {
      alert("User account not found. Please login again.");
      return;
    }

    const emailAlreadyExists = users.some(
      (user, index) =>
        index !== currentUserIndex &&
        user.email.toLowerCase() === updatedProfile.email
    );

    if (emailAlreadyExists) {
      alert("This email is already used by another account.");
      return;
    }

    // Update registered account
    users[currentUserIndex] = {
      ...users[currentUserIndex],
      name: updatedProfile.name,
      email: updatedProfile.email,
    };

    localStorage.setItem("medimateUsers", JSON.stringify(users));

    // Update currently logged-in profile
    localStorage.setItem(
      "userProfile",
      JSON.stringify(updatedProfile)
    );

    setProfile(updatedProfile);

    alert("Profile updated successfully!");
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Unable to update profile.");
  }
}


  function toggleNotifications() {
    const updatedValue = !notifications;

    setNotifications(updatedValue);

    localStorage.setItem(
      "medicineNotificationsEnabled",
      String(updatedValue)
    );
  }

  function changeTheme(value) {
    setTheme(value);
    localStorage.setItem("medimateTheme", value);
    document.documentElement.dataset.theme = value.toLowerCase();
  }

  function clearMedicineData() {
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete your medicines and tracking history."
    );

    if (!confirmed) return;

    const keysToDelete = [
      "medicines",
      "medicineDoseHistory",
      "takenDoses",
      "doseTrackingDate",
      "weeklyMedicineHistory",
    ];

    keysToDelete.forEach((key) => localStorage.removeItem(key));

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("notifiedReminders-")) {
        localStorage.removeItem(key);
      }
    });

    alert("Medicine data cleared successfully!");
    window.location.assign("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Manage your profile and application preferences.
        </p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
            <User size={23} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">Profile Settings</h2>
            <p className="text-sm text-slate-500">
              Update your personal information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Full Name
            </label>

            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              placeholder="Enter your name"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              placeholder="Enter your email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={saveProfile}
          className="mt-5 flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
        >
          <Save size={18} />
          Save Profile
        </button>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
            <Bell size={23} />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-slate-800">
              Notification Settings
            </h2>
            <p className="text-sm text-slate-500">
              Enable or disable medicine reminders.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleNotifications}
            className={`relative w-12 h-6 rounded-full transition ${
              notifications ? "bg-blue-600" : "bg-slate-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
                notifications ? "left-7" : "left-1"
              }`}
            />
          </button>
        </div>

        <p className="text-sm mt-4 text-slate-500">
          Status:{" "}
          <span className={notifications ? "text-green-600" : "text-red-600"}>
            {notifications ? "Notifications Enabled" : "Notifications Disabled"}
          </span>
        </p>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
            <Palette size={23} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">Appearance</h2>
            <p className="text-sm text-slate-500">
              Choose your preferred theme.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => changeTheme("Light")}
            className={`border rounded-xl p-4 flex items-center justify-center gap-2 ${
              theme === "Light"
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <Sun size={20} />
            Light
          </button>

          <button
            onClick={() => changeTheme("Dark")}
            className={`border rounded-xl p-4 flex items-center justify-center gap-2 ${
              theme === "Dark"
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <Moon size={20} />
            Dark
          </button>
        </div>

      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-red-100 text-red-600">
            <Trash2 size={23} />
          </div>

          <div>
            <h2 className="font-bold text-slate-800">Data Management</h2>
            <p className="text-sm text-slate-500">
              Remove your medicine and tracking data.
            </p>
          </div>
        </div>

        <button
          onClick={clearMedicineData}
          className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700"
        >
          Clear Medicine Data
        </button>

        <p className="text-xs text-red-500 mt-3">
          Warning: This action cannot be undone.
        </p>
      </div>
    </div>
  );
}

export default Settings;
