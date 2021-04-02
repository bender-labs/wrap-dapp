import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from '@material-ui/core';
import React from 'react';
import { TokenMetadata } from '../../features/swap/token';
import { SupportedBlockchain } from '../../features/wallet/blockchain';

type Props = {
  token: string;
  onTokenSelect: (token: string) => void;
  blockchainTarget: SupportedBlockchain;
  tokens: Record<string, TokenMetadata>;
};

const itemLabel = (
  blockchainTarget: SupportedBlockchain,
  tokenMetadata: TokenMetadata
) =>
  blockchainTarget === SupportedBlockchain.Ethereum
    ? `${tokenMetadata.ethereumName} (${tokenMetadata.ethereumSymbol})`
    : `${tokenMetadata.tezosName} (${tokenMetadata.tezosSymbol})`;

export default function TokenSelection({
  token,
  tokens,
  blockchainTarget,
  onTokenSelect,
}: Props) {
  const tokenList = Object.entries(tokens);

  const handleTokenSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.preventDefault();
    onTokenSelect(event.target.value as string);
  };

  return (
    <FormControl fullWidth variant={'filled'}>
      <Select
        fullWidth
        value={token}
        onChange={handleTokenSelect}
        displayEmpty
        inputProps={{
          name: 'token',
          id: 'token-selector',
        }}
      >
        <MenuItem value="" disabled>
          Please select
        </MenuItem>
        {tokenList.map(([key, token]) => (
          <MenuItem value={key} key={key}>
            {itemLabel(blockchainTarget, token)}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>Only supported token are listed</FormHelperText>
    </FormControl>
  );
}
