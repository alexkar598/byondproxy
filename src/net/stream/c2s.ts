import { NetStream } from "./net_stream";
import type StreamS2C from "./s2c";
import type Message from "../messages/_message";
import UnknownMsg from "../messages/unknown";
import ConnectMsgC2S from "../messages/c2s/connect";
import KeyMsg from "../messages/c2s/key";

export default class StreamC2S extends NetStream {
  public peer!: StreamS2C;

  protected async handle_msg(msg: Message) {
    this.debug(msg.toString());

    if (Object.getPrototypeOf(msg) != UnknownMsg.prototype)
      this.debug("%O", msg);

    // Record the certificate ID
    if (msg instanceof KeyMsg) {
      this.certId = msg.certId;
      this.peer.certId = msg.certId;
    }

    // Relay message to peer
    this.peer.send(msg.toRaw());

    // Key handling is done after relaying the message
    if (msg instanceof ConnectMsgC2S) {
      this.peer.key = msg.encryptionKey;
      this.key = msg.encryptionKey;
    }
  }
}
