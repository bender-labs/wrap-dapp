import React from 'react';
import { paths } from './routes';
import { Route } from 'react-router-dom';
import HistoryDoneOperations from '../features/history/components/HistoryDoneOperations';
import { Container } from '@material-ui/core';

export default function HistoryScreen() {
  return (
    <>
      <Container maxWidth="xl">
        <Route path={paths.HISTORY} component={HistoryDoneOperations} />
      </Container>
    </>
  );
}
