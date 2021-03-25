import {
  AppBar,
  Box,
  Button,
  createStyles,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import {
  useConfig,
  useEnvironmentSelectorContext,
} from '../../runtime/config/ConfigContext';
import { Environment } from '../../config';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import logo from './logo.png';
import EthWalletConnection from '../ethereum/WalletConnection';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { useTezosContext } from '../tezos/TezosContext';
import TezosWalletConnection from '../tezos/WalletConnection';

const useStyles = makeStyles((theme) =>
  createStyles({
    title: {
      flexGrow: 1,
      '& > *': {
        marginLeft: theme.spacing(2),
      },
    },
    logo: {
      width: 50,
    },
    wallets: {
      '& > *': {
        marginRight: theme.spacing(1),
      },
    },
  })
);

const Render = () => {
  const config = useConfig();
  const {
    setEnvironment,
    environmentOptions,
  } = useEnvironmentSelectorContext();
  const {
    activate: ethActivate,
    active: ethActive,
    account: ethAccount,
  } = useWeb3React<Web3Provider>();
  const {
    activate: tzActivate,
    status: tzConnectionStatus,
    account: tzAccount,
  } = useTezosContext();
  const classes = useStyles();
  const [
    anchorEnvSelector,
    setAnchorEnvSelector,
  ] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEnvSelector);

  const openEnvSelector = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEnvSelector(event.currentTarget);
  const closeEnvSelector = () => setAnchorEnvSelector(null);
  const handleEnvSelection = (env: Environment) => {
    setEnvironment(env);
    closeEnvSelector();
  };
  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();

  return (
    <AppBar position="static">
      <Toolbar>
        <img src={logo} className={classes.logo} alt="Logo" />
        <Typography variant="h6" component="h1" className={classes.title}>
          <Link color="inherit" href="/">
            WRAP
          </Link>
          <Link color="inherit" href="/" onClick={preventDefault}>
            History
          </Link>
        </Typography>
        <Box className={classes.wallets}>
          <TezosWalletConnection
            account={tzAccount}
            activate={tzActivate}
            status={tzConnectionStatus}
          />
          <EthWalletConnection
            account={ethAccount}
            activate={ethActivate}
            active={ethActive}
          />
        </Box>
        <Button
          aria-label="Environment selector"
          aria-controls="env-selector-appbar"
          aria-haspopup="true"
          onClick={openEnvSelector}
          color="inherit"
          size="small"
          variant="outlined"
          endIcon={<SwapHorizIcon />}
        >
          {config.environmentName}
        </Button>
        <Menu
          id="env-selector-appbar"
          anchorEl={anchorEnvSelector}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={closeEnvSelector}
        >
          {environmentOptions.map(({ name, environment }) => (
            <MenuItem
              key={environment}
              onClick={() => handleEnvSelection(environment)}
            >
              {name}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
export default Render;
