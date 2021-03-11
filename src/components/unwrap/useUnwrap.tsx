import {ethers} from "ethers";
import {useCallback, useEffect, useReducer} from "react";
import {EthereumWrapApi, EthereumWrapApiFactory} from "../../features/ethereum/EthereumWrapApi";
import {TokenMetadata} from "../../features/swap/token";

type WrapState = {
  status: WrapStatus,
  token: string,
  decimals: number,
  contract: EthereumWrapApi | null,
  currentBalance: ethers.BigNumber,
  currentAllowance: ethers.BigNumber,
  amountToWrap: ethers.BigNumber,
}

export enum WrapStatus {
  UNINITIALIZED,
  TOKEN_SELECTED,
  USER_BALANCE_FETCHED,
  AMOUNT_TO_WRAP_SELECTED,
  WAITING_FOR_ALLOWANCE_APPROVAL,
  READY_TO_WRAP
}

type Action =
  | { type: WrapStatus.TOKEN_SELECTED, payload: { token: string, decimals: number, contract: EthereumWrapApi } }
  | { type: WrapStatus.USER_BALANCE_FETCHED, payload: { currentBalance: ethers.BigNumber, currentAllowance: ethers.BigNumber } }
  | { type: WrapStatus.AMOUNT_TO_WRAP_SELECTED, payload: { amountToWrap: ethers.BigNumber } }
  | { type: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL }
  | { type: WrapStatus.READY_TO_WRAP, payload: { newCurrentAllowance: ethers.BigNumber } }

function reducer(state: WrapState, action: Action): WrapState {
  switch (action.type) {
    case WrapStatus.TOKEN_SELECTED:
      return {
        status: WrapStatus.TOKEN_SELECTED,
        ...action.payload,
        currentBalance: ethers.BigNumber.from(0),
        currentAllowance: ethers.BigNumber.from(0),
        amountToWrap: ethers.BigNumber.from(0)
      };
    case WrapStatus.USER_BALANCE_FETCHED:
      return {
        ...state,
        status: WrapStatus.USER_BALANCE_FETCHED,
        ...action.payload
      };
    case WrapStatus.AMOUNT_TO_WRAP_SELECTED:
      const {amountToWrap} = action.payload;
      return {
        ...state,
        amountToWrap,
        status: amountToWrap.lte(state.currentAllowance) ? WrapStatus.READY_TO_WRAP : WrapStatus.AMOUNT_TO_WRAP_SELECTED
      };
    case WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL:
      return {
        ...state,
        status: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL
      };
    case WrapStatus.READY_TO_WRAP:
      return {
        ...state,
        status: WrapStatus.READY_TO_WRAP,
        currentAllowance: action.payload.newCurrentAllowance,
      };
  }

  return state;
}

export function useUnwrap(contractFactory: EthereumWrapApiFactory, tokens: Record<string, TokenMetadata>) {
  const [state, dispatch] = useReducer<typeof reducer>(reducer, {
    status: WrapStatus.UNINITIALIZED,
    token: "",
    decimals: 0,
    contract: null,
    currentBalance: ethers.BigNumber.from(0),
    currentAllowance: ethers.BigNumber.from(0),
    amountToWrap: ethers.BigNumber.from(0),
  });

  const selectToken = useCallback((token: string) => {
    const {decimals, ethereumContractAddress} = tokens[token];
    const contract = contractFactory.forErc20(ethereumContractAddress);
    dispatch({type: WrapStatus.TOKEN_SELECTED, payload: {token, decimals, contract}});
  }, []);

  const selectAmountToWrap = useCallback((amountToWrap: ethers.BigNumber) => {
    dispatch({
      type: WrapStatus.AMOUNT_TO_WRAP_SELECTED,
      payload: {amountToWrap}
    })
  },[]);

  const launchAllowanceApproval = useCallback(() => {
    const startAllowanceProcess = async () => {
      const {amountToWrap, contract, currentAllowance} = state;
      if (amountToWrap.lte(currentAllowance)) return;
      if (contract == null) return;
      await contract.approve(amountToWrap);
      dispatch({type: WrapStatus.WAITING_FOR_ALLOWANCE_APPROVAL});
      let counter = 0;
      const refreshCurrentAllowance = () => setTimeout(async () => {
        counter++;
        const newAllowance = await contract.allowanceOf();
        if (amountToWrap.lte(newAllowance)) {
          dispatch({
            type: WrapStatus.READY_TO_WRAP,
            payload: {newCurrentAllowance: newAllowance}
          });
          return;
        } else {
          if (counter > 30) throw new Error("Timeout");
          refreshCurrentAllowance();
        }
      }, 1500);
      refreshCurrentAllowance();
    };

    startAllowanceProcess();
  }, [state]);

  const launchWrap = useCallback(() => {
    const {contract, amountToWrap} = state;
    if (contract == null) return;

    const startWrapping = async () => {
      await contract.wrap(amountToWrap);
    };

    startWrapping();
  }, [state.contract, state.amountToWrap]);

  useEffect(() => {
    const loadMetadata = async () => {
      if (state.contract != null) {
        const currentBalance = await state.contract.balanceOf();
        const currentAllowance = await state.contract.allowanceOf();
        dispatch({type: WrapStatus.USER_BALANCE_FETCHED, payload: {currentBalance, currentAllowance}})
      }
    }
    loadMetadata();
  }, [state.token])


  return {...state, selectToken, selectAmountToWrap, launchAllowanceApproval, launchWrap}
}