import { useForm } from "react-hook-form";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { MailCheck, KeyRound, Loader2 } from "lucide-react"; 

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

    const { register, handleSubmit, formState: { errors }, getValues } = useForm();

    const onSubmit = (data) => forgotPassword(data);

    // Success State View
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-8 w-full max-w-sm flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-violet-50 flex items-center justify-center text-violet-600">
                        <MailCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Check your email</h2>
                        <p className="text-sm text-slate-500 leading-relaxed mt-1">
                            We sent a reset link to{" "}
                            <span className="text-violet-600 font-semibold">{getValues("email")}</span>.
                            Link expires in 15 minutes.
                        </p>
                    </div>
                    <div className="w-full h-px bg-slate-100" />
                    <div className="flex flex-col gap-2 items-center">
                        <p className="text-xs text-slate-400">Didn't receive it? Check spam or</p>
                        <button
                            type="button"
                            onClick={() => forgotPassword({ email: getValues("email") })}
                            className="text-sm text-violet-600 font-semibold hover:text-violet-700 transition-colors hover:underline"
                        >
                            Resend link
                        </button>
                    </div>
                    <button
                        onClick={() => navigate("/authentication")}
                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mt-2 transition-colors"
                    >
                        <IoArrowBack size={14} /> Back to login
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
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Forgot password?</h2>
                        <p className="text-sm text-slate-500 mt-1">No worries! Enter your email and we'll send you a reset link.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    {/* Email Input */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Email address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            {...register("email", { required: "Email is required" })}
                            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-slate-50/50"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    {/* Submit Action Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPending ? "Sending..." : "Send reset link"}
                    </button>
                </form>
            </div>
        </div>
    );
}