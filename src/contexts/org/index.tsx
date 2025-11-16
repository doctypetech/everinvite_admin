import { usePermissions } from "@refinedev/core";

export const usePlatformAccess = () => {
  const { data, isLoading } = usePermissions<{
    isPlatformAdmin?: boolean;
    isSuperAdmin?: boolean;
  }>({});

  const isSuperAdmin = Boolean(data?.isSuperAdmin);
  const isPlatformAdmin = Boolean(
    data?.isPlatformAdmin ?? data?.isSuperAdmin
  );

  return {
    loading: isLoading,
    isPlatformAdmin,
    isSuperAdmin,
  };
};


