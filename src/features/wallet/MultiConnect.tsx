import { Step, StepButton, Stepper } from '@material-ui/core';
import TezosWalletConnection from '../../components/tezos/WalletConnection';
import EthWalletConnection from '../../components/ethereum/WalletConnection';
import React from 'react';
import { useWalletContext } from '../../runtime/wallet/WalletContext';

export default function MultiConnect() {
  const {
    ethereum: {
      activate: ethActivate,
      deactivate: ethDeactivate,
      account: ethAccount,
      connectors: ethConnectors,
      status: ethConnectionStatus,
    },
    tezos: {
      activate: tzActivate,
      deactivate: tzDeactivate,
      status: tzConnectionStatus,
      account: tzAccount,
    },
  } = useWalletContext();

  const activeStep = () => {
    if (tzAccount && ethAccount) {
      return 2;
    }
    if (tzAccount) {
      return 1;
    }
    return 0;
  };

  return (
    <Stepper style={ {backgroundColor: '#E5E5E5'}} alternativeLabel activeStep={activeStep()}>
      <Step>
        <StepButton component={'div'}>
          <TezosWalletConnection
            account={tzAccount}
            activate={tzActivate}
            deactivate={tzDeactivate}
            connectionStatus={tzConnectionStatus}
          />
        </StepButton>
      </Step>
      <Step>
        <StepButton component={'div'}>
          <EthWalletConnection
            account={ethAccount}
            activate={ethActivate}
            deactivate={ethDeactivate}
            connectors={ethConnectors}
            connectionStatus={ethConnectionStatus}
          />
        </StepButton>
      </Step>
    </Stepper>
  );
}
