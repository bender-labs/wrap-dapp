import React, {useEffect, useState} from "react"
import {Button, Card, CardContent, makeStyles, Step, StepContent, StepLabel, Stepper} from "@material-ui/core";
import {useConfig} from "../config/ConfigContext";
import {Web3Provider} from "@ethersproject/providers";
import AmountToWrapInput from "./AmountToWrapInput";
import AllowanceButton from "./AllowanceButton";
import TokenSelection from "./TokenSelection";
import {TezosToolkit} from "@taquito/taquito";
import {EthereumWrapApiBuilder} from "../../features/ethereum/contract";
import {useWrap, WrapStatus} from "./useWrap";

type Props = {
  ethLibrary: Web3Provider;
  ethAccount: string;
  tzLibrary: TezosToolkit;
  tzAccount: string;
}

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  }
}));

export default function SwapCard({ethLibrary, ethAccount, tzAccount, tzLibrary}: Props) {
  const classes = useStyles();
  const {tokens, ethereum: {custodianContractAddress}} = useConfig();
  const ethWrapApiFactory = EthereumWrapApiBuilder
    .withProvider(ethLibrary)
    .forCustodianContract(custodianContractAddress)
    .forAccount(ethAccount, tzAccount)
    .createFactory();
  const {status, amountToWrap, currentAllowance, currentBalance, token, decimals, launchAllowanceApproval, selectAmountToWrap, selectToken, launchWrap} = useWrap(ethWrapApiFactory, tokens);
  const [step, setCurrentStep] = useState<number>(0);
  useEffect(() => {
    switch (status) {
      case WrapStatus.UNINITIALIZED:
        setCurrentStep(0);
        break;
      case WrapStatus.TOKEN_SELECTED:
        setCurrentStep(1);
        break;
      case WrapStatus.AMOUNT_TO_WRAP_SELECTED:
        setCurrentStep(2);
        break;
      case WrapStatus.READY_TO_WRAP:
        setCurrentStep(3);
        break;
    }
  }, [status])
  /*const [{token, decimals, ethContractAddress}, setToken] = useState<Token>(EmptyToken);
  const [contract, setContract] = useState<EthereumWrapApi>();
  const [balance, setBalance] = useState<ethers.BigNumber>();
  const [amountToWrap, setAmountToWrap] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [allowance, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [waitingForAllowance, setWaitingForAllowance] = useState<boolean>(false);

  useEffect(() => {
    if (token === "") return;
    setContract(ethWrapApiFactory.forErc20(ethContractAddress));
  }, [token]);

  useEffect(() => {
    if (contract == null) return;
    refreshAllowance();
    refreshBalance();
  }, [contract]);

  useEffect(() => {
    if (balance != null && contract != null) {
      setCurrentStep(1);
    }
    if (amountToWrap.gt(0)) {
      setCurrentStep(2);
    }
    if (amountToWrap.gt(0) && allowance.gte(amountToWrap)) {
      setCurrentStep(3);
    }
  }, [contract, balance, amountToWrap]);

  const refreshBalance = () => contract?.balanceOf().then(setBalance)
  const refreshAllowance = () => contract?.allowanceOf().then(setAllowance)
  const onApprove = async (amount: ethers.BigNumber) => {
    await contract?.approve(amount);
    setWaitingForAllowance(true);
  }
  const onTokenSelect = (tokenKey: string) => setToken({...tokens[tokenKey], token: tokenKey});

  const handleOnWrap = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    onWrap(amountToWrap);
  }

  const onWrap = (amount: ethers.BigNumber) => {
    contract?.wrap(amount);
  }
  */

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
        <Stepper activeStep={step} orientation="vertical">
          <Step expanded={step > 0}>
            <StepLabel>
              Please select the token you wish to wrap
            </StepLabel>
            <StepContent>
              <TokenSelection token={token} onTokenSelect={selectToken} tokens={tokens}/>
            </StepContent>
          </Step>
          <Step expanded={step > 1}>
            <StepLabel>
              Select the token amount you wish to wrap
            </StepLabel>
            <StepContent>
              <AmountToWrapInput balance={currentBalance} decimals={decimals} token={token} onChange={selectAmountToWrap}
                                 amountToWrap={amountToWrap}/>
            </StepContent>
          </Step>
          <Step expanded={step > 2}>
            <StepLabel>
              Please allow the bender contract to move your tokens
            </StepLabel>
            <StepContent>
              <AllowanceButton
                currentAllowance={currentAllowance}
                balanceToWrap={amountToWrap}
                decimals={decimals}
                onAuthorize={launchAllowanceApproval}
                token={token}/>
            </StepContent>
          </Step>
          <Step expanded={step > 3}>
            <StepLabel>
              You can launch the wrapping
            </StepLabel>
            <StepContent>
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={launchWrap}
                disabled={false}
              >
                WRAP
              </Button>
            </StepContent>
          </Step>
        </Stepper>
      </CardContent>
    </Card>
  )
}