import React from 'react';
import TokenAndAmountSelection from '../../components/token/TokenAndAmountSelection';
import { Box, Card, CardContent } from '@material-ui/core';
import MultiConnect from '../wallet/MultiConnect';
import WrapActions from './components/WrapActions';
import { useWrap } from './hooks/useWrap';
import WrapFees from './components/WrapFees';
import { SupportedBlockchain } from '../wallet/blockchain';
import { usePendingOperationsActions } from '../operations/state/pendingOperations';

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
  const { addOperation } = usePendingOperationsActions();

  const doWrap = async () => {
    const op = await launchWrap();
    addOperation(op);
  };

  return (
    <Card>
      <CardContent>
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
            onWrap={doWrap}
          />
        )}
      </CardContent>
    </Card>
  );
}
