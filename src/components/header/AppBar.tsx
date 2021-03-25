import {
  AppBar,
  Button,
  createStyles,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { useState } from 'react';
import {
  useConfig,
  useEnvironmentSelectorContext,
} from '../../runtime/config/ConfigContext';
import { Environment } from '../../config';
import SwapHorizIcon from '@material-ui/icons/SwapHoriz';
import logo from './logo.png';

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
  })
);

const Render = () => {
  const config = useConfig();
  const {
    setEnvironment,
    environmentOptions,
  } = useEnvironmentSelectorContext();
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
          <Link color="inherit" href="/">
            WRAP
          </Link>
        </Typography>
        <Button
          aria-label="Environment selector"
          aria-controls="env-selector-appbar"
          aria-haspopup="true"
          onClick={openEnvSelector}
          color="inherit"
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
