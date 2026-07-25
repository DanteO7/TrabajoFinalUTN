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
import PrivacyPolicy from "./pages/privacy-policy";
import Legal from "./pages/legal";
import Terms from "./pages/terms";
import Students from "./pages/tenant/students";
import Professors from "./pages/tenant/professors";
import Classes from "./pages/tenant/classes";
import Activities from "./pages/tenant/activities";
import Specialities from "./pages/tenant/specialities";
import Payments from "./pages/tenant/payments";
import Groups from "./pages/tenant/groups";
import Invitation from "./pages/invitation";
import Loading from "./components/loading";

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
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path={"/"}>
            <Home />
          </Route>

          <Route path={"/iniciar-sesion"}>
            <SignIn />
          </Route>

          <Route path={"/registrarse"}>
            <SignUp />
          </Route>

          <Route path={"/perfil"}>
            <Profile />
          </Route>

          <Route path={"/ajustes"}>
            <Settings />
          </Route>

          <Route path={"/resetear-contraseña"}>
            <ResetPassword />
          </Route>

          <Route path={"/tu-espacio"}>
            <YourSpace />
          </Route>

          <Route path="/tu-espacio/:id">
            {(params) => <Tenant id={params.id} />}
          </Route>

          <Route path={"/aviso-legal"}>
            <Legal />
          </Route>

          <Route path={"/politica-y-privacidad"}>
            <PrivacyPolicy />
          </Route>

          <Route path={"/terminos-y-condiciones"}>
            <Terms />
          </Route>

          <Route path="/tu-espacio/:id/alumnos">
            {(params) => <Students tenantId={params.id} />}
          </Route>

          <Route path="/tu-espacio/:id/profesores">
            {(params) => <Professors tenantId={params.id} />}
          </Route>

          <Route path="/tu-espacio/:id/clases">
            {(params) => <Classes tenantId={params.id} />}
          </Route>

          <Route path="/tu-espacio/:id/actividades">
            {(params) => <Activities tenantId={params.id} />}
          </Route>

          <Route path="/tu-espacio/:id/especialidades">
            {(params) => <Specialities tenantId={params.id} />}
          </Route>

          <Route path="/tu-espacio/:id/pagos">
            {(params) => <Payments tenantId={params.id} />}
          </Route>

          <Route path="/tu-espacio/:id/grupos">
            {(params) => <Groups tenantId={params.id} />}
          </Route>

          <Route path="/invitacion/:token">
            {(params) => <Invitation token={params.token} />}
          </Route>
        </Switch>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
