import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  makeStyles,
  Step,
  StepContent,
  StepLabel,
  Stepper,
} from '@material-ui/core';
import { UnwrapStatus, useUnwrap } from './useUnwrap';
import { SupportedBlockchain } from '../../features/wallet/blockchain';
import TokenSelection from '../../features/wrap/components/TokenSelection';
import AmountToWrapInput from '../../features/wrap/components/AmountToWrapInput';
import UnwrapFees from './UnwrapFees';

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1,
  },
}));

export default function UnwrapCard() {
  const classes = useStyles();

  const {
    status,
    amountToUnwrap,
    currentBalance,
    token,
    decimals,
    selectAmountToUnwrap,
    selectToken,
    launchWrap,
    fungibleTokens,
    fees,
  } = useUnwrap();
  const [step, setCurrentStep] = useState<number>(0);
  useEffect(() => {
    switch (status) {
      case UnwrapStatus.UNINITIALIZED:
        setCurrentStep(0);
        break;
      case UnwrapStatus.TOKEN_SELECTED:
        setCurrentStep(1);
        break;
      case UnwrapStatus.AMOUNT_TO_WRAP_SELECTED:
        setCurrentStep(2);
        break;
      case UnwrapStatus.READY_TO_UNWRAP:
        setCurrentStep(3);
        break;
    }
  }, [status]);

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
        <Stepper activeStep={step} orientation="vertical">
          <Step expanded={step > 0}>
            <StepLabel>Please select the token you wish to unwrap</StepLabel>
            <StepContent>
              <TokenSelection
                token={token}
                onTokenSelect={selectToken}
                tokens={fungibleTokens}
                blockchainTarget={SupportedBlockchain.Tezos}
              />
            </StepContent>
          </Step>
          <Step expanded={step > 1}>
            <StepLabel>Select the token amount you wish to unwrap</StepLabel>
            <StepContent>
              <>
                <AmountToWrapInput
                  balance={currentBalance}
                  decimals={decimals}
                  displayBalance={true}
                  symbol={fungibleTokens[token]?.tezosSymbol}
                  onChange={selectAmountToUnwrap}
                  amountToWrap={amountToUnwrap}
                />
                <UnwrapFees
                  fees={fees}
                  decimals={decimals}
                  symbol={token}
                  amountToUnwrap={amountToUnwrap}
                />
              </>
            </StepContent>
          </Step>
          <Step expanded={step > 2}>
            <StepLabel>You can launch the unwrapping</StepLabel>
            <StepContent>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={launchWrap}
                disabled={false}
              >
                UNWRAP
              </Button>
            </StepContent>
          </Step>
        </Stepper>
      </CardContent>
    </Card>
  );
}
