import React, {Dispatch, PropsWithChildren, useCallback, useMemo} from "react";

import {NetworkType, RequestPermissionInput} from "@airgap/beacon-sdk";
import {BeaconWallet} from "@taquito/beacon-wallet";

export enum ConnectionStatus {
  UNINITIALIZED,
  CONNECTED
}

type State = {status: ConnectionStatus, library: BeaconWallet, account?: string, network?: NetworkType}

enum ActionType {
  CONNECTED
}

type Action =
  | {type: ActionType.CONNECTED, network: NetworkType, account: string}

type Effects = {
  activate: (request: RequestPermissionInput) => Promise<string>
}

function reducer(state: State, {type, ...payload}: Action): State {
  switch (type) {
    case ActionType.CONNECTED: {
      const {network, account} = payload;
      return ({
        ...state,
        network,
        status: ConnectionStatus.CONNECTED,
        account
      });
    }
  }
}

function _activate(dispatch: Dispatch<Action>) {
  return (client: BeaconWallet) =>
    async (request: RequestPermissionInput) => {
      await client.requestPermissions(request)
      const account = await client.getPKH();
      dispatch({type: ActionType.CONNECTED, network: request.network?.type!, account});
      return account;
    }
}

const TezosContext = React.createContext<null | State & Effects>(null);

type Props = {
  getLibrary: () => BeaconWallet;
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