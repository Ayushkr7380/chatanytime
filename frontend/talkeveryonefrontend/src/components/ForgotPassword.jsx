import { useForm } from "react-hook-form";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { mutate: forgotPassword, isPending, isSuccess } = useForgotPassword();

    const { register, handleSubmit, formState: { errors }, getValues } = useForm();

    const onSubmit = (data) => forgotPassword(data);

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-8 w-full max-w-sm flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center text-3xl">
                        📬
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800">Check your email</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        We sent a reset link to{" "}
                        <span className="text-violet-600 font-medium">{getValues("email")}</span>.
                        Link expires in 15 minutes.
                    </p>
                    <div className="w-full h-px bg-slate-100" />
                    <p className="text-xs text-slate-400">Didn't receive it? Check spam or</p>
                    <button
                        onClick={() => forgotPassword({ email: getValues("email") })}
                        className="text-sm text-violet-600 font-medium hover:underline"
                    >
                        Resend link
                    </button>
                    <button
                        onClick={() => navigate("/authentication")}
                        className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mt-2"
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
                    className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 w-fit"
                >
                    <IoArrowBack size={14} /> Back to login
                </button>

                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center text-2xl">
                        🔐
                    </div>
                    <h2 className="text-xl font-semibold text-slate-800">Forgot password?</h2>
                    <p className="text-sm text-slate-500">No worries! Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Email address</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            {...register("email", { required: "Email is required" })}
                            className="border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors disabled:opacity-50"
                    >
                        {isPending ? "Sending..." : "Send reset link"}
                    </button>
                </form>
            </div>
        </div>
    );
}