import React from 'react';
import TokenAndAmountSelection from '../wrap/components/TokenAndAmountSelection';
import { Box } from '@material-ui/core';
import { useUnwrap } from '../../components/unwrap/useUnwrap';
import { SupportedBlockchain } from '../wallet/blockchain';
import UnwrapFees from '../../components/unwrap/UnwrapFees';
import MultiConnect from '../wallet/MultiConnect';
import UnwrapActions from './components/UnwrapActions';

export default function UnwrapCard() {
  const {
    status,
    amountToUnwrap,
    currentBalance,
    token,
    selectAmountToUnwrap,
    selectToken,
    launchWrap,
    fungibleTokens,
    fees,
    connected,
  } = useUnwrap();
  return (
    <Box>
      <TokenAndAmountSelection
        tokens={fungibleTokens}
        blockchainTarget={SupportedBlockchain.Tezos}
        balance={currentBalance}
        displayBalance={connected}
        amount={amountToUnwrap}
        onAmountChange={selectAmountToUnwrap}
        token={token}
        onTokenChange={selectToken}
      />
      <Box mt={2}>
        <UnwrapFees
          fees={fees}
          decimals={fungibleTokens[token].decimals}
          symbol={token}
          amountToUnwrap={amountToUnwrap}
        />
      </Box>
      {!connected && <MultiConnect />}
      {connected && <UnwrapActions status={status} onUnwrap={launchWrap} />}
    </Box>
  );
}
