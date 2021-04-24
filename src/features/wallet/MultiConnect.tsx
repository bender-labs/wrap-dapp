import {
  Step,
  StepConnector,
  StepIconProps,
  StepLabel,
  Stepper,
  withStyles,
} from '@material-ui/core';
import TezosWalletConnection from '../../components/tezos/WalletConnection';
import EthWalletConnection from '../../components/ethereum/WalletConnection';
import React from 'react';
import clsx from 'clsx';
import { useWalletContext } from '../../runtime/wallet/WalletContext';
import { makeStyles } from '@material-ui/core/styles';
import CheckIcon from '@material-ui/icons/Check';

const CustomConnector = withStyles((theme) => ({
  alternativeLabel: {
    top: 14,
  },
  active: {
    '& $line': {
      backgroundColor: theme.palette.primary.main,
    },
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
}))(StepConnector);

const useCustomStepIconStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#FFFFFF',
    zIndex: 1,
    color: '#000',
    width: 32,
    height: 32,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completed: {
    backgroundColor: theme.palette.primary.main,
  },
}));

function CustomStepIcon(props: StepIconProps) {
  const classes = useCustomStepIconStyles();
  const { completed } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: completed ? <CheckIcon /> : <span>1</span>,
    2: completed ? <CheckIcon /> : <span>2</span>,
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.completed]: completed,
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

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
    <Stepper
      style={{
        backgroundColor: '#E5E5E5',
        padding: '24px 0px',
        fontWeight: 900,
      }}
      alternativeLabel
      activeStep={activeStep()}
      connector={<CustomConnector />}
    >
      <Step>
        <StepLabel StepIconComponent={CustomStepIcon}>
          <TezosWalletConnection
            account={tzAccount}
            activate={tzActivate}
            deactivate={tzDeactivate}
            connectionStatus={tzConnectionStatus}
            withConnectionStatus={false}
          />
        </StepLabel>
      </Step>
      <Step>
        <StepLabel StepIconComponent={CustomStepIcon}>
          <EthWalletConnection
            account={ethAccount}
            activate={ethActivate}
            deactivate={ethDeactivate}
            connectors={ethConnectors}
            connectionStatus={ethConnectionStatus}
            withConnectionStatus={false}
          />
        </StepLabel>
      </Step>
    </Stepper>
  );
}
