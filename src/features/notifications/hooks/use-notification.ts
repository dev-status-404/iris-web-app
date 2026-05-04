"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  clearAll,
  markAllRead,
  type Notification,
} from "@/redux/slices/notification/slice";

type MutationOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

function useLocalMutation(action: () => void) {
  const [isPending, setIsPending] = React.useState(false);

  const mutateAsync = React.useCallback(
    async (_userId?: string, options?: MutationOptions) => {
      setIsPending(true);
      try {
        action();
        options?.onSuccess?.();
      } catch (error) {
        options?.onError?.(error);
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [action],
  );

  return { mutateAsync, isPending };
}

export function useNotifications(userId?: string, enabled = true) {
  const { items, unread } = useAppSelector((state) => state.notification);

  const filteredItems = React.useMemo(() => {
    if (!enabled) return [] as Notification[];
    if (!userId) return items;

    return items.filter((item) => !item.userId || item.userId === userId);
  }, [enabled, items, userId]);

  return {
    items: filteredItems,
    unread: filteredItems.filter((item) => !item.is_read).length || unread,
    isLoading: false,
    isError: false,
  };
}

export function useMarkAllRead() {
  const dispatch = useAppDispatch();
  return useLocalMutation(() => dispatch(markAllRead()));
}

export function useClearAllNotifications() {
  const dispatch = useAppDispatch();
  return useLocalMutation(() => dispatch(clearAll()));
}
