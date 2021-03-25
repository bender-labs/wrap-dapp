import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import AmountToWrapInput from '../../components/wrap/AmountToWrapInput';
import BigNumber from 'bignumber.js';
import TokenSelection from '../../components/wrap/TokenSelection';
import { SupportedBlockchain } from '../wallet/blockchain';
import { TokenMetadata } from '../swap/token';

export type WrapCardContentProps = {
  tokens: Record<string, TokenMetadata>;
};

export default function WrapCardContent(props: WrapCardContentProps) {
  const [token, setToken] = useState('');
  const [amountToWrap, setAmountToWrap] = useState<BigNumber>(new BigNumber(0));

  return (
    <Grid container spacing={3}>
      <Grid item xs={6}>
        <AmountToWrapInput
          balance={new BigNumber(0)}
          decimals={18}
          symbol={token}
          onChange={setAmountToWrap}
          amountToWrap={amountToWrap}
        />
      </Grid>
      <Grid item xs={6} spacing={1}>
        <TokenSelection
          token={token}
          onTokenSelect={setToken}
          tokens={props.tokens}
          blockchainTarget={SupportedBlockchain.Ethereum}
        />
      </Grid>
    </Grid>
  );
}
