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
import Grid from '@material-ui/core/Grid'
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
    // grid: {
    //   display: 'flex',
    //   border: '2px solid red',
    // },
    gridItemsR: {
      border: '2px solid blue',
    },
    gridItemsL: {
      border: '2px solid green',
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
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
            >

          <Grid item className={classes.gridItemsR}>
            <img src={logo} className={classes.logo} alt="Logo" />
          </Grid>

          <Grid
            item
            className={classes.gridItemsR}
            >

            <Typography variant="h6" component="h1" className={classes.title}>
              <Link component={RouterLink} color="inherit" to={paths.WRAP}>
                WRAP
              </Link>
            </Typography>
          </Grid>

          <Grid
            item
            className={classes.gridItemsR}
            >
            <Typography variant="h6" component="h1" className={classes.title}>
              <Link component={RouterLink} color="inherit" to={paths.HISTORY}>
                HISTORY
              </Link>
            </Typography>
          </Grid>
        </Grid>

        <Grid
          container
          direction="row"
          justify="flex-end"
          alignItems="center"
          >
          <Grid
            item
            className={classes.gridItemsL}
            >
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
          </Grid>
          <Grid
            item
            className={classes.gridItemsL}
            >
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
            </Grid>
          </Grid>
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
