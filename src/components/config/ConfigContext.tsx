import React from "react";
import {ethereumConfig} from "../../config";

const config = {
  ethereumConfig: ethereumConfig,
  tezosConfig: null
}

const ConfigContext = React.createContext(config);

export function useEthereumConfig() {
  const {ethereumConfig} = React.useContext(ConfigContext);
  return ethereumConfig;
}