"use client";

import { useAppSelector } from "@/redux/hook";

export function useSubscriptionState() {
  return useAppSelector((state) => state.subscription);
}

export function useSubscription() {
  const { subscription, isLoaded } = useSubscriptionState();

  return {
    data: subscription,
    isLoading: false,
    isFetching: false,
    isError: false,
    isSuccess: isLoaded,
  };
}
