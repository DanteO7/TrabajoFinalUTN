import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, useEffect, lazy } from "react";
import { Route, Switch } from "wouter";
import { useAuthStore } from "./store/auth-store";
import { me } from "./services/auth";
import { usePreferencesStore } from "./store/preferences-store";
import i18n from "./i18n";
import Loading from "./components/loading";
import { ProtectedRoute } from "./router/protected-route";
import Header from "./components/header";
import { useLocation } from "wouter";
import ForgotPassword from "./pages/forgot-password";
import { AdminRoute } from "./router/admin-route";

const Home = lazy(() => import("./pages/home"));
const SignIn = lazy(() => import("./pages/sign-in"));
const SignUp = lazy(() => import("./pages/sign-up"));
const VerifyCode = lazy(() => import("./pages/verify-code"));
const YourSpace = lazy(() => import("./pages/your-space"));
const Professors = lazy(() => import("./pages/tenant/professors"));
const Students = lazy(() => import("./pages/tenant/students"));
const Activities = lazy(() => import("./pages/tenant/activities"));
const Classes = lazy(() => import("./pages/tenant/classes"));
const StudentPlans = lazy(() => import("./pages/tenant/student-plans"));
const Specialities = lazy(() => import("./pages/tenant/specialities"));
const NotFound = lazy(() => import("./pages/not-found"));
const Profile = lazy(() => import("./pages/profile"));
const Settings = lazy(() => import("./pages/settings"));
const Payments = lazy(() => import("./pages/tenant/payments"));
const Groups = lazy(() => import("./pages/tenant/groups"));
const Invitation = lazy(() => import("./pages/invitation"));
const ResetPassword = lazy(() => import("./pages/reset-password"));
const Legal = lazy(() => import("./pages/legal"));
const PrivacyPolicy = lazy(() => import("./pages/privacy-policy"));
const Terms = lazy(() => import("./pages/terms"));
const Tenant = lazy(() => import("./pages/tenant"));
const Users = lazy(() => import("./pages/users"));
const Reservations = lazy(() => import("./pages/tenant/reservations"));
const TenantPlans = lazy(() => import("./pages/tenant-plans"));

const queryClient = new QueryClient();

export default function App() {
  const { login, logout } = useAuthStore();

  const [location] = useLocation();

  const noHeaderRoutes = [
    "/iniciar-sesion",
    "/registrarse",
    "/verificar-codigo",
    "/olvide-contraseña",
  ];
  const shouldShowHeader = !noHeaderRoutes.includes(location);

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
    <>
      {shouldShowHeader && <Header />}
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

            <Route path={"/verificar-codigo"}>
              <VerifyCode />
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

            <Route path={"/olvide-contraseña"}>
              <ForgotPassword />
            </Route>

            <Route path={"/tu-espacio"}>
              <YourSpace />
            </Route>

            <ProtectedRoute path="/tu-espacio/:id">
              {(params) => <Tenant id={params.id} />}
            </ProtectedRoute>

            <Route path={"/aviso-legal"}>
              <Legal />
            </Route>

            <Route path={"/politica-y-privacidad"}>
              <PrivacyPolicy />
            </Route>

            <Route path={"/terminos-y-condiciones"}>
              <Terms />
            </Route>

            <AdminRoute path={"/usuarios"}>
              <Users />
            </AdminRoute>

            <AdminRoute path={"/planes"}>
              <TenantPlans />
            </AdminRoute>

            <ProtectedRoute path="/tu-espacio/:id/alumnos">
              {(params) => <Students tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/profesores">
              {(params) => <Professors tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/clases">
              {(params) => <Classes tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/actividades">
              {(params) => <Activities tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/profesiones">
              {(params) => <Specialities tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/pagos">
              {(params) => <Payments tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/grupos">
              {(params) => <Groups tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/planes">
              {(params) => <StudentPlans tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/tu-espacio/:id/reservas">
              {(params) => <Reservations tenantId={params.id} />}
            </ProtectedRoute>

            <ProtectedRoute path="/invitacion/:token">
              {(params) => <Invitation token={params.token} />}
            </ProtectedRoute>

            <Route component={NotFound} />
          </Switch>
        </Suspense>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}
