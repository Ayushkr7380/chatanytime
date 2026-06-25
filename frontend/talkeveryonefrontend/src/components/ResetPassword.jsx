import { useForm } from "react-hook-form";
import { useResetPassword } from "@/hooks/useResetPassword";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { IoArrowBack, IoEye, IoEyeOff } from "react-icons/io5";
import { AlertTriangle, Lock, Loader2 } from "lucide-react";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { mutate: resetPassword, isPending } = useResetPassword();
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    const password = watch("newPassword", "");

    const getStrength = (pw) => {
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strengthScore = getStrength(password);
    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strengthScore];
    const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][strengthScore];

    const onSubmit = ({ newPassword }) => {
        if (!token) return;
        resetPassword({ token, newPassword });
    };

    // Invalid Token State
    if (!token) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-red-100 p-8 w-full max-w-sm text-center flex flex-col gap-4 items-center">
                    <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-lg font-semibold text-slate-800">Invalid reset link</h2>
                        <p className="text-sm text-slate-500">This link is invalid or has expired.</p>
                    </div>
                    <button
                        onClick={() => navigate("/forgot-password")}
                        className="w-full py-3 mt-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                    >
                        Request new link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-8 w-full max-w-sm flex flex-col gap-5">

                <button
                    onClick={() => navigate("/authentication")}
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 w-fit transition-colors"
                >
                    <IoArrowBack size={14} /> Back to login
                </button>

                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Set new password</h2>
                        <p className="text-sm text-slate-500 mt-1">Must be different from your previous password.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    {/* New password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">New password</label>
                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                placeholder="Min 6 characters"
                                {...register("newPassword", {
                                    required: "Password is required",
                                    minLength: { value: 6, message: "Minimum 6 characters" }
                                })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                            />
                            <button type="button" onClick={() => setShowPw(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors">
                                {showPw ? <IoEyeOff size={16} /> : <IoEye size={16} />}
                            </button>
                        </div>

                        {/* Strength bar */}
                        {password && (
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strengthScore ? strengthColor : "bg-slate-100"}`} />
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400">Strength: <span className="font-medium text-slate-600">{strengthLabel}</span></p>
                            </div>
                        )}

                        {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
                    </div>

                    {/* Confirm password */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Confirm password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                placeholder="Re-enter password"
                                {...register("confirmPassword", {
                                    required: "Please confirm your password",
                                    validate: val => val === password || "Passwords do not match"
                                })}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                            />
                            <button type="button" onClick={() => setShowConfirm(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors">
                                {showConfirm ? <IoEyeOff size={16} /> : <IoEye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPending ? "Resetting..." : "Reset password"}
                    </button>
                </form>
            </div>
        </div>
    );
}