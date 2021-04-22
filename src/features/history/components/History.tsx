import React from 'react';
import { PaperContent } from '../../../components/paper/Paper';
import { AllOperationsHistoryState } from '../../operations/hooks/useAllOperationsHistory';

import { makeStyles, createStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles({
    title: {
      textAlign: 'center',
      fontWeight: 'bold'
    },
    mints: {
      border: "2px solid red",
      margin: '5px 0',
      padding: '5px 5px',
      borderRadius: '10px',
      backgroundColor: '#ffffff',
      overflowWrap: 'break-word',
      textOverflow: 'ellipsis'
    },
    burns: {
      border: "2px solid blue",
      margin: '5px 0',
      padding: '5px 5px',
      borderRadius: '10px',
      backgroundColor: '#ffffff',
      overflowWrap: 'break-word',
    }

  })
)


export type HistoryProps = {
  operations: AllOperationsHistoryState;
  canFetch: boolean;
};

export default function History({ operations, canFetch }: HistoryProps) {

  const classes= useStyles()
  return (
    <>


      <PaperContent>
        <div>
          {!canFetch && <span>Connect at least one of your wallet</span>}
          {canFetch && (
            <>
              <Typography className={classes.title}>
                Mints
              </Typography>
              {operations.mints.map((mint) => (
                <div className={classes.mints} key={mint.transactionHash}>{mint.transactionHash}</div>
              ))}
              <Typography className={classes.title}>
                Burns
              </Typography>
              {operations.burns.map((burn) => (
                <div className={classes.burns} key={burn.operationHash}>{burn.operationHash}</div>
              ))}
            </>
          )}
        </div>
      </PaperContent>

    </>
  );
}
