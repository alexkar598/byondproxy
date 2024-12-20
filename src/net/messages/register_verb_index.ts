import { MsgType } from "../messages";
import type { RawMessage } from "../stream/net_stream";
import UnknownMsg from "./unknown";

export default class RegisterVerbIndex extends UnknownMsg {
  public readonly type = MsgType.RegisterVerbIndex;

  public readonly idx;
  public readonly name;

  constructor(msg: RawMessage) {
    super(msg);

    this.idx = msg.payload.readUInt16LE(0);
    if (this.idx > 2) {
      this.name = "ERR";
      return;
    }

    for (let i = 2; true; i++) {
      if (msg.payload.readInt8(i) == 0) {
        this.name = msg.payload.subarray(2, i).toString("utf8");
        break;
      }
    }
  }
}
