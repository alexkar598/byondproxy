import * as net from "node:net";
import { Socket } from "node:net";
import _debug from "debug";
import config from "../config";
import StreamC2S from "./stream/c2s";
import StreamS2C from "./stream/s2c";
import { Direction } from "./direction";

const debug = _debug("byondproxy:net");

export default (socket: Socket) => {
  const sock_debug = debug.extend(
    `${socket.remoteAddress}:${socket.remotePort}`,
  );

  const remoteSocket = new net.Socket();
  sock_debug(`Received connection`);

  remoteSocket.connect({
    host: config.targetAddress,
    port: config.targetPort,
    noDelay: true,
  });

  const c2s = new StreamC2S(
    socket,
    sock_debug.extend("StreamClient"),
    Direction.C2S,
    shutdown_error,
  );
  const s2c = new StreamS2C(
    remoteSocket,
    sock_debug.extend("StreamServer"),
    Direction.S2C,
    shutdown_error,
  );
  c2s.peer = s2c;
  s2c.peer = c2s;

  socket.on("error", (e) => shutdown_error(e));
  remoteSocket.on("error", (e) => shutdown_error(e));
  socket.on("close", shutdown);
  remoteSocket.on("close", shutdown);

  function shutdown() {
    if (!socket.closed) {
      sock_debug("Socket closed");
      socket.end();
    }
    if (!remoteSocket.closed) {
      sock_debug("Remote socket closed");
      remoteSocket.end();
    }
  }
  function shutdown_error(e: unknown) {
    sock_debug("Connection errored: %O", e);
    socket.destroy();
    remoteSocket.destroy();
  }
};
