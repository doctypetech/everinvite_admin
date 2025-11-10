import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  supabaseClient,
  fetchIsSuperAdmin,
  clearSuperAdminCache,
} from "../../utility";

export type OrgRole = "owner" | "admin" | "editor" | "viewer";

export type OrgMembership = {
  orgId: string;
  role: OrgRole;
  org: {
    id: string;
    name: string;
    slug: string;
  };
};

type OrgContextValue = {
  loading: boolean;
  session: Session | null;
  memberships: OrgMembership[];
  activeMembership: OrgMembership | null;
  setActiveOrgId: (orgId: string | null) => void;
  refreshMemberships: () => Promise<void>;
  isPlatformAdmin: boolean;
  isSuperAdmin: boolean;
};

const STORAGE_KEY = "everinvite.activeOrgId";

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

const getStoredOrgId = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  return raw || null;
};

const storeOrgId = (orgId: string | null) => {
  if (typeof window === "undefined") {
    return;
  }

  if (orgId == null) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, String(orgId));
  }
};

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const [memberships, setMemberships] = useState<OrgMembership[]>([]);
  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(
    getStoredOrgId
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  const syncActiveOrg = useCallback(
    (
      nextMemberships: OrgMembership[],
      options?: {
        preserveNull?: boolean;
      }
    ) => {
      if (nextMemberships.length === 0) {
        setActiveOrgIdState(null);
        storeOrgId(null);
        return;
      }

      const hasExisting =
        activeOrgId != null
          ? nextMemberships.some(
              (membership) => membership.orgId === activeOrgId
            )
          : false;

      if (hasExisting) {
        return;
      }

      if (activeOrgId == null && options?.preserveNull) {
        return;
      }

      const fallbackOrgId = nextMemberships[0]?.orgId ?? null;
      setActiveOrgIdState(fallbackOrgId);
      storeOrgId(fallbackOrgId);
    },
    [activeOrgId]
  );

  const fetchMemberships = useCallback(
    async (userId?: string | null) => {
      if (!userId) {
        setMemberships([]);
        setIsSuperAdmin(false);
        setLoading(false);
        clearSuperAdminCache();
        return;
      }

      const mapOrgToMembership = (
        org: {
          id: string;
          name?: string | null;
          slug?: string | null;
        },
        role: OrgRole = "owner"
      ): OrgMembership => ({
        orgId: org.id,
        role,
        org: {
          id: org.id,
          name: org.name ?? "",
          slug: org.slug ?? "",
        },
      });

      setLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from("organization_members")
          .select(
            `
              organization_id,
              role,
              organization:organizations (
                id,
                name,
                slug
              )
            `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        const mapped: OrgMembership[] =
          data?.map((row) => {
            const orgData = Array.isArray(row.organization)
              ? row.organization[0]
              : row.organization;

            return {
              orgId: row.organization_id,
              role: row.role,
              org: {
                id: orgData?.id ?? row.organization_id,
                name: orgData?.name ?? "",
                slug: orgData?.slug ?? "",
              },
            };
          }) ?? [];

        const superAdminFlag = await fetchIsSuperAdmin(userId);

        let resolvedMemberships = mapped;
        let preserveNull = false;

        const noOrgSelected = activeOrgId == null;

        if (superAdminFlag || resolvedMemberships.length === 0) {
          try {
            const { data: orgRows, error: orgError } = await supabaseClient
              .from("organizations")
              .select("id, name, slug")
              .order("name", { ascending: true });

            if (orgError) {
              throw orgError;
            }

            resolvedMemberships =
              orgRows?.map((org) =>
                mapOrgToMembership(org, superAdminFlag ? "owner" : "viewer")
              ) ?? [];
            preserveNull = true;
          } catch (orgError) {
            console.error("Failed to load organizations list", orgError);
            resolvedMemberships = mapped;
          }
        }

        setMemberships(resolvedMemberships);
        syncActiveOrg(resolvedMemberships, {
          preserveNull: preserveNull || noOrgSelected,
        });

        setIsSuperAdmin(superAdminFlag);
      } catch (error) {
        console.error("Failed to load org memberships", error);
        setMemberships([]);
        setIsSuperAdmin(false);
        setActiveOrgIdState(null);
        storeOrgId(null);
        clearSuperAdminCache();
      } finally {
        setLoading(false);
      }
    },
    [syncActiveOrg]
  );

  const refreshMemberships = useCallback(async () => {
    const { data } = await supabaseClient.auth.getSession();
    const nextSession = data.session ?? null;
    setSession(nextSession);
    await fetchMemberships(nextSession?.user?.id);
  }, [fetchMemberships]);

  useEffect(() => {
    refreshMemberships()
      .catch((error) => {
        console.error("Failed to initialize org context", error);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession ?? null);
      fetchMemberships(nextSession?.user?.id).catch((error) => {
        console.error("Failed to refresh memberships after auth change", error);
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchMemberships, refreshMemberships]);

  const setActiveOrgId = useCallback((orgId: string | null) => {
    setActiveOrgIdState(orgId);
    storeOrgId(orgId);
  }, []);

  const activeMembership = useMemo(() => {
    if (activeOrgId == null) {
      return null;
    }

    return (
      memberships.find((membership) => membership.orgId === activeOrgId) ?? null
    );
  }, [activeOrgId, memberships]);

  const value = useMemo<OrgContextValue>(
    () => ({
      loading,
      session,
      memberships,
      activeMembership,
      setActiveOrgId,
      refreshMemberships,
      isPlatformAdmin: isSuperAdmin,
      isSuperAdmin,
    }),
    [
      activeMembership,
      isSuperAdmin,
      loading,
      memberships,
      refreshMemberships,
      session,
      setActiveOrgId,
    ]
  );

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export const useOrg = (): OrgContextValue => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }

  return context;
};


