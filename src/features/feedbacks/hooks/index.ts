import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";

export type FeedbacksQueryState = {
  page: number;
  limit: number;
  search?: string;
  user_id?: string;
};

export type FeedbackType = {
  _id: string;
  feedback: string;
  user_id: string | {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type FeedbackResponse = {
  code: number;
  success: boolean;
  message: string;
  data: FeedbackType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const INITIAL_QUERY: FeedbacksQueryState = {
  page: 1,
  limit: 10,
  search: "",
  user_id: "",
};

/**
 * ✅ Hook to manage feedbacks listing with pagination and filtering
 */
export const useFeedbacksList = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<FeedbacksQueryState>(INITIAL_QUERY);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feedbacks", query],
    queryFn: async () => {
      const { data } = await api.get<FeedbackResponse>(
        apiEndpoints.support.feedback_list({
          page: query.page,
          limit: query.limit,
          search: query.search,
          user_id: query.user_id,
        } as any),
      );

      return data;
    },
    staleTime: 30000, // 30 seconds
  });

  const feedbacks = response?.data || [];
  const total = response?.pagination?.total || 0;

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
  }, [queryClient]);

  const updateQuery = useCallback((updates: Partial<FeedbacksQueryState>) => {
    setQuery((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetQuery = useCallback(() => {
    setQuery(INITIAL_QUERY);
  }, []);

  return {
    feedbacks,
    total,
    isLoading,
    error,
    query,
    setQuery: updateQuery,
    resetQuery,
    refetch,
  };
};

/**
 * ✅ Hook to create a feedback
 */
export const useCreateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "feedback", "create"],
    mutationFn: async (input: { feedback: string; user_id?: string }) => {
      const { data } = await api.post(apiEndpoints.support.feedback_create, input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

/**
 * ✅ Hook to update a feedback
 */
export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "feedback", "update"],
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<FeedbackType>;
    }) => {
      const { data } = await api.put(apiEndpoints.support.feedback_update(id), payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

/**
 * ✅ Hook to delete a feedback
 */
export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["support", "feedback", "delete"],
    mutationFn: async (id: string) => {
      const { data } = await api.delete(apiEndpoints.support.feedback_delete(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbacks"] });
    },
  });
};

// Export feedback modal timer hook
export { useFeedbackModalTimer } from "./use-feedback-modal-timer";
