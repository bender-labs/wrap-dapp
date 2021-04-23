import { Step, StepButton, Stepper } from '@material-ui/core';
import React from 'react';
import AllowanceButton from './AllowanceButton';
import BigNumber from 'bignumber.js';
import { WrapStatus } from '../hooks/useWrap';
import LoadableButton from '../../../components/button/LoadableButton';
import AllowanceLabel from './AllowanceLabel';

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
    <div style={{ borderRadius: '0 0 10px 10px', backgroundColor: '#e5e5e5' }}>
      <Stepper
        alternativeLabel
        activeStep={activeStep()}
        style={{ paddingBottom: 0, backgroundColor: '#e5e5e5' }}
      >
        <Step>
          <StepButton component="div">
            <AllowanceButton
              currentAllowance={currentAllowance}
              balanceToWrap={amountToWrap}
              onAuthorize={onAuthorize}
              loading={status === WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL}
            />
          </StepButton>
        </Step>
        <Step>
          <StepButton component="div">
            <LoadableButton
              loading={status === WrapStatus.WAITING_FOR_WRAP}
              variant={'contained'}
              onClick={onWrap}
              disabled={status !== WrapStatus.READY_TO_WRAP}
              text={'WRAP'}
              color={'primary'}
            />
          </StepButton>
        </Step>
      </Stepper>
      <div style={{ padding: 24 }}>
        <AllowanceLabel
          currentAllowance={currentAllowance}
          balanceToWrap={amountToWrap}
          decimals={decimals}
          symbol={token}
        />
      </div>
    </div>
  );
}
