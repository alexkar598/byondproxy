import { NetStream } from "./net_stream";
import { MsgType } from "../messages";
import type StreamC2S from "./c2s";
import type Message from "../messages/_message";
import UnknownMsg from "../messages/unknown";
import ConnectMsgS2C from "../messages/s2c/connect";
import { SAuth } from "../sauth";
import assert from "node:assert";

export default class StreamS2C extends NetStream {
  public peer!: StreamC2S;

  protected async handle_msg(msg: Message) {
    this.debug(msg.toString());
    if (!(msg instanceof UnknownMsg)) this.debug("%O", msg);

    // Suppress message to prevent key rotation
    if (msg.type == MsgType.Certified) {
      assert(this.key != null);
      assert(this.certId != null);
      this.key = this.peer.key = await SAuth.transformKey(
        this.key,
        this.certId,
      );
    }

    // Relay message to peer
    this.peer.send(msg.toRaw());

    // Key handling is done after relaying the message
    if (msg instanceof ConnectMsgS2C) {
      this.peer.is_sequenced = true;
      this.peer.key = this.key =
        ((this.key ?? 0) + msg.addToEncryptionKey) % 0xffff_ffff;
    }
  }
}
