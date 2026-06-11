import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const { mutate: login, isPending } = useLogin();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <div className="min-h-14 bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-violet-200 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2 justify-center">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <span className="text-white text-sm">💬</span>
          </div>
          <span className="text-violet-700 font-medium">Chat Anytime</span>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-medium text-slate-800">Welcome back</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit((data) => login(data))} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
              className="border border-violet-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-600">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password", { required: "Password is required", minLength: { value: 5, message: "Min 5 characters" } })}
                className="w-full border border-violet-200 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400">
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <Link to="/forgot-password" className="text-xs text-violet-600 text-right -mt-2">Forgot password?</Link>

          <button disabled={isPending} type="submit"
            className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors">
            {isPending ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}