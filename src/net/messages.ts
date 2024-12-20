// noinspection JSUnusedGlobalSymbols
export enum MsgType {
  /**
   * This is sent at the start of any connection.
   *
   * It always seems to have 18 bytes of content in modern versions.
   *
   * - Uint32LE byondVersion
   * - Uint32LE minVersion
   * - Uint32LE encryptionKeyModified
   * - Uint16LE firstSequenceNumber (this is the first sequence number the client will use)
   * - Uint32LE byondMinorVersion (note: this isn't present in v354, but I don't know which version it was added to)
   *
   * The exact details of the encryption key modification are encryptionKeyModified = encryptionKey - ((minVersion * 0x10000) + byondVersion).
   *
   * The server sends back it's own handshake - 0x0001 - in response.
   *
   * This is sent after the server receives the client's handshake.
   *
   * It is already encrypted (which indicates the key must be present in the communications up to/including it).
   *
   * It has 60 bytes of content.
   *
   * - Uint32LE byondVersion
   * - Uint32LE minVersion
   * - Uint8 isPermanentPort (1 if so, 0 otherwise)
   * - Uint8 dmbFlagsHasEx
   * - Uint8 unk (introduced in v433)
   * - Padding: Read Uint32LE, add 0x71bd632f then AND 0x04008000 - if not 0, repeat. For example, 0x06beb95e terminates, 0x1ed688b0 doesn't.
   * - Uint32LE addToEncryptionKey
   * - Padding: Read Uint32LE, add 0x17db36e3 then AND 0x00402000 - if not 0, repeat. For example, 0x69b7216b terminates.
   *
   * addToEncryptionKey has to be added to the encryption key.
   *
   * The client sends back 0x001a in response.
   */
  Connect = 0x01,
  /**Used to request the server authenticate the client via byond hub, cycling the key in the process. Sent in response to itself and to RequestCert*/
  Certified = 0x36,

  // C2S
  /**
   * This is sent to indicate quitting.
   *
   * It seems to be a single null byte, which could indicate that it's actually a string (uncertain).
   */
  Quit = 0x00,
  /**
   * Further details unknown, just know it involves some sorta client-local verb index system (see StoC 0x0011)
   *
   * My tests look like:
   *
   * - `02 00 00 00 02 00 00 00 00 00` (invokes verb index 0)
   * - `02 00 01 00 02 00 00 00 00 00` (invokes verb index 1)
   * - `02 00 02 00 02 00 00 00 00 00` (invokes verb index 2)
   */
  InvokeVerb = 0x02, //kdc
  /**
   * Further details unknown.
   *
   * The server sends back 0x003b in response.
   */
  Key = 0x1a, //kdc

  // S2C
  /**
   * Further details unknown.
   *
   * WebClient expects 6 bytes but regular clients don't need any. Almost certainly a different format.
   *
   * This is the point where the server starts sending packets I can immediately verify it repeatedly sends.
   *
   * I don't intend to document everything right now, just get the webclient working.
   *
   * The communications (which are sometimes bi-direction) end with the server sending 0x0018 and then a batch of 0x0011.
   */
  CacheList = 0x0e, //kdc
  /**
   * This registers a verb index.
   *
   * It's important to note that these verbs are immediately usable.
   *
   * - Uint16LE index
   * - String name
   * - Unknown stuff (00 00 ff 00 04 00 for my test verbs but could be of any length)
   */
  RegisterVerbIndex = 0x11, //kdc
  /**
   * Further details unknown. Empty in my tests.
   *
   * By this point the client is in-game, and gets sent verb indexes.
   */
  PHS5 = 0x18, //kdc
  /**Used by the server to request that the client authenticate itself with byond hub with a cert*/
  RequestCert = 0x1c,
  /**
   * This appears to be describing the appearance of an atom.
   *
   * - 4 bytes (??? subject to change ???)
   * - String text
   * - 6 bytes
   * - The text character, but not sure how it's represented
   */
  DescribeAtomAppearance = 0x26, //kdc
  /**
   * - String text
   * - WebClient suggests that there is optional stuff here the existence of which is based on if there's room or not.
   */
  IncomingMessage = 0x27, //kdc
  /**Further details unknown.*/
  PHS2 = 0x3b, //kdc
  /**Further details unknown.*/
  ServerInfo = 0x72, //kdc
  /**Further details unknown.*/
  PHS3 = 0xef, //kdc
}
