import { Route } from 'react-router-dom';
import { paths } from './routes';
import { SwapDirectionTab } from '../features/swap/SwapDirectionTab';

function Unwrap() {
  // noinspection RequiredAttributes
  return (
    <>
      <SwapDirectionTab />
    </>
  );
}

export default function UnwrapFlow() {
  return (
    <>
      <Route exact path={paths.UNWRAP} component={Unwrap} />
      <Route exact path={paths.UNWRAP_FINALIZE} />
    </>
  );
}
