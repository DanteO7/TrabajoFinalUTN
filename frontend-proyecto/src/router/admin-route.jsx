import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";
import Loading from "../components/loading";

export function AdminRoute({
  component: Component,
  unauthorizedComponent: UnauthorizedComponent,
  ...rest
}) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!user) return <Redirect to="/iniciar-sesion" />;

  if (!user.roles?.includes("Admin")) {
    return <Route {...rest} component={UnauthorizedComponent} />;
  }

  return <Route {...rest} component={Component} />;
}
