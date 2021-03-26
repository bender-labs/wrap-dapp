import React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import AmountToWrapInput from './AmountToWrapInput';
import BigNumber from 'bignumber.js';
import TokenSelection from './TokenSelection';
import { SupportedBlockchain } from '../../wallet/blockchain';
import { TokenMetadata } from '../../swap/token';

export type WrapCardContentProps = {
  tokens: Record<string, TokenMetadata>;
  displayBalance: boolean;
  amount: BigNumber;
  onAmountChange: (v: BigNumber) => void;
  token: string;
  onTokenChange: (v: string) => void;
  balance: BigNumber;
};

export default function TokenAndAmountSelection({
  tokens,
  balance,
  displayBalance,
  amount,
  onAmountChange,
  token,
  onTokenChange,
}: WrapCardContentProps) {
  return (
    <Card variant={'outlined'}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <AmountToWrapInput
              balance={balance}
              decimals={18}
              symbol={token}
              onChange={onAmountChange}
              amountToWrap={amount}
              displayBalance={displayBalance}
            />
          </Grid>
          <Grid item xs={6}>
            <TokenSelection
              token={token}
              onTokenSelect={onTokenChange}
              tokens={tokens}
              blockchainTarget={SupportedBlockchain.Ethereum}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
