"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { message } from "antd";
import {
  fetchPlans,
  fetchSubscription,
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  changePlan,
  startFreeTrial,
} from "@/api/api_calls/billing";
import { setSubscription, setPlans } from "@/redux/slices/subscription/subscription-slice";
import { useAppSelector } from "@/redux/hook";
import { getErrorMessage, getSuccessMessage } from "@/utils/extractor/auth";
import { useIntl } from "react-intl";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const usePlans = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["billing-plans"],
    queryFn: async () => {
      const res = await fetchPlans();
      if (res.success) dispatch(setPlans(res.data));
      return res.data;
    },
    staleTime: 10 * 60 * 1000, // 10 min
  });
};

export const useSubscription = () => {
  const dispatch = useDispatch();

  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetchSubscription();
      dispatch(setSubscription(res.success ? res.data : null));
      return res.data;
    },
    staleTime: 60 * 1000, // 1 min
    retry: false,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateCheckout = () => {
  const intl = useIntl();

  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (res) => {
      if (res.data?.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.checkout_url;
      }
    },
    onError: (err: any) => {
      message.error(intl.formatMessage({ id: getErrorMessage(err) }));
    },
  });
};

export const useCreatePortal = () => {
  const intl = useIntl();

  return useMutation({
    mutationFn: createPortalSession,
    onSuccess: (res) => {
      if (res.data?.portal_url) {
        window.location.href = res.data.portal_url;
      }
    },
    onError: (err: any) => {
      message.error(intl.formatMessage({ id: getErrorMessage(err) }));
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const intl = useIntl();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: (res) => {
      message.success(
        intl.formatMessage({
          id: getSuccessMessage("subscription will be cancelled"),
        }),
      );
      dispatch(setSubscription(res.data));
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: any) => {
      message.error(intl.formatMessage({ id: getErrorMessage(err) }));
    },
  });
};

export const useChangePlan = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const intl = useIntl();

  return useMutation({
    mutationFn: (planName: string) => changePlan(planName),
    onSuccess: (res) => {
      message.success(intl.formatMessage({ id: getSuccessMessage(res.message) }));
      dispatch(setSubscription(res.data));
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: any) => {
      message.error(intl.formatMessage({ id: getErrorMessage(err) }));
    },
  });
};

// ─── Selector hook ────────────────────────────────────────────────────────────

export const useStartFreeTrial = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const intl = useIntl();

  return useMutation({
    mutationFn: startFreeTrial,
    onSuccess: (res) => {
      message.success(
        intl.formatMessage({ id: getSuccessMessage("free trial started") }),
      );
      dispatch(setSubscription(res.data));
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (err: any) => {
      message.error(intl.formatMessage({ id: getErrorMessage(err) }));
    },
  });
};

/**
 * Returns the cached subscription from Redux store (instantly available,
 * no loading spinner needed in most cases).
 */
export const useSubscriptionState = () => {
  return useAppSelector((s) => s.subscription);
};
