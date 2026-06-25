import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { MessageSquare, Loader2 } from "lucide-react"; 

export default function Login() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 ">
      <div className="bg-white border border-violet-200 rounded-2xl  p-8 w-full max-w-sm flex flex-col gap-2 mt-[-20vh]">

        {/* Brand */}
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white shadow-sm shadow-violet-200">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-violet-700 font-semibold tracking-wide text-sm">Chat Anytime</span>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-800">Welcome back</h2>
          <p className="text-xs text-slate-400 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit((data) => login(data))} className="flex flex-col gap-4">
          
          {/* Email Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
              className="border border-violet-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50 transition-all"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", { required: "Password is required", minLength: { value: 5, message: "Min 5 characters" } })}
                className="w-full border border-violet-100 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50 transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors"
              >
                {showPw ? <IoEyeOff size={16} /> : <IoEye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button 
              type="button"
              onClick={() => navigate("/forgot-password")} 
              className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button 
            disabled={isPending} 
            type="submit"
            className="w-full bg-violet-600 text-white py-2.5 mt-1 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Signing in..." : "Login"}
          </button>
          
        </form>
      </div>
    </div>
  );
}