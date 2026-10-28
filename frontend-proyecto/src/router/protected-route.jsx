import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";
import Loading from "../components/loading";

export function ProtectedRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!isAuthenticated) {
    const currentUrl =
      window.location.pathname + window.location.search + window.location.hash;

    const loginUrl = `/iniciar-sesion?returnUrl=${encodeURIComponent(
      currentUrl,
    )}`;

    return <Redirect to={loginUrl} />;
  }

  return <Route {...rest} component={Component} />;
}
