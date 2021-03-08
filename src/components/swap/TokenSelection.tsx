import {FormControl, FormHelperText, MenuItem, Select} from "@material-ui/core";
import React from "react";
import {TokenMetadata} from "../../features/swap/token";

type Props = {
  token: string;
  onTokenSelect: (token: string) => void;
  tokens: Record<string, TokenMetadata>;
}

export default function TokenSelection({token, tokens, onTokenSelect}: Props) {
  const tokenList = Object.entries(tokens);

  const handleTokenSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    event.preventDefault();
    onTokenSelect(event.target.value as string);
  }

  return (
    <FormControl >
      <Select
        value={token}
        onChange={handleTokenSelect}
        displayEmpty
        inputProps={{
          name: 'token',
          id: 'token-selector',
        }}
      >
        <MenuItem value="" disabled>Please select</MenuItem>
        {tokenList.map(([key, {ethereumName}]) => (
          <MenuItem value={key} key={key}>
            {ethereumName} ({key})
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>Only supported token are listed</FormHelperText>
    </FormControl>
  );
}