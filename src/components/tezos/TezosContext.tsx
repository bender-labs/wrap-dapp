
import React, {Dispatch, DispatchWithoutAction, PropsWithChildren, ReactChildren, useCallback, useMemo} from "react";

import {
  DAppClient,
  NetworkType,
  PermissionRequestInput,
  PermissionResponseOutput
} from "@airgap/beacon-sdk";
import {tap} from "../../features/tap";
import {network} from "../../../../../example/web3-react/example/connectors";

enum StateStatus {
  UNINITIALIZED,
  CONNECTED
}

type State =
  | {status: StateStatus.UNINITIALIZED, library: DAppClient}
  | {status: StateStatus.CONNECTED, library: DAppClient, account: string, network: NetworkType}

enum ActionType {
  CONNECTED
}

type Action =
  | {type: ActionType.CONNECTED, network: NetworkType}

type Effects = {
  activate: (request: PermissionRequestInput) => void
}

function reducer(state: State, {type, ...payload}: Action): State {
  switch (type) {
    case ActionType.CONNECTED: {
      const {network} = payload;
      return ({
        ...state,
        network,
        status: StateStatus.CONNECTED,
        account: "lolilol"
      });
    }
  }
}

function _activate(dispatch: Dispatch<Action>) {
  return (client: DAppClient) =>
    async (request: PermissionRequestInput) => {
      await client
        .requestPermissions(request)
        .then(tap(
          (output: PermissionResponseOutput) => dispatch({type: ActionType.CONNECTED, network: request.network.type})
        ));
    }
}

const TezosContext = React.createContext<null | State & Effects>(null);

type Props = {
  getLibrary: () => DAppClient;
}

export default function Provider({getLibrary, children}: PropsWithChildren<Props>) {
  const library = useMemo(() => getLibrary(), []);
  const [state, dispatch] = React.useReducer(reducer, {status: StateStatus.UNINITIALIZED, library});
  const activate = useCallback(_activate(dispatch)(library), []);

  return (
    <TezosContext.Provider value={{...state, activate}}>
      {children}
    </TezosContext.Provider>
    );
}

export function useTezosContext() {
  const context = React.useContext(TezosContext)
  if (context == null) {
    throw new Error('useTezosContext must be used within a TezosContext')
  }
  return context;
}