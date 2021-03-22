import React, {PropsWithChildren, useEffect, useMemo, useState} from "react";
import {Config, ConfigStatus, Environment, initialConfig} from "../../config";
import LoadingScreen from "../../screens/LoadingScreen";
import indexerApi from "../../features/indexer/indexerApi";
import {Token} from "../../features/swap/token";

type ContextValue = undefined | Config;
type EnvironmentSelectorValue = undefined | {
  setEnvironment: (env: Environment) => void;
  environmentOptions: Array<{
    environment: Environment,
    name: string
  }>
}
const ConfigContext = React.createContext<ContextValue>(undefined);
const EnvironmentSelectorContext = React.createContext<EnvironmentSelectorValue>(undefined);

export function useEthereumConfig() {
  const config = React.useContext(ConfigContext);
  if (config == null) throw new Error("config consumer must be used within a config provider");
  return config.ethereum;
}

export function useTezosConfig() {
  const config = React.useContext(ConfigContext);
  if (config == null) throw new Error("config consumer must be used within a config provider");
  return config.tezos;
}

export function useConfig() {
  const config = React.useContext(ConfigContext);
  if (config == null) throw new Error("config consumer must be used within a config provider");
  return config;
}

export function useEnvironmentSelectorContext() {
  const selector = React.useContext(EnvironmentSelectorContext);
  if (selector == null) throw new Error("selector context consumer must be used within a config provider");
  return selector;
}

export default function Provider({children}: PropsWithChildren<{}>) {
  const [environment, setEnvironment] = useState<Environment>(Environment.TESTNET);
  const [configStatus, setConfigStatus] = useState<ConfigStatus>(ConfigStatus.UNINITIALIZED);
  const [config, setConfig] = useState<ContextValue>();

  const environmentOptions = useMemo(() => ({
    setEnvironment,
    environmentOptions: [{
      environment: Environment.MAINNET,
      name: initialConfig[Environment.MAINNET].environmentName
    }, {
      environment: Environment.TESTNET,
      name: initialConfig[Environment.TESTNET].environmentName
    }]
  }), []);

  useEffect(() => {
    const loadConfig = async () => {
      setConfigStatus(ConfigStatus.LOADING);
      const initConfig = initialConfig[environment];
      const indexerConfig = await indexerApi(initConfig.indexerUrl).fetchConfig();
      setConfig({
        environmentName: initConfig.environmentName,
        indexerUrl: initConfig.indexerUrl,
        ethereum: {
          ...initConfig.ethereum,
          custodianContractAddress: indexerConfig.ethereumWrapContract
        },
        tezos: {
          ...initConfig.tezos,
          minterContractAddress: indexerConfig.tezosMinterContract,
          quorumContractAddress: indexerConfig.tezosQuorumContract
        },
        wrapSignatureThreshold: indexerConfig.wrapRequiredSignatures,
        unwrapSignatureThreshold: indexerConfig.unwrapRequiredSignatures,
        fungibleTokens: indexerConfig.tokens.filter(t => t.type === "ERC20").reduce<Record<string, Token>>((acc, e) => {
          acc[e.ethereumSymbol] = {
            ...e,
            tezosTokenId: parseInt(e.tezosTokenId || "0"),
            token: e.ethereumSymbol
          };
          return acc;
        }, {}),
        fees: indexerConfig.fees
      });
      setConfigStatus(ConfigStatus.LOADED);
    };
    loadConfig();
  }, [environment]);

  return (
    <EnvironmentSelectorContext.Provider value={environmentOptions}>
      {configStatus !== ConfigStatus.LOADED
        ? (
          <LoadingScreen/>
        )
        : (
          <ConfigContext.Provider value={config}>
            {children}
          </ConfigContext.Provider>
        )
      }
    </EnvironmentSelectorContext.Provider>
  );
}
