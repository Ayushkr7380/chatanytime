import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/api/userApi";

export const useSearch = (keyword) => {
  return useQuery({
    queryKey: ["search", keyword],
    queryFn: () => searchUsers(keyword),
    enabled: !!keyword,
  });
};