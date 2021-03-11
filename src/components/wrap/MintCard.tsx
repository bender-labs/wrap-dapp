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
import indexerApi, {IndexerWrapPayload} from "../../features/indexer/indexerApi";
import {EthereumAddress, TezosAddress} from "../../features/ethereum/EthereumWrapApi";
import {TokenMetadata} from "../../features/swap/token";
import {formatAmount} from "../../features/ethereum/token";
import {ethers} from "ethers";
import {TezosToolkit} from "@taquito/taquito";

const useStyles = makeStyles((theme) => ({
  swapContainer: {
    flex: 1
  }
}));

type Props = {
  ethAccount: EthereumAddress,
  tzAccount: TezosAddress,
  tzLibrary: TezosToolkit
};

export function MintCard({ethAccount, tzAccount, tzLibrary}: Props) {
  const classes = useStyles();
  const {
    indexerUrl,
    fungibleTokens,
    wrapSignatureThreshold,
    tezos: {quorumContractAddress, minterContractAddress}
  } = useConfig();
  const [{erc20Wraps, erc721Wraps}, setPendingWrap] = useState<IndexerWrapPayload>({erc20Wraps: [], erc721Wraps: []});

  const tokensByEthAddress = useMemo(() => Object.entries(fungibleTokens).reduce<Record<string, TokenMetadata>>((acc, [token, metadata]) => {
    acc[metadata.ethereumContractAddress] = metadata;
    return acc;
  }, {}), [fungibleTokens]);

  useEffect(() => {
    const loadPendingWrap = async () => {
      const pendingWrap = await indexerApi(indexerUrl).fetchPendingWrap(ethAccount, tzAccount)
      setPendingWrap(pendingWrap);
    };
    loadPendingWrap();
    const intervalId = setInterval(loadPendingWrap, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const erc20PrimaryText = (amount: string, token: string) => {
    const {decimals, ethereumSymbol} = tokensByEthAddress[token.toLowerCase()];
    return `${formatAmount(ethereumSymbol, ethers.BigNumber.from(amount), decimals)}`
  };

  const erc20SecondaryText = (confirmations: number, confirmationsThreshold: number, signatureNumber: number) => {
    if (confirmations < confirmationsThreshold) {
      return `Pending... (${confirmations}/${confirmationsThreshold} confirmations)`;
    } else if (signatureNumber < wrapSignatureThreshold) {
      return `Waiting for signatures... (Received: ${signatureNumber}/${wrapSignatureThreshold} signatures)`
    }
    return `Ready to mint (${signatureNumber}/${wrapSignatureThreshold} signatures received)`;
  }

  const isReadyToMint = (signatureNumber: number) => signatureNumber >= wrapSignatureThreshold;

  const mintErc20 = async (signatures: Record<string, string>, amount: string, owner: TezosAddress, ethErc20ContractAddress: string, id: string): Promise<string> => {
    const contract = await tzLibrary.wallet.at(quorumContractAddress);
    const mintSignatures = Object.entries(signatures);
    const [blockHash, logIndex] = id.split(":");
    await contract.methods.minter("mint_erc20", ethErc20ContractAddress.toLowerCase().substring(2), blockHash.substring(2), logIndex, owner, amount, minterContractAddress, mintSignatures).send();
    return "";
  }

  const handleMintClick = (signatures: Record<string, string>, amount: string, owner: TezosAddress, ethErc20ContractAddress: string, id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    mintErc20(signatures, amount, owner, ethErc20ContractAddress, id);
  }

  return (
    <Card className={classes.swapContainer}>
      <CardContent>
        <List>
          {erc20Wraps.map(((erc20, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={erc20PrimaryText(erc20.amount, erc20.token)}
                secondary={erc20SecondaryText(erc20.confirmations, erc20.confirmationsThreshold, Object.entries(erc20.signatures).length)}
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" color="primary"
                        disabled={!isReadyToMint(Object.entries(erc20.signatures).length)}
                        onClick={handleMintClick(erc20.signatures, erc20.amount, erc20.destination, erc20.token, erc20.id)}>
                  MINT
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          )))}
        </List>
      </CardContent>
    </Card>
  );
}