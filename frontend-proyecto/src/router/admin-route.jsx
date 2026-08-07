import { Redirect, Route } from "wouter";
import { useAuthStore } from "../store/auth-store";
import Loading from "../components/loading";
import NotFound from "../pages/not-found";

export function AdminRoute({ component: Component, ...rest }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <Loading />;

  if (!user.roles.includes("Admin")) return <NotFound />;

  return <Route {...rest} component={Component} />;
}
