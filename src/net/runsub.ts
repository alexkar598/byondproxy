export const RUNSUB = new (class {
  public encrypt(input: Buffer, key: number) {
    const buf = Buffer.alloc(input.length + 1);
    const checksum = Buffer.alloc(1);

    for (let i = 0; i < input.length; i++) {
      buf[i] = input[i];
      buf[i] += checksum[0] + Number(BigInt(key) >> BigInt(checksum[0] % 32));
      checksum[0] += input[i];
    }

    buf[buf.length - 1] = checksum[0];

    return buf;
  }

  public decrypt(input: Buffer, key: number) {
    const buf = Buffer.alloc(input.length - 1);
    const checksum = Buffer.alloc(1);

    for (let i = 0; i < buf.length; i++) {
      buf[i] = input[i];
      buf[i] -= checksum[0] + Number(BigInt(key) >> BigInt(checksum[0] % 32));
      checksum[0] += buf[i];
    }

    if (checksum[0] != input[input.length - 1])
      throw new Error(
        `Checksum mismatch\n\tKey: ${key.toString(16)}\n\tPayload: ${input.toString("hex")}`,
      );

    return buf;
  }
})();
