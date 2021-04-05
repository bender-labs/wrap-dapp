import { SwapDirectionTab } from '../features/swap/SwapDirectionTab';
import WrapInitialStep from '../features/wrap/components/WrapInitialStep';
import { useWrap } from '../features/wrap/hooks/useWrap';
import React, { useState } from 'react';
import WrapConfirmStep from '../features/wrap/components/WrapConfirmStep';
import { usePendingOperationsActions } from '../features/operations/state/pendingOperations';
import { useHistory } from 'react-router';
import { operationPage } from './routes';

enum Step {
  AMOUNT,
  CONFIRM,
}

export default function WrapFlow() {
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
    history.push(operationPage(op));
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
