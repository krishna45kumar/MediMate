
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Pill } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import illustration from "../assets/medimate-login-illustration.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleLogin(e) {
    e.preventDefault();

    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("medimateUsers") || "[]");

    const loggedInUser = users.find(
      (user) =>
        user.email === email.trim().toLowerCase() &&
        user.password === password
    );

    if (!loggedInUser) {
      alert("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "userProfile",
      JSON.stringify({
        name: loggedInUser.name,
        email: loggedInUser.email,
      })
    );

    localStorage.setItem("loggedInUser", loggedInUser.id);

    if (rememberMe) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }

    alert("Login successful!");
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden grid md:grid-cols-2">

        <div className="hidden md:flex items-center justify-center bg-blue-50 p-8">
          <img
            src={illustration}
            alt="MediMate medicine reminder"
            className="w-full max-w-md"
          />
        </div>

        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-8">
            <Pill className="text-blue-600" size={30} />
            <h1 className="text-3xl font-bold text-slate-800">MediMate</h1>
          </div>

          <h2 className="text-3xl font-bold text-slate-800">
            Welcome Back!
          </h2>
          <p className="text-slate-500 mt-2 mb-8">
            Login to manage your daily medicines.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-slate-300 rounded-lg py-3 pl-10 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => alert("Please contact support to reset your password.")}
                className="text-sm text-blue-600 font-medium"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
            >
              Login
            </button>
          </form>

          <p className="text-center text-slate-600 mt-7">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 font-semibold">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
