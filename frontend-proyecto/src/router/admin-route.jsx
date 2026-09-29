import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";
import Loading from "../components/loading";

export function AdminRoute({ component: Component, ...rest }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!user) return <Redirect to="/iniciar-sesion" />;

  if (!user.roles?.includes("Admin")) return <Redirect to="/not-found" />;

  return <Route {...rest} component={Component} />;
}
