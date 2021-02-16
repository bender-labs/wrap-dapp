
import React, {Dispatch, DispatchWithoutAction, PropsWithChildren, ReactChildren, useCallback, useMemo} from "react";

import {
  DAppClient,
  NetworkType,
  PermissionResponseOutput,
  RequestPermissionInput
} from "@airgap/beacon-sdk";
import {tap} from "../../features/tap";

export enum ConnectionStatus {
  UNINITIALIZED,
  CONNECTED
}

type State = {status: ConnectionStatus, library: DAppClient, account?: string, network?: NetworkType}

enum ActionType {
  CONNECTED
}

type Action =
  | {type: ActionType.CONNECTED, network: NetworkType}

type Effects = {
  activate: (request: RequestPermissionInput) => void
}

function reducer(state: State, {type, ...payload}: Action): State {
  switch (type) {
    case ActionType.CONNECTED: {
      console.log("connected");
      const {network} = payload;
      return ({
        ...state,
        network,
        status: ConnectionStatus.CONNECTED,
        account: "lolilol"
      });
    }
  }
}

function _activate(dispatch: Dispatch<Action>) {
  return (client: DAppClient) =>
    async (request: RequestPermissionInput) => {
      await client
        .requestPermissions(request)
        .then(tap(
          (output: PermissionResponseOutput) => dispatch({type: ActionType.CONNECTED, network: request.network?.type!})
        ));
    }
}

const TezosContext = React.createContext<null | State & Effects>(null);

type Props = {
  getLibrary: () => DAppClient;
}

export default function Provider({getLibrary, children}: PropsWithChildren<Props>) {
  const library = useMemo(() => getLibrary(), []);
  const [state, dispatch] = React.useReducer(reducer, {status: ConnectionStatus.UNINITIALIZED, library});
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