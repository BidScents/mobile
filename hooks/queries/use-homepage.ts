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