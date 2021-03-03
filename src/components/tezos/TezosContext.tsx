import React, {Dispatch, PropsWithChildren, useCallback, useMemo} from "react";

import {NetworkType, RequestPermissionInput} from "@airgap/beacon-sdk";
import {TezosToolkit} from '@taquito/taquito';
import {BeaconWallet} from "@taquito/beacon-wallet";

export enum ConnectionStatus {
  UNINITIALIZED,
  CONNECTED
}

type State = {status: ConnectionStatus, wallet: BeaconWallet, library?: TezosToolkit, account?: string, network?: NetworkType}

enum ActionType {
  CONNECTED
}

type Action =
  | {type: ActionType.CONNECTED, network: NetworkType, account: string, library: TezosToolkit}

type Effects = {
  activate: (request: RequestPermissionInput) => Promise<string>
}

function reducer(state: State, {type, ...payload}: Action): State {
  switch (type) {
    case ActionType.CONNECTED: {
      const {network, account, library} = payload;
      return ({
        ...state,
        network,
        status: ConnectionStatus.CONNECTED,
        account,
        library
      });
    }
  }
}

function _activate(dispatch: Dispatch<Action>) {
  return (client: BeaconWallet) =>
    async (request: RequestPermissionInput) => {
      const library = new TezosToolkit(request.network?.rpcUrl || "");
      await client.requestPermissions(request);
      library.setWalletProvider(client);
      const account = await client.getPKH();
      dispatch({type: ActionType.CONNECTED, network: request.network?.type!, account, library});
      return account;
    }
}

const TezosContext = React.createContext<null | State & Effects>(null);

type Props = {
  getLibrary: () => BeaconWallet;
}

export default function Provider({getLibrary, children}: PropsWithChildren<Props>) {
  const wallet = useMemo(() => getLibrary(), []);
  const [state, dispatch] = React.useReducer(reducer, {status: ConnectionStatus.UNINITIALIZED, wallet: wallet});
  const activate = useCallback(_activate(dispatch)(wallet), []);

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