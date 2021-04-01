import { Route } from 'react-router-dom';
import { paths } from './routes';
import { SwapDirectionTab } from '../features/swap/SwapDirectionTab';
import WrapInitialStep from '../features/wrap/components/WrapInitialStep';
import { useWrap } from '../features/wrap/hooks/useWrap';
import { useState } from 'react';
import WrapConfirmStep from '../features/wrap/components/WrapConfirmStep';

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
  } = useWrap();

  const [step, setStep] = useState(Step.AMOUNT);

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
          onWrap={launchWrap}
          onAuthorize={launchAllowanceApproval}
          onPrevious={() => setStep(Step.AMOUNT)}
        />
      )}
    </>
  );
}

export default function WrapFlow() {
  return (
    <>
      <Route exact path={paths.WRAP} component={Wrap} />
      <Route exact path={paths.WRAP_FINALIZE} />
    </>
  );
}
