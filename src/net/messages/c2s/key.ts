import { MsgType } from "../../messages";
import UnknownMsg from "../unknown";
import type { RawMessage } from "../../stream/net_stream";

export default class KeyMsg extends UnknownMsg {
  public readonly type = MsgType.Key;
  public readonly serverTopic: string;
  public readonly tfm: Buffer;
  public readonly certId: number;

  constructor(msg: RawMessage) {
    super(msg);

    const serverTopicLen = msg.payload.readUint16LE(0); //0:2
    this.serverTopic = msg.payload
      .subarray(2, 2 + serverTopicLen)
      .toString("utf8"); //2:2+serverTopicLen

    const tfmStart = 2 + serverTopicLen;
    // Find first null byte after tfmStart and add 1
    const tfmEnd =
      msg.payload.findIndex((x, idx) => idx >= tfmStart && x == 0x00) + 1;
    this.tfm = Buffer.from(msg.payload.subarray(tfmStart, tfmEnd)); //2+serverTopicLen:tfmEnd

    this.certId = msg.payload.readUint32LE(tfmEnd); //tfmEnd:tfmEnd+4
  }
}
