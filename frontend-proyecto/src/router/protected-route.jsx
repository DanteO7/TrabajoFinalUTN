import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";
import Loading from "../components/loading";

export function ProtectedRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!isAuthenticated) return <Redirect to="/iniciar-sesion" />;

  return <Route {...rest} component={Component} />;
}
