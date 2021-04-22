import React from 'react';
import { paths } from './routes';
import { Route } from 'react-router-dom';
import HistoryFlow from './HistoryFlow';
import { Container } from '@material-ui/core';

export default function HistoryScreen() {

  return (
    <>
      <Container maxWidth='xl'>
        <Route path={paths.HISTORY} component={HistoryFlow} />
      </Container>
    </>
    );
}
