import { Route, useParams } from 'react-router-dom';
import { paths } from './routes';
import { SwapDirectionTab } from '../features/swap/SwapDirectionTab';
import WrapInitialStep from '../features/wrap/components/WrapInitialStep';
import { useWrap } from '../features/wrap/hooks/useWrap';
import React, { useState } from 'react';
import WrapConfirmStep from '../features/wrap/components/WrapConfirmStep';
import { usePendingOperationsActions } from '../features/operations/state/pendingOperations';
import { OperationType } from '../features/operations/state/types';
import WrapReceipt from '../features/wrap/components/WrapReceipt';
import { useHistory } from 'react-router';
import { useOperation } from '../features/operations/state/useOperation';

enum Step {
  AMOUNT,
  CONFIRM,
}

function Wrap() {
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
    ethAccount,
    tzAccount,
  } = useWrap();

  const [step, setStep] = useState(Step.AMOUNT);
  const { addOperation } = usePendingOperationsActions();

  const history = useHistory();

  const doLaunchWrap = async () => {
    const op = await launchWrap();
    await addOperation(op);
    history.push(`/wrap/${op.transactionHash}`);
    return op;
  };

  // noinspection RequiredAttributes
  return (
    <>
      {step === Step.AMOUNT && (
        <>
          <SwapDirectionTab />
          <WrapInitialStep
            status={status}
            tokens={fungibleTokens}
            token={fungibleTokens[token]}
            connected={connected}
            balance={currentBalance}
            amount={amountToWrap}
            fees={fees}
            onNext={() => setStep(Step.CONFIRM)}
            onTokenChange={selectToken}
            onAmountChange={selectAmountToWrap}
          />
        </>
      )}
      {step === Step.CONFIRM && (
        <WrapConfirmStep
          token={fungibleTokens[token]}
          fees={fees}
          amount={amountToWrap}
          status={status}
          currentAllowance={currentAllowance}
          recipientAddress={tzAccount!}
          sendingAddress={ethAccount!}
          onWrap={doLaunchWrap}
          onAuthorize={launchAllowanceApproval}
          onPrevious={() => setStep(Step.AMOUNT)}
        />
      )}
    </>
  );
}

function WrapFinalize() {
  const { transactionHash } = useParams() as { transactionHash: string };
  const { operation, fungibleTokens } = useOperation(transactionHash);
  const { mintErc20 } = usePendingOperationsActions();
  if (operation?.type === OperationType.WRAP) {
    return (
      <WrapReceipt
        operation={operation}
        tokens={fungibleTokens}
        onMint={() => mintErc20(operation).then(() => {})}
      />
    );
  }
  return <></>;
}

export default function WrapFlow() {
  return (
    <>
      <Route exact path={paths.WRAP} component={Wrap} />
      <Route exact path={paths.WRAP_FINALIZE} component={WrapFinalize} />
    </>
  );
}
