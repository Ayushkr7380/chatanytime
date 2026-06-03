import { useQuery } from "@tanstack/react-query";
import { getMeApi } from "@/api/authApi";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    retry: false,
  });
};