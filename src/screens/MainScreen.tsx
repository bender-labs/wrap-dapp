import React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import { paths } from './routes';
import WrapFlow from './WrapFlow';
import UnwrapFlow from './UnwrapFlow';


export default function MainScreen({ location, history }: RouteComponentProps) {
  if (location.pathname === '/') {
    history.replace(paths.WRAP);
  }
  return (
    <>
      <Route path={paths.WRAP} component={WrapFlow} />
      <Route path={paths.UNWRAP} component={UnwrapFlow} />
    </>
  );
}
