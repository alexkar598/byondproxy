import type { MsgType } from "../messages";
import type { Socket } from "node:net";
import type { Debugger } from "debug";
import Message from "../messages/_message";
import { Direction } from "../direction";
import { buildMessage } from "../messages/_registry";
import { RUNSUB } from "../runsub";

// SEQ[u16] + Type[u16] + Size[u16] + Payload[Size]
const MAX_MSG_SIZE = 2 + 2 + 2 + 65_535;

export abstract class NetStream {
  private readonly buffer = Buffer.alloc(MAX_MSG_SIZE);
  private bufferSize = 0;
  public is_sequenced = false;
  public key: number | null = null;
  public certId: number | null = null;
  private pendingMessage: Promise<void> = Promise.resolve();

  private get header_size() {
    return this.is_sequenced
      ? // Seq + Type + Len
        2 + 2 + 2
      : // Type + Len
        2 + 2;
  }

  private get message_size() {
    const position = this.is_sequenced ? 4 : 2;
    if (this.bufferSize < position + 2) return null;
    return this.buffer.readUInt16BE(position);
  }

  private async handle_fragment(fragment: Buffer) {
    // If we know the full size, try to get the full message, otherwise, just try to get the size information
    const targetSize = this.header_size + (this.message_size ?? 0);
    // Amount of data we are extracting from the fragment
    const copySize = targetSize - this.bufferSize;
    // Copy fragment to buffer
    this.bufferSize += fragment.copy(this.buffer, this.bufferSize, 0, copySize);

    // Check if we have a complete message
    if (this.bufferSize >= this.header_size + (this.message_size ?? Infinity)) {
      // Slice the message from the buffer
      const msg = this.buffer.subarray(0, this.bufferSize);

      // Handle
      const raw_message = this.is_sequenced
        ? new RawMessage(
            msg.readUInt16BE(0),
            msg.readUInt16BE(2),
            Buffer.from(msg.subarray(6)),
          )
        : new RawMessage(
            null,
            msg.readUInt16BE(0),
            Buffer.from(msg.subarray(4)),
          );
      if (this.key != null) {
        raw_message.payload = RUNSUB.decrypt(raw_message.payload, this.key);
      }
      const message = buildMessage(raw_message, this.direction);
      await this.handle_msg(message);

      // Reset buffer size
      this.bufferSize = 0;
    }

    // We received more data than we cared about, recurse with the unused data
    if (fragment.length > copySize) {
      await this.handle_fragment(fragment.subarray(copySize));
    }
  }

  public send(message: RawMessage) {
    message = new RawMessage(message.sequence, message.type, message.payload);
    if (this.key != null)
      message.payload = RUNSUB.encrypt(message.payload, this.key);
    this.socket.write(message.toBuffer());
  }

  constructor(
    private readonly socket: Socket,
    protected readonly debug: Debugger,
    public readonly direction = Direction.None,
    on_error: (e: unknown) => void,
  ) {
    socket.on("data", (data) => {
      // Wait for the pending message to be handled before handling the next one
      this.pendingMessage.then(() => {
        this.pendingMessage = this.handle_fragment(data).catch((e) => {
          on_error(e);
        });
      });
    });
  }

  protected abstract handle_msg(msg: Message): Promise<void>;
}

export class RawMessage {
  public constructor(
    public sequence: number | null,
    public type: MsgType,
    public payload: Buffer,
  ) {}

  public toBuffer() {
    const buf = Buffer.alloc(
      (this.sequence != null ? 2 : 0) + 2 + 2 + this.payload.length,
    );

    // Seq
    if (this.sequence != null) buf.writeUInt16BE(this.sequence, 0);
    // Type
    buf.writeUInt16BE(this.type, this.sequence != null ? 2 : 0);
    // Size
    buf.writeUInt16BE(this.payload.length, this.sequence != null ? 4 : 2);
    // Payload
    this.payload.copy(buf, this.sequence != null ? 6 : 4);

    return buf;
  }
}
