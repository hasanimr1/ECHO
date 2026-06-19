import * as signalR from '@microsoft/signalr';

let connection: signalR.HubConnection | null = null;
let isConnecting = false;

export function useSignalR() {
  if (!connection && !isConnecting) {
    isConnecting = true;
    let token = "";
    try {
      const data = JSON.parse(localStorage.getItem("echo_token_data") || "{}");
      token = data.token || "";
    } catch {}

    connection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5000/hubs/echo", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    connection.start()
      .then(() => console.log('SignalR Connected'))
      .catch(e => console.log('SignalR Connection Error: ', e));
  }

  return connection;
}
