import { useMutation } from "@tanstack/react-query";
import {
  ScrapeFollowersOrFollowing,
  type ScrapeFollowersInput,
} from "@/api/api_calls/scrapper";

export function useScrapeFollowersOrFollowing() {
  return useMutation({
    mutationKey: ["scraper", "followers-or-following"],
    mutationFn: (input: ScrapeFollowersInput) =>
      ScrapeFollowersOrFollowing(input),
  });
}
