import { Direction } from "../direction";
import { RawMessage } from "../stream/net_stream";
import { MsgType } from "../messages";
import UnknownMsg from "./unknown";
import Message from "./_message";
import RegisterVerbIndex from "./register_verb_index";
import ConnectMsgC2S from "./c2s/connect";
import ConnectMsgS2C from "./s2c/connect";
import KeyMsg from "./c2s/key";

const messageTypes: Record<
  Direction,
  Record<number, new (msg: RawMessage) => Message>
> = {
  [Direction.None]: {},
  [Direction.C2S]: {},
  [Direction.S2C]: {},
};

export function registerMessage<T extends new (msg: RawMessage) => Message>(
  type: MsgType,
  message: T,
  direction = Direction.None,
) {
  if (type in messageTypes[direction]) {
    throw new Error("Duplicate message type");
  }

  messageTypes[direction][type] = message;
}

export function buildMessage(message: RawMessage, direction = Direction.None) {
  let type =
    messageTypes[direction][message.type] ??
    messageTypes[Direction.None][message.type];

  if (type == null) return new UnknownMsg(message);

  return new type(message);
}

registerMessage(MsgType.Connect, ConnectMsgC2S, Direction.C2S);
registerMessage(MsgType.Connect, ConnectMsgS2C, Direction.S2C);
registerMessage(MsgType.RegisterVerbIndex, RegisterVerbIndex);
registerMessage(MsgType.Key, KeyMsg, Direction.C2S);
