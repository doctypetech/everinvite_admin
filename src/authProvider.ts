import { AuthProvider } from "@refinedev/core";
import {
  supabaseClient,
  fetchIsPlatformAdmin,
  clearPlatformAdminCache,
} from "./utility";

const authProvider: AuthProvider = {
  login: async ({ email, password, providerName }) => {
    // sign in with oauth
    try {
      if (providerName) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: providerName,
        });

        if (error) {
          return {
            success: false,
            error,
          };
        }

        if (data?.url) {
          return {
            success: true,
            redirectTo: "/admin",
          };
        }
      }

      // sign in with email and password
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data?.user) {
        return {
          success: true,
          redirectTo: "/admin",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Login failed",
        name: "Invalid email or password",
      },
    };
  },
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/admin",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Register failed",
        name: "Invalid email or password",
      },
    };
  },
  forgotPassword: async ({ email }) => {
    try {
      const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Forgot password failed",
        name: "Invalid email",
      },
    };
  },
  updatePassword: async ({ password }) => {
    try {
      const { data, error } = await supabaseClient.auth.updateUser({
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/admin",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }
    return {
      success: false,
      error: {
        message: "Update password failed",
        name: "Invalid password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    clearPlatformAdminCache();

    return {
      success: true,
      redirectTo: "/admin/login",
    };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const { session } = data;

      if (!session) {
        return {
          authenticated: false,
          error: {
            message: "Check failed",
            name: "Session not found",
          },
          logout: true,
          redirectTo: "/admin/login",
        };
      }
    } catch (error: any) {
      return {
        authenticated: false,
        error: error || {
          message: "Check failed",
          name: "Not authenticated",
        },
        logout: true,
        redirectTo: "/admin/login",
      };
    }

    return {
      authenticated: true,
    };
  },
  getPermissions: async () => {
    try {
      const [{ data: sessionData }, membershipsResult] =
        await Promise.all([
          supabaseClient.auth.getSession(),
          supabaseClient
            .from("org_members")
            .select(
              `
                org_id,
                user_id,
                role,
                org:orgs (
                  id,
                  name,
                  slug
                )
              `
            )
            .order("created_at", { ascending: true }),
        ]);

      const session = sessionData.session;

      if (!session?.user) {
        return null;
      }

      if (membershipsResult.error) {
        throw membershipsResult.error;
      }

      const memberships =
        membershipsResult.data
          ?.filter((row) => row.user_id === session.user.id)
          ?.map((row) => {
            const orgData = Array.isArray(row.org) ? row.org[0] : row.org;
            return {
              orgId: row.org_id,
              role: row.role,
              org: {
                id: orgData?.id ?? row.org_id,
                name: orgData?.name ?? "",
                slug: orgData?.slug ?? "",
              },
            };
          }) ?? [];

      const isPlatformAdmin = await fetchIsPlatformAdmin(session.user.id);

      return {
        userId: session.user.id,
        email: session.user.email,
        memberships,
        isPlatformAdmin,
      };
    } catch (error) {
      console.error("Failed to resolve permissions", error);
      return null;
    }
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();

    if (data?.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }

    return null;
  },
};

export default authProvider;
