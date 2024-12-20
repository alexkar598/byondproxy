import Message from "../_message";
import { MsgType } from "../../messages";
import { type RawMessage } from "../../stream/net_stream";
import * as assert from "node:assert";

export default class ConnectMsgC2S extends Message {
  public readonly type = MsgType.Connect;

  public byondVersion;
  public minVersion;
  public encryptionKeyModified;
  public firstSequenceNumber;
  public byondMinorVersion;
  public timeOffset;

  public constructor(msg: RawMessage) {
    super(msg);

    this.byondVersion = msg.payload.readUint32LE(0); //0:4
    this.minVersion = msg.payload.readUint32LE(4); //4:8
    this.encryptionKeyModified = msg.payload.readUint32LE(8); //8:12
    this.firstSequenceNumber = msg.payload.readUint16LE(12); //12:14
    this.byondMinorVersion = msg.payload.readUint32LE(14); //14:18
    this.timeOffset = msg.payload.readUint32LE(18); //18:22

    assert.strictEqual(msg.payload.length, 22);
  }

  protected rebuildPayload(): Buffer<ArrayBuffer> {
    const buf = Buffer.alloc(22);

    buf.writeUInt32LE(this.byondVersion, 0); //0:4
    buf.writeUInt32LE(this.minVersion, 4); //4:8
    buf.writeUInt32LE(this.encryptionKeyModified, 8); //8:12
    buf.writeUInt16LE(this.firstSequenceNumber, 12); //12:14
    buf.writeUInt32LE(this.byondMinorVersion, 14); //14:18
    buf.writeUInt32LE(this.timeOffset, 18); //18:22

    return buf;
  }

  public get encryptionKey() {
    return (
      this.encryptionKeyModified +
      (this.minVersion * 0x10000 + this.byondVersion)
    );
  }
}
