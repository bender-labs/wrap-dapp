import {
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles
} from "@material-ui/core";
import React, {useEffect, useMemo, useState} from "react";
import {useConfig} from "../config/ConfigContext";
import indexerApi, {IndexerUnwrapPayload} from "../../features/indexer/indexerApi";
import {EthereumAddress, TezosAddress} from "../../features/ethereum/EthereumWrapApi";
import {TokenMetadata} from "../../features/swap/token";
import {formatAmount} from "../../features/ethereum/token";
import BigNumber from "bignumber.js";
import {Web3Provider} from "@ethersproject/providers";
import {ethers} from "ethers";
import ERC20_ABI from "../../features/ethereum/erc20Abi";
import CUSTODIAN_ABI from "../../features/ethereum/custodianContractAbi";

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  }
}));

type Props = {
  ethAccount: EthereumAddress,
  ethLibrary: Web3Provider,
  tzAccount: TezosAddress,
};

export function BurnCard({ethAccount, tzAccount, ethLibrary}: Props) {
  const classes = useStyles();
  const {
    indexerUrl,
    fungibleTokens,
    unwrapSignatureThreshold,
    ethereum: {custodianContractAddress}
  } = useConfig();
  const [{erc20Unwraps, erc721Unwraps}, setPendingUnwrap] = useState<IndexerUnwrapPayload>({erc20Unwraps: [], erc721Unwraps: []});

  const tokensByEthAddress = useMemo(() => Object.entries(fungibleTokens).reduce<Record<string, TokenMetadata>>((acc, [token, metadata]) => {
    acc[metadata.ethereumContractAddress] = metadata;
    return acc;
  }, {}), [fungibleTokens]);

  useEffect(() => {
    const loadPendingUnwrap = async () => {
      const pendingUnwrap = await indexerApi(indexerUrl).fetchPendingUnwrap(ethAccount, tzAccount)
      setPendingUnwrap(pendingUnwrap);
    };
    loadPendingUnwrap();
    const intervalId = setInterval(loadPendingUnwrap, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const erc20PrimaryText = (amount: string, token: string) => {
    const {decimals, tezosSymbol} = tokensByEthAddress[token.toLowerCase()];
    return `${formatAmount(tezosSymbol, new BigNumber(amount), decimals)}`
  };

  const erc20SecondaryText = (confirmations: number, confirmationsThreshold: number, signatureNumber: number) => {
    if (confirmations < confirmationsThreshold) {
      return `Pending... (${confirmations}/${confirmationsThreshold} confirmations)`;
    } else if (signatureNumber < unwrapSignatureThreshold) {
      return `Waiting for signatures... (Received: ${signatureNumber}/${unwrapSignatureThreshold} signatures)`
    }
    return `Ready to burn (${signatureNumber}/${unwrapSignatureThreshold} signatures received)`;
  }

  const isReadyToBurn = (signatureNumber: number) => signatureNumber >= unwrapSignatureThreshold;

  const buildFullSignature = (signatures: Record<string, string>) => {
    const orderedSigners = Object.keys(signatures).sort();
    return orderedSigners.reduce((previousValue, currentValue) => previousValue + signatures[currentValue].replace('0x', ''), "0x");
  }

  const burnFa20 = async (signatures: Record<string, string>, amount: string, owner: EthereumAddress, ethErc20ContractAddress: string, id: string): Promise<string> => {
    const custodianContract = new ethers.Contract(custodianContractAddress, new ethers.utils.Interface(CUSTODIAN_ABI), ethLibrary.getSigner());
    const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
    const data = erc20Interface.encodeFunctionData("transfer", [owner, amount]);
    await custodianContract.execTransaction(ethErc20ContractAddress, 0, data, id, buildFullSignature(signatures));
    return "";
  }

  const handleBurnClick = (signatures: Record<string, string>, amount: string, owner: TezosAddress, ethErc20ContractAddress: string, id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    burnFa20(signatures, amount, owner, ethErc20ContractAddress, id);
  }

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
        <List>
          {erc20Unwraps.map(((erc20, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={erc20PrimaryText(erc20.amount, erc20.token)}
                secondary={erc20SecondaryText(erc20.confirmations, erc20.confirmationsThreshold, Object.entries(erc20.signatures).length)}
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" color="primary"
                        disabled={!isReadyToBurn(Object.entries(erc20.signatures).length)}
                        onClick={handleBurnClick(erc20.signatures, erc20.amount, erc20.destination, erc20.token, erc20.id)}>
                  BURN
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )))}
        </List>
      </CardContent>
    </Card>
  );
}