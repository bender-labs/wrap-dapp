import React, {ChangeEvent, MouseEvent} from "react";
import {Button, FormControl, FormGroup, InputLabel, makeStyles, MenuItem, Select} from "@material-ui/core";
import {ConnectorsList} from "../../features/ethereum/connectorsFactory";
import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import {useSnackbar} from "notistack";
import errorMessage from "../../features/ethereum/errorMessage";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 275,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

enum ConnectionStatus {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED
}

enum ConnectionActions {
  launchingConnection,
  connectionSuccessful,
  connectionFailed,
  stoppingConnection
}

const connectionStatusReducer = (state: ConnectionStatus, {type}: {type: ConnectionActions}): ConnectionStatus => {
  switch (type) {
    case ConnectionActions.launchingConnection:
      return ConnectionStatus.CONNECTING;
    case ConnectionActions.connectionSuccessful:
      return ConnectionStatus.CONNECTED;
    case ConnectionActions.connectionFailed:
      return ConnectionStatus.NOT_CONNECTED;
    case ConnectionActions.stoppingConnection:
      return ConnectionStatus.NOT_CONNECTED;
  }
}

const connectionStatusInitialState = (activated: boolean) => activated ? ConnectionStatus.CONNECTED : ConnectionStatus.NOT_CONNECTED;

interface Props {
  connectors: ConnectorsList
}

export default function WalletConnection({connectors}: Props) {
  const {activate, active} = useWeb3React<Web3Provider>()
  const { enqueueSnackbar } = useSnackbar();

  const classes = useStyles();
  const connectorNames = Object.keys(connectors);
  const [currentConnector, setCurrentConnector] = React.useState(connectorNames[0]);
  const [connectionStatus, dispatchConnectionAction] = React.useReducer(connectionStatusReducer, connectionStatusInitialState(active));

  const onConnectorSelected = (event: ChangeEvent<any>) => {
    setCurrentConnector(event.target.value);
  }

  const onStartConnection = (event: MouseEvent) => {
    event.preventDefault();
    dispatchConnectionAction({type: ConnectionActions.launchingConnection});
    activate(connectors[currentConnector], _ => null, true)
      .then(() => dispatchConnectionAction({type: ConnectionActions.connectionSuccessful}))
      .catch(error => {
        const {message, variant} = errorMessage(error);
        dispatchConnectionAction({type: ConnectionActions.connectionFailed});
        enqueueSnackbar(message, {variant});
      });
  }

  return (
    <div>
      <h1 style={{ margin: '1rem', textAlign: 'right' }}>{
        connectionStatus === ConnectionStatus.CONNECTED ? '🟢' :
          connectionStatus === ConnectionStatus.NOT_CONNECTED ? '🔴' :
            '🟠'}</h1>
      <FormGroup row={true}>
        <FormControl className={classes.formControl}>
          <InputLabel id="select-connector">Please select you wallet provider</InputLabel>
          <Select
            labelId="select-connector"
            id="connector-selector"
            value={currentConnector}
            onChange={onConnectorSelected}
          >
            {connectorNames.map((key, index) => (
              <MenuItem key={index} value={key}>{key}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" size="small" color="primary" disabled={connectionStatus === ConnectionStatus.CONNECTING} onClick={onStartConnection}>
          Connect
        </Button>
      </FormGroup>
    </div>
  );
}