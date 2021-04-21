import React from 'react';
import { PaperContent } from '../../../components/paper/Paper';
import { UnwrapErc20Operation, WrapErc20Operation } from '../../operations/state/types';
import { ReceiptStatus } from '../../operations/hooks/useOperation';
import { ConnectionStatus } from '../../wallet/connectionStatus';
import { Typography } from '@material-ui/core';

export type HistoryProps = {
  mints: WrapErc20Operation[];
  burns: UnwrapErc20Operation[];
  status: ReceiptStatus;
  walletStatus: ConnectionStatus;
};

function HistoryStatus(
  mints: WrapErc20Operation[],
  burns: UnwrapErc20Operation[],
  status: ReceiptStatus,
  walletStatus: ConnectionStatus
) {

    if(mints.length > 0) {
      return (
        <PaperContent>
          <Typography>
            {mints[0].amount} {status} {walletStatus}
          </Typography>
        </PaperContent>
      )
    }
}
export default function History({
  mints,
  burns,
  status,
  walletStatus,
}: HistoryProps) {


  return (
    <>
      <PaperContent >
        <h1>Past Transaction History</h1>

      </PaperContent>


      <PaperContent>
        <div>
          {HistoryStatus(
            mints,
            burns,
            status,
            walletStatus
          )}
        </div>
      </PaperContent>
      <PaperContent>
        <p>faux transaction</p>
      </PaperContent>
    </>
  )
}