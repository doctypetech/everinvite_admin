import { Authenticated, Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
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
import { Fragment, useMemo } from "react";
import authProvider from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { OrgProvider } from "./contexts/org";
import { accessControlProvider } from "./accessControlProvider";
import { createDataProvider } from "./providers/dataProvider";
import { liveProvider } from "@refinedev/supabase";
import { LoginPage } from "./pages/auth/Login";
import { GenericCreate, GenericEdit, GenericList } from "./pages/resources";
import { supabaseClient } from "./utility";
import {
  RESOURCE_DEFINITIONS,
  type ResourceDefinition,
} from "./config/resourceDefinitions";
import {
  RESOURCE_GROUP_DEFINITIONS,
  type ResourceGroupDefinition,
} from "./config/resourceGroups";
import { ResourceGroupPage } from "./pages/groups";

const dataProvider = createDataProvider();
const realtimeProvider = liveProvider(supabaseClient);

const mapResourceToRefine = (definition: ResourceDefinition) => ({
  name: definition.name,
  list: definition.routes.list,
  create: definition.routes.create,
  edit: definition.routes.edit,
  meta: {
    label: definition.label,
    hide: true,
  },
  options: {
    label: definition.label,
  },
  canDelete: definition.canDelete !== false,
});

const mapGroupToRefine = (definition: ResourceGroupDefinition) => ({
  name: definition.name,
  list: definition.route,
  meta: {
    label: definition.label,
  },
  options: {
    label: definition.label,
  },
  canDelete: false,
});

const stripAdminPrefix = (path?: string) =>
  path?.replace(/^\/?admin\/?/, "") ?? undefined;

function App() {
  const refineResources = useMemo(
    () => [
      ...RESOURCE_GROUP_DEFINITIONS.map(mapGroupToRefine),
      ...RESOURCE_DEFINITIONS.map(mapResourceToRefine),
    ],
    []
  );

  const defaultGroup = RESOURCE_GROUP_DEFINITIONS[0];
  const groupRouteNames = useMemo(
    () =>
      new Set(
        RESOURCE_GROUP_DEFINITIONS.map((definition) =>
          stripAdminPrefix(definition.route)
        ).filter((route): route is string => Boolean(route))
      ),
    []
  );

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
              resources={refineResources}
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
                      element={
                        <Navigate
                          to={defaultGroup?.route ?? "/admin/event"}
                          replace
                        />
                      }
                    />
                    {RESOURCE_GROUP_DEFINITIONS.map((definition) => {
                      const groupPath = stripAdminPrefix(definition.route);

                      if (!groupPath) {
                        return null;
                      }

                      return (
                        <Route
                          key={`group-${definition.name}`}
                          path={groupPath}
                          element={
                            <ResourceGroupPage groupName={definition.name} />
                          }
                        />
                      );
                    })}
                    {RESOURCE_DEFINITIONS.map((definition) => {
                      const listPath = stripAdminPrefix(
                        definition.routes.list
                      );
                      const createPath = stripAdminPrefix(
                        definition.routes.create
                      );
                      const editPath = stripAdminPrefix(
                        definition.routes.edit
                      );

                      return (
                        <Fragment key={definition.name}>
                          {listPath && !groupRouteNames.has(listPath) && (
                            <Route
                              path={listPath}
                              element={<GenericList />}
                            />
                          )}
                          {createPath && (
                            <Route
                              path={createPath}
                              element={<GenericCreate />}
                            />
                          )}
                          {editPath && (
                            <Route path={editPath} element={<GenericEdit />} />
                          )}
                        </Fragment>
                      );
                    })}
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
                    <Route path="/admin/login" element={<LoginPage />} />
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
