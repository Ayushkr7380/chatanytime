import { useForm } from "react-hook-form";
import { useRegister } from "@/hooks/useRegister";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Registration() {
  const { mutate: registerUser, isPending } = useRegister();
  const [showPw, setShowPw] = useState(false);
  const [strength, setStrength] = useState(0);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const checkStrength = (val) => {
    let s = 0;
    if (val.length >= 6) s++;
    if (val.length >= 10) s++;
    if (/[A-Z]|[0-9]/.test(val)) s++;
    if (/[^A-Za-z0-9]/.test(val)) s++;
    setStrength(s);
  };

  const strengthColor = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  return (
    <div className="min-h-14 bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-violet-200 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-2">

        {/* Brand */}
        <div className="flex items-center gap-1 justify-center">
          <div className="w-7 h-6 rounded-lg bg-violet-500 flex items-center justify-center">
            <span className="text-white text-sm">💬</span>
          </div>
          <span className="text-violet-700 font-medium">Chat Anytime</span>
        </div>

        <div className="text-center">
          
          <h2 className="text-xl font-medium text-slate-800 mt-2">Create account</h2>
          
        </div>

        <form onSubmit={handleSubmit((data) => registerUser(data))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600">Username</label>
              <input
                type="text"
                placeholder="@handle"
                {...register("username", { required: "Required" })}
                className="border border-violet-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50"
              />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-600">Name</label>
              <input
                type="text"
                placeholder="Full name"
                {...register("name", { required: "Required" })}
                className="border border-violet-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
          </div>

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
                placeholder="Min 6 characters"
                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                onChange={(e) => { register("password").onChange(e); checkStrength(e.target.value); }}
                className="w-full border border-violet-200 rounded-xl px-3 py-2.5 pr-10 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 bg-slate-50"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400">
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="flex gap-1 mt-1">
              {[0,1,2,3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? strengthColor[strength-1] : "bg-violet-100"}`} />
              ))}
            </div>
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button disabled={isPending} type="submit"
            className="w-full bg-violet-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors">
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-600 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
}