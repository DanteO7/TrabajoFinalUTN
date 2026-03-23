import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import { Suspense } from "react";
import { Route, Switch } from "wouter";
import Home from "./pages/home";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={"cargando"}>
        <Switch>
          <Route path={"/"}>
            <Home />
          </Route>
          <Route path={"sign-in"}>
            <SignIn />
          </Route>
          <Route path={"sign-up"}>
            <SignUp />
          </Route>
        </Switch>
      </Suspense>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
