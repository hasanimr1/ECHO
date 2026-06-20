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

    const hubUrl = import.meta.env.VITE_HUB_URL || "http://localhost:5000/hubs/echo";

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
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
