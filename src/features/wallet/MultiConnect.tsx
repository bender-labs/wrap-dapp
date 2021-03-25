import { Box, Step, StepButton, Stepper } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useTezosContext } from '../../components/tezos/TezosContext';
import TezosWalletConnection from '../../components/tezos/WalletConnection';
import EthWalletConnection from '../../components/ethereum/WalletConnection';
import React from 'react';

export default function MultiConnect() {
  const {
    activate: ethActivate,
    active: ethActive,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();
  const {
    activate: tzActivate,
    status: tzConnectionStatus,
    account: tzAccount,
  } = useTezosContext();

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
    <Box>
      <Stepper alternativeLabel activeStep={activeStep()}>
        <Step>
          <StepButton component={'div'}>
            <TezosWalletConnection
              account={tzAccount}
              activate={tzActivate}
              status={tzConnectionStatus}
            />
          </StepButton>
        </Step>
        <Step>
          <StepButton component={'div'}>
            <EthWalletConnection
              account={ethAccount}
              activate={ethActivate}
              active={ethActive}
            />
          </StepButton>
        </Step>
      </Stepper>
    </Box>
  );
}
