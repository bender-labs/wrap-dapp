import {ethers} from "ethers";
import {useCallback, useEffect, useReducer} from "react";
import {TokenMetadata} from "../../features/swap/token";
import {TezosUnwrapApiFactory, TezosUnwrapApi} from "../../features/tezos/TezosUnwrapApi";

type UnwrapState = {
  status: UnwrapStatus,
  token: string,
  decimals: number,
  contract: TezosUnwrapApi | null,
  currentBalance: ethers.BigNumber,
  amountToUnwrap: ethers.BigNumber,
}

export enum UnwrapStatus {
  UNINITIALIZED,
  TOKEN_SELECTED,
  USER_BALANCE_FETCHED,
  AMOUNT_TO_WRAP_SELECTED,
  READY_TO_UNWRAP
}

type Action =
  | { type: UnwrapStatus.TOKEN_SELECTED, payload: { token: string, decimals: number, contract: TezosUnwrapApi } }
  | { type: UnwrapStatus.USER_BALANCE_FETCHED, payload: { currentBalance: ethers.BigNumber } }
  | { type: UnwrapStatus.AMOUNT_TO_WRAP_SELECTED, payload: { amountToUnwrap: ethers.BigNumber } }
  | { type: UnwrapStatus.READY_TO_UNWRAP, payload: { newCurrentAllowance: ethers.BigNumber } }

function reducer(state: UnwrapState, action: Action): UnwrapState {
  switch (action.type) {
    case UnwrapStatus.TOKEN_SELECTED:
      return {
        status: UnwrapStatus.TOKEN_SELECTED,
        ...action.payload,
        currentBalance: ethers.BigNumber.from(0),
        amountToUnwrap: ethers.BigNumber.from(0)
      };
    case UnwrapStatus.USER_BALANCE_FETCHED:
      return {
        ...state,
        status: UnwrapStatus.USER_BALANCE_FETCHED,
        ...action.payload
      };
    case UnwrapStatus.AMOUNT_TO_WRAP_SELECTED:
      const {amountToUnwrap} = action.payload;
      return {
        ...state,
        amountToUnwrap: amountToUnwrap,
        status: amountToUnwrap.lte(state.currentBalance) ? UnwrapStatus.READY_TO_UNWRAP : UnwrapStatus.AMOUNT_TO_WRAP_SELECTED
      };
    case UnwrapStatus.READY_TO_UNWRAP:
      return {
        ...state,
        status: UnwrapStatus.READY_TO_UNWRAP
      };
  }

  return state;
}

export function useUnwrap(contractFactory: TezosUnwrapApiFactory, tokens: Record<string, TokenMetadata>) {
  const [state, dispatch] = useReducer<typeof reducer>(reducer, {
    status: UnwrapStatus.UNINITIALIZED,
    token: "",
    decimals: 0,
    contract: null,
    currentBalance: ethers.BigNumber.from(0),
    amountToUnwrap: ethers.BigNumber.from(0),
  });

  const selectToken = useCallback((token: string) => {
    const {decimals, ethereumContractAddress, tezosWrappingContract, tezosTokenId} = tokens[token];
    const contract = contractFactory.forFa20(ethereumContractAddress, tezosWrappingContract, tezosTokenId);
    dispatch({type: UnwrapStatus.TOKEN_SELECTED, payload: {token, decimals, contract}});
  }, []);

  const selectAmountToUnwrap = useCallback((amountToUnwrap: ethers.BigNumber) => {
    dispatch({
      type: UnwrapStatus.AMOUNT_TO_WRAP_SELECTED,
      payload: {amountToUnwrap}
    })
  },[]);

  const launchWrap = useCallback(() => {
    const {contract, amountToUnwrap} = state;
    if (contract == null) return;

    const startWrapping = async () => {
      await contract.wrap(amountToUnwrap);
    };

    startWrapping();
  }, [state.contract, state.amountToUnwrap]);

  useEffect(() => {
    const loadMetadata = async () => {
      if (state.contract != null) {
        const currentBalance = await state.contract.balanceOf();
        dispatch({type: UnwrapStatus.USER_BALANCE_FETCHED, payload: {currentBalance}})
      }
    }
    loadMetadata();
  }, [state.token])


  return {...state, selectToken, selectAmountToUnwrap: selectAmountToUnwrap, launchWrap}
}