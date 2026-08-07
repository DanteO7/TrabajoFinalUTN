import { useInfiniteQuery } from "@tanstack/react-query";
import { getUsers } from "../services/user";
import { useUserFilterStore } from "../store/user-filter-store";

export function useInfiniteUsers() {
  const { search, role } = useUserFilterStore();

  return useInfiniteQuery({
    queryKey: ["users", { search, role }],

    queryFn: ({ pageParam = 1 }) =>
      getUsers({
        search,
        role,
        page: pageParam,
        pageSize: 10,
      }),

    initialPageParam: 1,

    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });
}
