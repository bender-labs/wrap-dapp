import { PaperContent } from '../../../components/paper/Paper';
import AmountToWrapInput from '../../../components/token/AmountToWrapInput';
import React, { useEffect, useState } from 'react';
import TokenSelection from '../../../components/token/TokenSelection';
import { SupportedBlockchain } from '../../wallet/blockchain';
import BigNumber from 'bignumber.js';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { TokenMetadata } from '../../swap/token';
import { Fees } from '../../../config';
import { Button, makeStyles, createStyles } from '@material-ui/core';
import { wrapFees } from '../../fees/fees';
import AssetSummary from '../../../components/formatting/AssetSummary';
import { WrapStatus } from '../hooks/useWrap';
import MultiConnect from '../../wallet/MultiConnect';

const useStyles = makeStyles(() =>
  createStyles({
    buttonStyle: {
      color: 'black',
      backgroundColor: '#ffffff',
      width: "40%",
      borderRadius: '25px',
      float: 'right'

    },

  })
)

export type WrapInitialStepProps = {
  status: WrapStatus;
  balance: BigNumber;
  token: TokenMetadata;
  connected: boolean;
  amount: BigNumber;
  fees: Fees;
  onAmountChange: (v: BigNumber) => void;
  onTokenChange: (t: string) => void;
  tokens: Record<string, TokenMetadata>;
  onNext: () => void;
};

export default function WrapInitialStep({
  status,
  balance,
  connected,
  onAmountChange,
  token,
  amount,
  onTokenChange,
  tokens,
  fees,
  onNext,
}: WrapInitialStepProps) {
  const [currentFees, setCurrentFees] = useState(new BigNumber(0));

  const classes = useStyles()

  useEffect(() => setCurrentFees(wrapFees(amount, fees)), [amount, fees]);

  return (
    <>
      <PaperContent>
        {!connected && <MultiConnect />}
      </PaperContent>
      <PaperContent style={{ padding: '0 50px' }}>
        <TokenSelection
          token={token.ethereumSymbol}
          onTokenSelect={onTokenChange}
          blockchainTarget={SupportedBlockchain.Ethereum}
          tokens={tokens}
        />
        <AmountToWrapInput
          balance={balance}
          decimals={token.decimals}
          symbol={token.ethereumSymbol}
          onChange={onAmountChange}
          amountToWrap={amount}
          displayBalance={connected}
        />
      </PaperContent>
      {/*{ !amount.isZero() &&*/}
      {/*{if(!amount.isZero()) {*/}

      {/*}}*/}
      <PaperContent style={{ padding: '16px 0'}}>
        <AssetSummary
          label={'You will receive'}
          value={amount.minus(currentFees)}
          symbol={token.tezosSymbol}
          decimals={token.decimals}
        />
      </PaperContent>

      {/*}*/}
      {/*{ !amount.isZero() &&*/}

      <PaperContent style={{ borderRadius: '0 0 10px 10px', minHeight: '40px', padding: '50px 30px'}}>


        {connected && (

        <Button
        className={classes.buttonStyle}
        fullWidth
        variant={'contained'}
        color={'primary'}
        onClick={onNext}
        disabled={
        status !== WrapStatus.READY_TO_CONFIRM &&
        status !== WrapStatus.READY_TO_WRAP
      }
        >
        NEXT <ArrowRightAltIcon />
        </Button>

      )}

    
    </PaperContent>
      {/*}*/}
    </>
  );
}
