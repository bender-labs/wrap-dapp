import React, {PropsWithChildren, useMemo, useState} from "react";
import {Config, config, Environment} from "../../config";

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
  const environmentOptions = useMemo(() => ({
    setEnvironment,
    environmentOptions: [{
      environment: Environment.MAINNET,
      name: config[Environment.MAINNET].environmentName
    }, {
      environment: Environment.TESTNET,
      name: config[Environment.TESTNET].environmentName
    }]
  }), []);

  return (
    <EnvironmentSelectorContext.Provider value={environmentOptions}>
      <ConfigContext.Provider value={{...config[environment]}}>
        {children}
      </ConfigContext.Provider>
    </EnvironmentSelectorContext.Provider>
  );
}
