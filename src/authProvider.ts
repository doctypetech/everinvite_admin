import { AuthProvider } from "@refinedev/core";
import {
  supabaseClient,
  fetchIsSuperAdmin,
  clearSuperAdminCache,
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
  register: async () => {
    return {
      success: false,
      error: {
        message: "Registration is disabled. Please contact an administrator.",
        name: "registration_disabled",
      },
    };
  },
  forgotPassword: async () => {
    return {
      success: false,
      error: {
        message: "Password reset is disabled. Please contact an administrator.",
        name: "password_reset_disabled",
      },
    };
  },
  updatePassword: async () => {
    return {
      success: false,
      error: {
        message: "Password updates are managed by administrators.",
        name: "password_update_disabled",
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

    clearSuperAdminCache();

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
      const { data: sessionData } = await supabaseClient.auth.getSession();
      const session = sessionData.session;

      if (!session?.user) {
        return null;
      }

      const isSuperAdmin = await fetchIsSuperAdmin(session.user.id);

      return {
        userId: session.user.id,
        email: session.user.email,
        isPlatformAdmin: isSuperAdmin,
        isSuperAdmin,
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
