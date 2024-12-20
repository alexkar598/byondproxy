import Message from "./_message";
import { type RawMessage } from "../stream/net_stream";
import type { MsgType } from "../messages";

export default class UnknownMsg extends Message {
  public readonly type: MsgType;
  private readonly originalPayload: Buffer;

  public constructor(msg: RawMessage) {
    super(msg);

    this.type = msg.type;
    this.originalPayload = msg.payload;
  }

  protected rebuildPayload(): Buffer {
    return Buffer.from(this.originalPayload);
  }
}
