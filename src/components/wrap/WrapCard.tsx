import React, { useEffect, useState } from 'react';
import {
  Button,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@material-ui/core';
import AmountToWrapInput from '../../features/wrap/components/AmountToWrapInput';
import AllowanceButton from '../../features/wrap/components/AllowanceButton';
import TokenSelection from '../../features/wrap/components/TokenSelection';
import { useWrap, WrapStatus } from '../../features/wrap/hooks/useWrap';
import { SupportedBlockchain } from '../../features/wallet/blockchain';
import WrapFees from '../../features/wrap/components/WrapFees';

export default function WrapCard() {
  const {
    status,
    amountToWrap,
    currentAllowance,
    currentBalance,
    token,
    decimals,
    launchAllowanceApproval,
    selectAmountToWrap,
    selectToken,
    launchWrap,
    fungibleTokens,
    fees,
  } = useWrap();
  const [step, setCurrentStep] = useState<number>(0);
  useEffect(() => {
    switch (status) {
      case WrapStatus.UNINITIALIZED:
        setCurrentStep(0);
        break;
      case WrapStatus.TOKEN_SELECTED:
        setCurrentStep(1);
        break;
      case WrapStatus.AMOUNT_TO_WRAP_SELECTED:
        setCurrentStep(2);
        break;
      case WrapStatus.READY_TO_WRAP:
        setCurrentStep(3);
        break;
    }
  }, [status]);

  return (
    <Stepper activeStep={step} orientation="vertical">
      <Step expanded={step > 0}>
        <StepLabel>Please select the token you wish to wrap</StepLabel>
        <StepContent>
          <TokenSelection
            token={token}
            onTokenSelect={selectToken}
            tokens={fungibleTokens}
            blockchainTarget={SupportedBlockchain.Ethereum}
          />
        </StepContent>
      </Step>
      <Step expanded={step > 1}>
        <StepLabel>Select the token amount you wish to wrap</StepLabel>
        <StepContent>
          <>
            <AmountToWrapInput
              balance={currentBalance}
              decimals={decimals}
              symbol={token}
              onChange={selectAmountToWrap}
              amountToWrap={amountToWrap}
              displayBalance={true}
            />
            <WrapFees
              fees={fees}
              decimals={decimals}
              symbol={token}
              amountToWrap={amountToWrap}
            />
          </>
        </StepContent>
      </Step>
      <Step expanded={step > 2}>
        <StepLabel>
          Please allow the bender contract to move your tokens
        </StepLabel>
        <StepContent>
          <AllowanceButton
            currentAllowance={currentAllowance}
            balanceToWrap={amountToWrap}
            decimals={decimals}
            onAuthorize={launchAllowanceApproval}
            loading={status === WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL}
            symbol={token}
          />
        </StepContent>
      </Step>
      <Step expanded={step > 3}>
        <StepLabel>You can launch the wrapping</StepLabel>
        <StepContent>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={launchWrap}
            disabled={false}
          >
            WRAP
          </Button>
        </StepContent>
      </Step>
    </Stepper>
  );
}
