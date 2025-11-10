import type {
  BaseRecord,
  DataProvider,
  DeleteOneParams,
  DeleteOneResponse,
  GetOneParams,
  GetOneResponse,
  UpdateParams,
  UpdateResponse,
} from "@refinedev/core";
import { dataProvider as supabaseDataProvider } from "@refinedev/supabase";
import { supabaseClient } from "../utility";

const parseOrganizationMemberCompositeId = (id: string | number) => {
  const [orgId, userId] = String(id).split(":");

  if (!orgId || !userId) {
    throw new Error("Invalid organization_members identifier");
  }

  return { orgId, userId };
};

export const createDataProvider = (): DataProvider => {
  const baseProvider = supabaseDataProvider(supabaseClient) as DataProvider;

  return {
    ...baseProvider,
    getOne: async <TData extends BaseRecord = BaseRecord>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      const { resource, id, meta } = params;

      if (resource === "organization_members") {
        const { orgId, userId } = parseOrganizationMemberCompositeId(id);

        const { data, error } = await supabaseClient
          .from("organization_members")
          .select((meta as any)?.select ?? "*")
          .eq("organization_id", orgId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Organization membership not found");
        }

        return { data: data as unknown as TData };
      }

      return baseProvider.getOne<TData>(params);
    },
    update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      const { resource, id, variables, meta } = params;

      if (resource === "organization_members") {
        const { orgId, userId } = parseOrganizationMemberCompositeId(id);

        const { data, error } = await supabaseClient
          .from("organization_members")
          .update((variables as Record<string, unknown>) ?? {})
          .eq("organization_id", orgId)
          .eq("user_id", userId)
          .select((meta as any)?.select ?? "*")
          .maybeSingle();

        if (error) {
          throw error;
        }

        return { data: data as unknown as TData };
      }

      return baseProvider.update<TData, TVariables>(params);
    },
    deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      const { resource, id, meta } = params;

      if (resource === "organization_members") {
        const { orgId, userId } = parseOrganizationMemberCompositeId(id);

        const { data, error } = await supabaseClient
          .from("organization_members")
          .delete()
          .eq("organization_id", orgId)
          .eq("user_id", userId)
          .select((meta as any)?.select ?? "*")
          .maybeSingle();

        if (error) {
          throw error;
        }

        return { data: data as unknown as TData };
      }

      return baseProvider.deleteOne<TData, TVariables>(params);
    },
  };
};
