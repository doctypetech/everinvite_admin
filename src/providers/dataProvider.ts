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

const parseEventTextCompositeId = (id: string | number) => {
  const [eventPart, locale] = String(id).split(":");
  const eventId = Number(eventPart);

  if (!eventId || !locale) {
    throw new Error("Invalid event_texts identifier");
  }

  return { eventId, locale };
};

const parseOrgMemberCompositeId = (id: string | number) => {
  const [orgPart, userId] = String(id).split(":");
  const orgId = Number(orgPart);

  if (!orgId || !userId) {
    throw new Error("Invalid org_members identifier");
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

      if (resource === "event_texts") {
        const { eventId, locale } = parseEventTextCompositeId(id);

        const { data, error } = await supabaseClient
          .from("event_texts")
          .select((meta as any)?.select ?? "*")
          .eq("event_id", eventId)
          .eq("locale", locale)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Event copy not found");
        }

        return { data: data as unknown as TData };
      }

      if (resource === "org_members") {
        const { orgId, userId } = parseOrgMemberCompositeId(id);

        const { data, error } = await supabaseClient
          .from("org_members")
          .select((meta as any)?.select ?? "*")
          .eq("org_id", orgId)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Org membership not found");
        }

        return { data: data as unknown as TData };
      }

      return baseProvider.getOne<TData>(params);
    },
    update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      const { resource, id, variables, meta } = params;

      if (resource === "event_texts") {
        const { eventId, locale } = parseEventTextCompositeId(id);

        const { data, error } = await supabaseClient
          .from("event_texts")
          .update((variables as Record<string, unknown>) ?? {})
          .eq("event_id", eventId)
          .eq("locale", locale)
          .select((meta as any)?.select ?? "*")
          .maybeSingle();

        if (error) {
          throw error;
        }

        return { data: data as unknown as TData };
      }

      if (resource === "org_members") {
        const { orgId, userId } = parseOrgMemberCompositeId(id);

        const { data, error } = await supabaseClient
          .from("org_members")
          .update((variables as Record<string, unknown>) ?? {})
          .eq("org_id", orgId)
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

      if (resource === "event_texts") {
        const { eventId, locale } = parseEventTextCompositeId(id);

        const { data, error } = await supabaseClient
          .from("event_texts")
          .delete()
          .eq("event_id", eventId)
          .eq("locale", locale)
          .select((meta as any)?.select ?? "*")
          .maybeSingle();

        if (error) {
          throw error;
        }

        return { data: data as unknown as TData };
      }

      if (resource === "org_members") {
        const { orgId, userId } = parseOrgMemberCompositeId(id);

        const { data, error } = await supabaseClient
          .from("org_members")
          .delete()
          .eq("org_id", orgId)
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

