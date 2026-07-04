import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import { Suspense, useEffect } from "react";
import { Route, Switch } from "wouter";
import Home from "./pages/home";
import { useAuthStore } from "./store/auth-store";
import { me } from "./services/auth";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import { usePreferencesStore } from "./store/preferences-store";
import i18n from "./i18n";
import ResetPassword from "./pages/reset-password";
import YourSpace from "./pages/your-space";
import Tenant from "./pages/tenant";

const queryClient = new QueryClient();

export default function App() {
  const { login, logout } = useAuthStore();

  const { language, theme } = usePreferencesStore();

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    me()
      .then((response) => {
        login(response);
      })
      .catch(() => {
        logout();
      });
  }, [login, logout]);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={"cargando"}>
        <Switch>
          <Route path={"/"}>
            <Home />
          </Route>
          <Route path={"/sign-in"}>
            <SignIn />
          </Route>
          <Route path={"/sign-up"}>
            <SignUp />
          </Route>
          <Route path={"/profile"}>
            <Profile />
          </Route>
          <Route path={"/settings"}>
            <Settings />
          </Route>
          <Route path={"/reset-password"}>
            <ResetPassword />
          </Route>
          <Route path={"/your-space"}>
            <YourSpace />
          </Route>
          <Route path="/your-space/:id">
            {(params) => <Tenant id={params.id} />}
          </Route>
        </Switch>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
