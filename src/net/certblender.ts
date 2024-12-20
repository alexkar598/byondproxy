const segments = [
  [0x00n, 0xffn],
  [0x04n, 0xffn],
  [0x08n, 0xffff_ffff_0000_00ffn],
  [0x0cn, 0xffff_ffff_0000_00ffn],
  [0x10n, 0xffff_ffff_0000_00ffn],
  [0x14n, 0xffff_ffff_0000_00ffn],
  [0x18n, ~0n],
  [0x1cn, ~0n],
] as const;

export const CertBlender = new (class {
  public blend(oldKey: number | bigint, pwd: Buffer) {
    oldKey = BigInt(oldKey);

    // Setup increment multiplier
    const prefix = pwd.readUInt8(0);
    const incrementMultiplier = (prefix << 3) * 0.00390625;
    pwd = pwd.subarray(1);

    // Convert buffer to a buffer of nibbles for ease of use
    const pwdNibbles = Buffer.alloc(pwd.length * 2);
    for (let i = 0; i < pwd.length; i++) {
      pwdNibbles[i * 2] = pwd[i] >> 4;
      pwdNibbles[i * 2 + 1] = pwd[i] & 0x0f;
    }

    let result = 0n;
    for (const [shift, mask] of segments) {
      const _tmp = (oldKey >> shift) & mask;
      const tmp = Math.floor(Number(_tmp) * incrementMultiplier);
      result |= BigInt(pwdNibbles[tmp]) << shift;
    }
    return Number((oldKey + result) % 0xffff_ffffn);
  }
})();
