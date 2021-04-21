import React from 'react';
import { paths } from './routes';
import { Route } from 'react-router-dom';
import HistoryFlow from './HistoryFlow';

export default function HistoryScreen() {

  return (
    <>
      <Route path={paths.HISTORY} component={HistoryFlow} />
    </>
    );
}
