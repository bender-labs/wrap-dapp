export enum ConnectionStatus {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED,
  ERRORED
}

export function humanizeConnectionStatus(status: ConnectionStatus): string {
  switch (status) {
    case ConnectionStatus.NOT_CONNECTED:
      return "not connected";
    case ConnectionStatus.CONNECTING:
      return "connecting...";
    case ConnectionStatus.CONNECTED:
      return "connected";
    case ConnectionStatus.ERRORED:
      return "error";
  }
}

export enum ConnectionActions {
  launchingConnection,
  connectionSuccessful,
  connectionFailed,
  stoppingConnection
}

export const connectionStatusReducer = (state: ConnectionStatus, {type}: {type: ConnectionActions}): ConnectionStatus => {
  switch (type) {
    case ConnectionActions.launchingConnection:
      return ConnectionStatus.CONNECTING;
    case ConnectionActions.connectionSuccessful:
      return ConnectionStatus.CONNECTED;
    case ConnectionActions.connectionFailed:
      return ConnectionStatus.ERRORED;
    case ConnectionActions.stoppingConnection:
      return ConnectionStatus.NOT_CONNECTED;
  }
}

export const connectionStatusInitialState = (activated: boolean) => activated ? ConnectionStatus.CONNECTED : ConnectionStatus.NOT_CONNECTED;