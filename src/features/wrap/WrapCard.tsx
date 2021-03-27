import React from 'react';
import TokenAndAmountSelection from './components/TokenAndAmountSelection';
import { Box } from '@material-ui/core';
import MultiConnect from '../wallet/MultiConnect';
import WrapActions from './components/WrapActions';
import { useWrap } from './hooks/useWrap';
import WrapFees from './components/WrapFees';
import { SupportedBlockchain } from '../wallet/blockchain';

export default function WrapCard() {
  const {
    status,
    amountToWrap,
    currentAllowance,
    currentBalance,
    token,
    launchAllowanceApproval,
    selectAmountToWrap,
    selectToken,
    launchWrap,
    connected,
    fungibleTokens,
    fees,
  } = useWrap();

  return (
    <Box>
      <TokenAndAmountSelection
        tokens={fungibleTokens}
        balance={currentBalance}
        displayBalance={connected}
        amount={amountToWrap}
        onAmountChange={selectAmountToWrap}
        token={token}
        onTokenChange={selectToken}
        blockchainTarget={SupportedBlockchain.Ethereum}
      />
      <Box mt={2}>
        <WrapFees
          fees={fees}
          decimals={fungibleTokens[token].decimals}
          symbol={token}
          amountToWrap={amountToWrap}
        />
      </Box>
      {!connected && <MultiConnect />}
      {connected && (
        <WrapActions
          amountToWrap={amountToWrap}
          currentAllowance={currentAllowance}
          token={token}
          decimals={fungibleTokens[token].decimals}
          status={status}
          onAuthorize={launchAllowanceApproval}
          onWrap={launchWrap}
        />
      )}
    </Box>
  );
}
