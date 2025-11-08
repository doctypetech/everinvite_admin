import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  AuthPage,
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerProvider, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import authProvider from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { OrgProvider } from "./contexts/org";
import { accessControlProvider } from "./accessControlProvider";
import { createDataProvider } from "./providers/dataProvider";
import { liveProvider } from "@refinedev/supabase";
import { EventsCreate, EventsEdit, EventsList } from "./pages/events";
import {
  EventTextsCreate,
  EventTextsEdit,
  EventTextsList,
} from "./pages/event-texts";
import {
  EventDomainsCreate,
  EventDomainsEdit,
  EventDomainsList,
} from "./pages/event-domains";
import { PhotosCreate, PhotosEdit, PhotosList } from "./pages/photos";
import {
  UploadTokensCreate,
  UploadTokensEdit,
  UploadTokensList,
} from "./pages/upload-tokens";
import {
  EventTypesCreate,
  EventTypesEdit,
  EventTypesList,
} from "./pages/event-types";
import {
  TemplatesCreate,
  TemplatesEdit,
  TemplatesList,
} from "./pages/templates";
import { ThemesCreate, ThemesEdit, ThemesList } from "./pages/themes";
import {
  OrgMembersCreate,
  OrgMembersEdit,
  OrgMembersList,
} from "./pages/org-members";
import {
  PlatformAdminsCreate,
  PlatformAdminsList,
} from "./pages/platform-admins";
import { supabaseClient } from "./utility";

const dataProvider = createDataProvider();
const realtimeProvider = liveProvider(supabaseClient);

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <Refine
              dataProvider={dataProvider}
              liveProvider={realtimeProvider}
              authProvider={authProvider}
              accessControlProvider={accessControlProvider}
              routerProvider={routerProvider}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: "events",
                  list: "/admin/events",
                  create: "/admin/events/create",
                  edit: "/admin/events/edit/:id",
                },
                {
                  name: "event_texts",
                  list: "/admin/event-texts",
                  create: "/admin/event-texts/create",
                  edit: "/admin/event-texts/edit/:id",
                },
                {
                  name: "event_domains",
                  list: "/admin/event-domains",
                  create: "/admin/event-domains/create",
                  edit: "/admin/event-domains/edit/:id",
                },
                {
                  name: "photos",
                  list: "/admin/photos",
                  create: "/admin/photos/create",
                  edit: "/admin/photos/edit/:id",
                },
                {
                  name: "upload_tokens",
                  list: "/admin/upload-tokens",
                  create: "/admin/upload-tokens/create",
                  edit: "/admin/upload-tokens/edit/:id",
                },
                {
                  name: "event_types",
                  list: "/admin/catalog/event-types",
                  create: "/admin/catalog/event-types/create",
                  edit: "/admin/catalog/event-types/edit/:id",
                },
                {
                  name: "templates",
                  list: "/admin/catalog/templates",
                  create: "/admin/catalog/templates/create",
                  edit: "/admin/catalog/templates/edit/:id",
                },
                {
                  name: "themes",
                  list: "/admin/catalog/themes",
                  create: "/admin/catalog/themes/create",
                  edit: "/admin/catalog/themes/edit/:id",
                },
                {
                  name: "org_members",
                  list: "/admin/org-members",
                  create: "/admin/org-members/create",
                  edit: "/admin/org-members/edit/:id",
                },
                {
                  name: "platform_admins",
                  list: "/admin/platform-admins",
                  create: "/admin/platform-admins/create",
                  meta: {
                    canDelete: true,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: "P1mMN3-e4IWQs-NyoyQK",
              }}
            >
              <Routes>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-inner"
                      fallback={<CatchAllNavigate to="/admin/login" />}
                    >
                      <OrgProvider>
                        <ThemedLayout
                          Header={Header}
                          Sider={(props) => <ThemedSider {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayout>
                      </OrgProvider>
                    </Authenticated>
                  }
                >
                  <Route path="/admin">
                    <Route
                      index
                      element={<Navigate to="/admin/events" replace />}
                    />
                    <Route path="events">
                      <Route index element={<EventsList />} />
                      <Route path="create" element={<EventsCreate />} />
                      <Route path="edit/:id" element={<EventsEdit />} />
                    </Route>
                    <Route path="event-texts">
                      <Route index element={<EventTextsList />} />
                      <Route path="create" element={<EventTextsCreate />} />
                      <Route path="edit/:id" element={<EventTextsEdit />} />
                    </Route>
                    <Route path="event-domains">
                      <Route index element={<EventDomainsList />} />
                      <Route path="create" element={<EventDomainsCreate />} />
                      <Route path="edit/:id" element={<EventDomainsEdit />} />
                    </Route>
                    <Route path="photos">
                      <Route index element={<PhotosList />} />
                      <Route path="create" element={<PhotosCreate />} />
                      <Route path="edit/:id" element={<PhotosEdit />} />
                    </Route>
                    <Route path="upload-tokens">
                      <Route index element={<UploadTokensList />} />
                      <Route path="create" element={<UploadTokensCreate />} />
                      <Route path="edit/:id" element={<UploadTokensEdit />} />
                    </Route>
                    <Route path="catalog">
                      <Route path="event-types">
                        <Route index element={<EventTypesList />} />
                        <Route path="create" element={<EventTypesCreate />} />
                        <Route path="edit/:id" element={<EventTypesEdit />} />
                      </Route>
                      <Route path="templates">
                        <Route index element={<TemplatesList />} />
                        <Route path="create" element={<TemplatesCreate />} />
                        <Route path="edit/:id" element={<TemplatesEdit />} />
                      </Route>
                      <Route path="themes">
                        <Route index element={<ThemesList />} />
                        <Route path="create" element={<ThemesCreate />} />
                        <Route path="edit/:id" element={<ThemesEdit />} />
                      </Route>
                    </Route>
                    <Route path="org-members">
                      <Route index element={<OrgMembersList />} />
                      <Route path="create" element={<OrgMembersCreate />} />
                      <Route path="edit/:id" element={<OrgMembersEdit />} />
                    </Route>
                    <Route path="platform-admins">
                      <Route index element={<PlatformAdminsList />} />
                      <Route path="create" element={<PlatformAdminsCreate />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
                <Route
                  element={
                    <Authenticated
                      key="authenticated-outer"
                      fallback={<Outlet />}
                    >
                      <Navigate to="/admin" replace />
                    </Authenticated>
                  }
                >
                  <Route
                    path="/admin/login"
                    element={<AuthPage type="login" />}
                  />
                </Route>
              </Routes>

              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
