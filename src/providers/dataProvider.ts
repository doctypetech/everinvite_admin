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

const parsePrimaryLocaleCompositeId = (id: string | number) => {
  const [primaryId, locale] = String(id).split(":");

  if (!primaryId || !locale) {
    throw new Error("Invalid translation identifier");
  }

  return { primaryId, locale };
};

export const createDataProvider = (): DataProvider => {
  const baseProvider = supabaseDataProvider(supabaseClient) as DataProvider;

  return {
    ...baseProvider,
    getOne: async <TData extends BaseRecord = BaseRecord>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      const { resource, id, meta } = params;

      switch (resource) {
        case "organization_members": {
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
        case "event_translations": {
          const { primaryId: eventId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("event_translations")
            .select((meta as any)?.select ?? "*")
            .eq("event_id", eventId)
            .eq("locale", locale)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error("Event translation not found");
          }

          return { data: data as unknown as TData };
        }
        case "template_translations": {
          const { primaryId: templateId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("template_translations")
            .select((meta as any)?.select ?? "*")
            .eq("template_id", templateId)
            .eq("locale", locale)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error("Template translation not found");
          }

          return { data: data as unknown as TData };
        }
        case "faq_translations": {
          const { primaryId: faqId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("faq_translations")
            .select((meta as any)?.select ?? "*")
            .eq("faq_id", faqId)
            .eq("locale", locale)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (!data) {
            throw new Error("FAQ translation not found");
          }

          return { data: data as unknown as TData };
        }
        default:
          return baseProvider.getOne<TData>(params);
      }
    },
    update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
      const { resource, id, variables, meta } = params;

      switch (resource) {
        case "organization_members": {
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
        case "event_translations": {
          const { primaryId: eventId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("event_translations")
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
        case "template_translations": {
          const { primaryId: templateId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("template_translations")
            .update((variables as Record<string, unknown>) ?? {})
            .eq("template_id", templateId)
            .eq("locale", locale)
            .select((meta as any)?.select ?? "*")
            .maybeSingle();

          if (error) {
            throw error;
          }

          return { data: data as unknown as TData };
        }
        case "faq_translations": {
          const { primaryId: faqId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("faq_translations")
            .update((variables as Record<string, unknown>) ?? {})
            .eq("faq_id", faqId)
            .eq("locale", locale)
            .select((meta as any)?.select ?? "*")
            .maybeSingle();

          if (error) {
            throw error;
          }

          return { data: data as unknown as TData };
        }
        default:
          return baseProvider.update<TData, TVariables>(params);
      }
    },
    deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
      params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
      const { resource, id, meta } = params;

      switch (resource) {
        case "organization_members": {
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
        case "event_translations": {
          const { primaryId: eventId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("event_translations")
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
        case "template_translations": {
          const { primaryId: templateId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("template_translations")
            .delete()
            .eq("template_id", templateId)
            .eq("locale", locale)
            .select((meta as any)?.select ?? "*")
            .maybeSingle();

          if (error) {
            throw error;
          }

          return { data: data as unknown as TData };
        }
        case "faq_translations": {
          const { primaryId: faqId, locale } =
            parsePrimaryLocaleCompositeId(id);

          const { data, error } = await supabaseClient
            .from("faq_translations")
            .delete()
            .eq("faq_id", faqId)
            .eq("locale", locale)
            .select((meta as any)?.select ?? "*")
            .maybeSingle();

          if (error) {
            throw error;
          }

          return { data: data as unknown as TData };
        }
        default:
          return baseProvider.deleteOne<TData, TVariables>(params);
      }
    },
  };
};
