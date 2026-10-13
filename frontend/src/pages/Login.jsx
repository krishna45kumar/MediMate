import { Mail, Lock, Eye, Pill } from "lucide-react";
import illustration from "../assets/medimate-login-illustration.png";

function Login() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">

            <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden">

                <div className="grid md:grid-cols-2">

                    {/* LEFT SIDE */}
                    <div className="hidden md:flex bg-blue-50 p-12 items-center flex-col justify-between">
                        <div>

                            {/* Logo */}
                            <div className="flex items-center gap-3">

                                <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
                                    <Pill
                                        size={30}
                                        className="text-white"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">
                                        Medi <span className="text-blue-600">Mate</span>
                                    </h1>

                                    <p className="text-xs text-slate-500">
                                        Your Health, Our Priority
                                    </p>
                                </div>

                            </div>

                        </div>


                        {/* Illustration */}
                        <div className="flex justify-center py-10">

                         <div className="flex justify-center py-10">
                   <img
                  src={illustration}
                   alt="Medicine reminder illustration"
                       className="w-70 h-55 object-contain" />
                           </div>

                        </div>


                        {/* Text */}
                        <div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-3">
                                Stay on track with your medicines
                            </h2>

                            <p className="text-slate-500 leading-relaxed">
                                Get reminders, manage your medicines and
                                keep track of your daily health routine —
                                all in one place.
                            </p>

                        </div>

                    </div>


                    {/* RIGHT SIDE */}
                    <div className="p-8 md:p-12">

                        {/* Heading */}
                        <div className="mb-8">

                            <h2 className="text-3xl font-bold text-slate-800">
                                Welcome Back 👋
                            </h2>

                            <p className="text-slate-500 mt-2">
                                Login to your account
                            </p>

                        </div>


                        {/* Email */}
                        <div className="mb-5">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email Address
                            </label>

                            <div className="relative">

                                <Mail
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                       z             className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div className="mb-4">

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={19}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                                />

                                <Eye
                                    size={19}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                                />

                            </div>

                        </div>


                        {/* Remember + Forgot */}
                        <div className="flex items-center justify-between mb-7">

                            <label className="flex items-center gap-2 text-sm text-slate-500">

                                <input
                                    type="checkbox"
                                    className="w-4 h-4 accent-blue-600"
                                />

                                Remember me

                            </label>

                            <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                                Forgot password?
                            </button>

                        </div>


                        {/* Login Button */}
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-blue-100"
                        >
                            Login
                        </button>


                        {/* Register */}
                        <p className="text-center text-sm text-slate-500 mt-6">

                            Don't have an account?

                            <button className="text-blue-600 font-semibold ml-1 hover:underline">
                                Register
                            </button>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;