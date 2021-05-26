import React, {PropsWithChildren, useEffect, useMemo, useState} from 'react';
import {Config, ConfigStatus, FarmConfig, initialConfig} from '../../config';
import LoadingScreen from '../../screens/LoadingScreen';
import IndexerApi from '../../features/indexer/indexerApi';
import {Token} from '../../features/swap/token';

type ContextValue = undefined | Config;
const ConfigContext = React.createContext<ContextValue>(undefined);

export function useEthereumConfig() {
    const config = React.useContext(ConfigContext);
    if (config == null)
        throw new Error('config consumer must be used within a config provider');
    return config.ethereum;
}

export function useTezosConfig() {
    const config = React.useContext(ConfigContext);
    if (config == null)
        throw new Error('config consumer must be used within a config provider');
    return config.tezos;
}

export function useConfig() {
    const config = React.useContext(ConfigContext);
    if (config == null)
        throw new Error('config consumer must be used within a config provider');
    return config;
}

export function useIndexerApi() {
    const {indexerUrl} = useConfig();
    return useMemo(() => new IndexerApi(indexerUrl), [indexerUrl]);
}

const getTimeFromRetryCounter = (counter: number) => Math.pow(2, counter) - 1;

export default function Provider({children}: PropsWithChildren<{}>) {
    const [configStatus, setConfigStatus] = useState<ConfigStatus>(
        ConfigStatus.UNINITIALIZED
    );
    const [config, setConfig] = useState<ContextValue>();
    const [retryTime, setRetryTime] = useState<number>(0);

    useEffect(() => {
        const initConfig = initialConfig;
        setConfigStatus(ConfigStatus.LOADING);
        const localConfigKey = `config-${initConfig.environmentName}`;
        const localConfig = localStorage.getItem(localConfigKey);

        if (localConfig != null) {
            setConfig(JSON.parse(localConfig));
            setConfigStatus(ConfigStatus.LOADED);
        }

        const indexerApi = new IndexerApi(initConfig.indexerUrl);

        const loadConfig = async () => {
            const indexerConfig = await indexerApi.fetchConfig();
            const farmingConfiguration = await indexerApi.fetchFarmingConfiguration();

            const farms = farmingConfiguration.contracts
                .reduce((validFarms: FarmConfig[], farmConfiguration) => {
                    const tokenMetadata = indexerConfig.tokens.find((t) => t.tezosWrappingContract === farmConfiguration.token && t.tezosTokenId === farmConfiguration.tokenId);
                    if (tokenMetadata) {
                        validFarms.push({
                            farmContractAddress: farmConfiguration.contract,
                            farmContractLink: initConfig.tzktLink + farmConfiguration.contract,
                            farmStakedToken: initConfig.farmInput,
                            rewardTokenName: tokenMetadata.tezosName,
                            rewardTokenThumbnailUri: tokenMetadata.thumbnailUri,
                            rewardTokenContractAddress: farmConfiguration.token,
                            rewardTokenId: parseInt(farmConfiguration.tokenId),
                            rewardTokenDecimals: tokenMetadata.decimals,
                            rewardTokenSymbol: tokenMetadata.tezosSymbol
                        });
                    }
                    return validFarms;
                }, []);

            const config = {
                environmentName: initConfig.environmentName,
                indexerUrl: initConfig.indexerUrl,
                ethereum: {
                    ...initConfig.ethereum,
                    custodianContractAddress: indexerConfig.ethereumWrapContract,
                },
                tezos: {
                    ...initConfig.tezos,
                    minterContractAddress: indexerConfig.tezosMinterContract,
                    quorumContractAddress: indexerConfig.tezosQuorumContract,
                },
                wrapSignatureThreshold: indexerConfig.wrapRequiredSignatures,
                unwrapSignatureThreshold: indexerConfig.unwrapRequiredSignatures,
                fungibleTokens: indexerConfig.tokens
                    .filter((t) => t.type === 'ERC20')
                    .reduce<Record<string, Token>>((acc, e) => {
                        acc[e.ethereumSymbol] = {
                            ...e,
                            tezosTokenId: parseInt(e.tezosTokenId || '0'),
                            token: e.ethereumSymbol,
                        };
                        return acc;
                    }, {}),
                fees: indexerConfig.fees,
                farms: farms,
                farmInput: initConfig.farmInput
            };
            localStorage.setItem(localConfigKey, JSON.stringify(config));
            setConfig(config);
            setConfigStatus(ConfigStatus.LOADED);
        };

        const loadingWithRetries = async (counter = 1) => {
            try {
                await loadConfig();
            } catch (_) {
                const retrySecond = getTimeFromRetryCounter(counter);
                console.warn(`Error fetching indexer config, retry in ${retrySecond}`);
                setRetryTime(retrySecond);
                await setTimeout(
                    () => loadingWithRetries(counter + 1),
                    retrySecond * 1000
                );
            }
        };

        loadingWithRetries();
    }, []);

    return (
        <>
            {configStatus !== ConfigStatus.LOADED ? (
                <LoadingScreen retryTime={retryTime}/>
            ) : (
                <ConfigContext.Provider value={config}>
                    {children}
                </ConfigContext.Provider>
            )}
        </>
    );
}
