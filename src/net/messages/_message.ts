import { MsgType } from "../messages";
import { RawMessage } from "../stream/net_stream";

export default abstract class Message {
  public abstract readonly type: MsgType;

  public sequence: number | null;

  protected constructor(msg: RawMessage) {
    this.sequence = msg.sequence;
  }

  protected abstract rebuildPayload(): Buffer;

  public toRaw() {
    return new RawMessage(this.sequence, this.type, this.rebuildPayload());
  }

  public toString() {
    const payload = this.rebuildPayload();
    return `Message (${MsgType[this.type] ?? "?"} / ${"0x" + this.type.toString(16).padStart(2, "0")}): 
  ${payload.toString("hex")}
  ${payload
    .values()
    .map((x) => (x > 0x20 && x < 0x7f ? String.fromCharCode(x) : "."))
    .toArray()
    .join(" ")}`;
  }
}
