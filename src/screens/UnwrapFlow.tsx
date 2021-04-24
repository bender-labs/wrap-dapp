import { SwapDirectionTab } from '../features/swap/SwapDirectionTab';
import React, { useEffect, useState } from 'react';
import { usePendingOperationsActions } from '../features/operations/state/pendingOperations';
import { useHistory } from 'react-router';
import UnwrapInitialStep from '../features/unwrap/components/UnwrapInitialStep';
import { useUnwrap } from '../features/unwrap/hooks/useUnwrap';
import UnwrapConfirmStep from '../features/unwrap/components/UnwrapConfirmStep';
import { paths, unwrapPage } from './routes';
import { Route } from 'react-router-dom';
import OperationScreen from './OperationScreen';
import { OperationType } from '../features/operations/state/types';
import { UnwrapStatus } from '../features/unwrap/hooks/reducer';

enum Step {
  AMOUNT,
  CONFIRM,
}

function UnwrapForm() {
  const [step, setStep] = useState(Step.AMOUNT);
  const {
    fees,
    fungibleTokens,
    launchUnwrap,
    selectAmountToUnwrap,
    selectToken,
    status,
    token,
    connected,
    currentBalance,
    amountToUnwrap,
    tzAccount,
    ethAccount,
    operation,
  } = useUnwrap();

  const { addOperation } = usePendingOperationsActions();

  const doLaunchUnwrap = async () => {
    const op = await launchUnwrap();
    if (!op) {
      return;
    }
    await addOperation(op);
    history.push(unwrapPage(op));
    return op;
  };

  useEffect(() => {
    if (status !== UnwrapStatus.READY_TO_UNWRAP || !operation) {
      return;
    }
    const nextStep = async () => {
      await addOperation(operation);
      history.push(unwrapPage(operation));
    };
    nextStep();
  }, [status, operation]);

  useEffect(() => {
    if (status === UnwrapStatus.NOT_READY && step === Step.CONFIRM) {
      setStep(Step.AMOUNT);
    }
  }, [status, step]);

  const history = useHistory();
  // noinspection RequiredAttributes
  return (
    <>
      {step === Step.AMOUNT && (
        <>
          <SwapDirectionTab />
          <UnwrapInitialStep
            status={status}
            tokens={fungibleTokens}
            token={fungibleTokens[token]}
            connected={connected}
            balance={currentBalance}
            amount={amountToUnwrap}
            fees={fees}
            onNext={() => setStep(Step.CONFIRM)}
            onTokenChange={selectToken}
            onAmountChange={selectAmountToUnwrap}
          />
        </>
      )}
      {step === Step.CONFIRM && (
        <UnwrapConfirmStep
          token={fungibleTokens[token]}
          status={status}
          recipientAddress={ethAccount!}
          sendingAddress={tzAccount!}
          amount={amountToUnwrap}
          fees={fees}
          onPrevious={() => setStep(Step.AMOUNT)}
          onUnwrap={doLaunchUnwrap}
        />
      )}
    </>
  );
}

function UnwrapReceipt() {
  return <OperationScreen type={OperationType.UNWRAP} />;
}

export default function UnwrapFlow() {
  return (
    <>
      <Route exact path={paths.UNWRAP} component={UnwrapForm} />
      <Route exact path={paths.UNWRAP_FINALIZE} component={UnwrapReceipt} />
    </>
  );
}
