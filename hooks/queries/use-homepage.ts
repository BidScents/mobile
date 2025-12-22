import { HomepageService } from "@bid-scents/shared-sdk"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "./query-keys"

export const useHomepage = () => {
    return useQuery({
        queryKey: queryKeys.homepage,
        queryFn: () => HomepageService.getHomepageV1HomepageGet(),
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
    })
}

export const useUserSearch = (query: string) => {
    return useQuery({
        queryKey: queryKeys.userSearch(query),
        queryFn: () => HomepageService.searchUsersV1HomepageUsersGet(query),
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })
}