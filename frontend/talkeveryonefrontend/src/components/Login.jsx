import { CreateUserContext } from "@/context/userContext/CreateUserContext"
import { useContext } from "react"
import { useForm } from "react-hook-form"


export default function Login() {

  const userContext = useContext(CreateUserContext);

  const { login } = userContext;

  const {
    register,
    handleSubmit,
    // watch,
    formState: { errors },
  } = useForm()


  const onSubmit = (data) => login(data)


  // console.log(watch("example")) // watch input value by passing the name of it


  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <h2 className="text-2xl font-bold text-center">Login</h2>
      <div>

        <label className="block font-medium">Email</label>
        <input
            type="email" 
            placeholder="Enter your email"
            {...register("email" , {required:"Email is required"})}
            className="w-full border rounded px-3 py-2 mt-1"
        />

        {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
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
                value: 5,
                message: "Password must be at least 5 characters",
              },
            })}
            className="w-full border rounded px-3 py-2 mt-1"
          />

          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
            >
            Login
        </button>

      
    </form>
  )
}