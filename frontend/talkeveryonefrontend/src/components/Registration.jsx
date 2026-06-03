import { useForm } from "react-hook-form";
import { useRegister } from "@/hooks/useRegister";

export default function Registration() {

  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    registerUser(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      <h2 className="text-2xl font-bold text-center">
        Registration
      </h2>

      <div>
        <label className="block font-medium">Username</label>

        <input
          type="text"
          placeholder="Enter your username"
          {...register("username", {
            required: "username is required",
          })}
          className="w-full border rounded px-3 py-2 mt-1"
        />

        {errors.username && (
          <p className="text-red-500 text-sm">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium">Name</label>

        <input
          type="text"
          placeholder="Enter your name"
          {...register("name", {
            required: "name is required",
          })}
          className="w-full border rounded px-3 py-2 mt-1"
        />

        {errors.name && (
          <p className="text-red-500 text-sm">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium">Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          {...register("email", {
            required: "Email is required",
          })}
          className="w-full border rounded px-3 py-2 mt-1"
        />

        {errors.email && (
          <p className="text-red-500 text-sm">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium">Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
          className="w-full border rounded px-3 py-2 mt-1"
        />

        {errors.password && (
          <p className="text-red-500 text-sm">
            {errors.password.message}
          </p>
        )}
      </div>

      <button
        disabled={isPending}
        type="submit"
        className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
      >
        {isPending ? "Registering..." : "Registration"}
      </button>

    </form>
  );
}