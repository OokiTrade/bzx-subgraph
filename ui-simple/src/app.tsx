import * as React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { Charts } from "./pages/charts/charts";

export const App = () => {

  return (
    <>
      <HashRouter>
        <Switch>
          <Route exact={true} path="/" component={Charts} init={true}/>
          <Route path="/charts" component={Charts}/>
        </Switch>
      </HashRouter>
    </>
  );
};
