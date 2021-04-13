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
import { Link as RouterLink } from 'react-router-dom';
import {
  useConfig,
  useEnvironmentSelectorContext,
} from '../runtime/config/ConfigContext';
import { Environment } from '../config';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import logo from './logo.png';
import EthWalletConnection from '../components/ethereum/WalletConnection';
import TezosWalletConnection from '../components/tezos/WalletConnection';
import { useWalletContext } from '../runtime/wallet/WalletContext';
import OperationHistoryDialog from '../features/operations/components/OperationHistoryDialog';
import { paths } from './routes';

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

// i have added this test

const Render = () => {
  const config = useConfig();
  const {
    setEnvironment,
    environmentOptions,
  } = useEnvironmentSelectorContext();
  const {
    ethereum: {
      activate: ethActivate,
      deactivate: ethDeactivate,
      account: ethAccount,
      connectors,
      status: ethConnectionStatus,
    },
    tezos: {
      activate: tzActivate,
      deactivate: tzDeactivate,
      status: tzConnectionStatus,
      account: tzAccount,
    },
  } = useWalletContext();
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

  return (
    <AppBar position="static">
      <Toolbar>
        <img src={logo} className={classes.logo} alt="Logo" />
        <Typography variant="h6" component="h1" className={classes.title}>
          <Link component={RouterLink} color="inherit" to={paths.WRAP}>
            WRAP
          </Link>
          <Link component={RouterLink} color="inherit" to={paths.HISTORY}>
            HISTORY
          </Link>
        </Typography>

        <Box className={classes.wallets}>
          <OperationHistoryDialog />
          <TezosWalletConnection
            account={tzAccount}
            activate={tzActivate}
            deactivate={tzDeactivate}
            connectionStatus={tzConnectionStatus}
          />
          <EthWalletConnection
            account={ethAccount}
            activate={ethActivate}
            deactivate={ethDeactivate}
            connectors={connectors}
            connectionStatus={ethConnectionStatus}
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
