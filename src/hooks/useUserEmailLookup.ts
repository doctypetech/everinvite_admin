import { useMany } from "@refinedev/core";
import { useMemo } from "react";

type MaybeString = string | null | undefined;

export const useUserEmailLookup = (userIds: MaybeString[] | undefined) => {
  const ids = useMemo(() => {
    if (!userIds) {
      return [];
    }

    const uniqueIds = Array.from(
      new Set(
        userIds.filter((value): value is string => Boolean(value && value.length))
      )
    );

    return uniqueIds;
  }, [userIds]);

  const usersQuery = useMany<{ user_id: string; email: string }>({
    resource: "user_email",
    ids,
    queryOptions: {
      enabled: ids.length > 0,
    },
  });

  const emailById = useMemo(() => {
    const map = new Map<string, string>();

    const records =
      usersQuery.query.data?.data ?? usersQuery.result?.data ?? [];

    records.forEach((item) => {
      if (item.user_id) {
        map.set(item.user_id, item.email);
      }
    });

    return map;
  }, [usersQuery.query.data, usersQuery.result?.data]);

  return {
    emailById,
    isLoading: usersQuery.query.isLoading,
  };
};


