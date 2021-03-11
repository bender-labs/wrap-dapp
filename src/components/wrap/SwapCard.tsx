import React, {useEffect, useState} from "react"
import {Button, Card, CardContent, makeStyles, Step, StepContent, StepLabel, Stepper} from "@material-ui/core";
import {useConfig} from "../config/ConfigContext";
import {Web3Provider} from "@ethersproject/providers";
import AmountToWrapInput from "./AmountToWrapInput";
import AllowanceButton from "./AllowanceButton";
import TokenSelection from "./TokenSelection";
import {TezosToolkit} from "@taquito/taquito";
import {EthereumWrapApiBuilder} from "../../features/ethereum/EthereumWrapApi";
import {useWrap, WrapStatus} from "./useWrap";
import {SupportedBlockchain} from "../../features/wallet/blockchain";

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
  const {fungibleTokens, ethereum: {custodianContractAddress}} = useConfig();
  const ethWrapApiFactory = EthereumWrapApiBuilder
    .withProvider(ethLibrary)
    .forCustodianContract(custodianContractAddress)
    .forAccount(ethAccount, tzAccount)
    .createFactory();
  const {status, amountToWrap, currentAllowance, currentBalance, token, decimals, launchAllowanceApproval, selectAmountToWrap, selectToken, launchWrap} = useWrap(ethWrapApiFactory, fungibleTokens);
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

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
        <Stepper activeStep={step} orientation="vertical">
          <Step expanded={step > 0}>
            <StepLabel>
              Please select the token you wish to wrap
            </StepLabel>
            <StepContent>
              <TokenSelection token={token} onTokenSelect={selectToken} tokens={fungibleTokens} blockchainTarget={SupportedBlockchain.Ethereum}/>
            </StepContent>
          </Step>
          <Step expanded={step > 1}>
            <StepLabel>
              Select the token amount you wish to wrap
            </StepLabel>
            <StepContent>
              <AmountToWrapInput balance={currentBalance} decimals={decimals} symbol={token} onChange={selectAmountToWrap}
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
                symbol={token}/>
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