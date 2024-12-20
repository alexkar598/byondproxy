import { MsgType } from "../../messages";
import type { RawMessage } from "../../stream/net_stream";
import UnknownMsg from "../unknown";

export default class ConnectMsgS2C extends UnknownMsg {
  public readonly type = MsgType.Connect;

  public readonly byondVersion;
  public readonly minVersion;
  public readonly isPermanentPort;
  public readonly dmbFlagsHasEx;
  public readonly addToEncryptionKey;

  public constructor(msg: RawMessage) {
    super(msg);

    this.byondVersion = msg.payload.readUint32LE(0); //0:4
    this.minVersion = msg.payload.readUint32LE(4); //4:8
    this.isPermanentPort = !!msg.payload.readUint8(8); //8
    // unknown u8
    this.dmbFlagsHasEx = !!msg.payload.readUint8(10); //10

    for (let i = 11; true; i += 4) {
      let temp = msg.payload.readUint32LE(i); //11:N
      temp += 0x81bd_632f;
      temp %= 0xffff_ffff;
      temp &= 0x0400_8000;
      if (temp == 0) {
        this.addToEncryptionKey = msg.payload.readUint32LE(i + 4); //N+1:N+5
        break;
      }
    }
  }
}
