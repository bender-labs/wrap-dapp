import React, {useEffect, useState} from "react"
import {Button, Card, CardContent, makeStyles, Step, StepContent, StepLabel, Stepper} from "@material-ui/core";
import {useConfig} from "../config/ConfigContext";
import {Web3Provider} from "@ethersproject/providers";
import {CustodianContractApi, EthereumERC20ContractApi} from "../../features/ethereum/contract";
import {ethers} from "ethers";
import AmountToWrapInput from "./AmountToWrapInput";
import {EmptyToken, Token} from "../../features/swap/token";
import AllowanceButton from "./AllowanceButton";
import TokenSelection from "./TokenSelection";
import {BeaconWallet} from "@taquito/beacon-wallet";

type Props = {
  web3Provider: Web3Provider;
  ethAccount: string;
  beaconWallet: BeaconWallet;
  tzAccount: string;
}

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  }
}));

export default function SwapCard({web3Provider, ethAccount, tzAccount, beaconWallet}: Props) {
  const classes = useStyles();
  const {tokens, ethereum: {custodianContractAddress, custodianContractAbi}} = useConfig();
  const benderContract = CustodianContractApi.withProvider(web3Provider).forContract(custodianContractAddress, custodianContractAbi);

  const erc20Api = EthereumERC20ContractApi.withProvider(web3Provider);

  const [{token, decimals, ethContractAddress}, setToken] = useState<Token>(EmptyToken);
  const [contract, setContract] = useState<EthereumERC20ContractApi>();
  const [balance, setBalance] = useState<ethers.BigNumber>();
  const [amountToWrap, setAmountToWrap] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [allowance, setAllowance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [step, setCurrentStep] = useState<number>(0);


  useEffect(() => {
    if (token === "") return;
    setContract(erc20Api.forContract(ethContractAddress, custodianContractAddress, ethAccount));
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
  }, [contract, balance, amountToWrap])

  const refreshBalance = () => contract?.balanceOf().then(setBalance)
  const refreshAllowance = () => contract?.allowance().then(setAllowance)
  const onApprove = (amount: ethers.BigNumber) => contract?.approve(amount)
  const onTokenSelect = (tokenKey: string) => setToken({...tokens[tokenKey], token: tokenKey});

  const handleOnWrap = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    onWrap(amountToWrap);
  }

  const onWrap = (amount: ethers.BigNumber) => {
    benderContract.wrap(amount, ethContractAddress, tzAccount);
  }

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
        <Stepper activeStep={step} orientation="vertical">
          <Step expanded={step > 0}>
            <StepLabel>
              Please select the token you wish to wrap
            </StepLabel>
            <StepContent>
              <TokenSelection token={token} onTokenSelect={onTokenSelect} tokens={tokens}/>
            </StepContent>
          </Step>
          <Step expanded={step > 1}>
            <StepLabel>
              Select the token amount you wish to wrap
            </StepLabel>
            <StepContent>
              {balance != null &&
              <AmountToWrapInput balance={balance} decimals={decimals} token={token} onChange={setAmountToWrap}
                                 amountToWrap={amountToWrap}/>}
            </StepContent>
          </Step>
          <Step expanded={step > 2}>
            <StepLabel>
              Please allow the bender contract to move your tokens
            </StepLabel>
            <StepContent>
              <AllowanceButton
                currentAllowance={allowance}
                balanceToWrap={amountToWrap}
                decimals={decimals}
                onAuthorize={onApprove}
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
                onClick={handleOnWrap}
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