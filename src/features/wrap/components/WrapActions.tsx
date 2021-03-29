import { Button, Step, StepButton, Stepper } from '@material-ui/core';
import React from 'react';
import AllowanceButton from './AllowanceButton';
import BigNumber from 'bignumber.js';
import { WrapStatus } from '../hooks/useWrap';

export type WrapActionsProp = {
  currentAllowance: BigNumber;
  amountToWrap: BigNumber;
  decimals: number;
  onAuthorize: () => void;
  onWrap: () => void;
  status: WrapStatus;
  token: string;
};

export default function WrapActions({
  currentAllowance,
  amountToWrap,
  decimals,
  onAuthorize,
  status,
  token,
  onWrap,
}: WrapActionsProp) {
  const activeStep = () => {
    if (status === WrapStatus.READY_TO_WRAP) {
      return 1;
    }
    return 0;
  };

  return (
    <Stepper alternativeLabel activeStep={activeStep()}>
      <Step>
        <StepButton component="div">
          <AllowanceButton
            currentAllowance={currentAllowance}
            balanceToWrap={amountToWrap}
            decimals={decimals}
            onAuthorize={onAuthorize}
            loading={status === WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL}
            symbol={token}
          />
        </StepButton>
      </Step>
      <Step>
        <StepButton component="div">
          <Button
            variant="contained"
            color="primary"
            onClick={onWrap}
            disabled={status !== WrapStatus.READY_TO_WRAP}
          >
            WRAP
          </Button>
        </StepButton>
      </Step>
    </Stepper>
  );
}