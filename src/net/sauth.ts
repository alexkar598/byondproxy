import * as os from "node:os";
import * as fs from "node:fs";
import config from "../config";
import * as path from "node:path";
import { CertBlender } from "./certblender";

const sauth_file = await fs.promises.open(
  path.resolve(os.homedir(), config.sauthPath),
  "r",
);

const entryRegex = /^.*?\.([0-9a-f]{1,8})(?= ).*?[ ;]pwd=([0-9a-f]+)/gm;

export const SAuth = new (class {
  private entries = new Map<number, Buffer>();

  private async reloadFile() {
    for (const [, key, pwd] of (await sauth_file.readFile("utf8")).matchAll(
      entryRegex,
    )) {
      this.entries.set(parseInt(key, 16), Buffer.from(pwd, "hex"));
    }
  }

  public async transformKey(key: number, certId: number) {
    let pwd = this.entries.get(certId);
    if (pwd == null) {
      await this.reloadFile();
      pwd = this.entries.get(certId);
    }
    if (pwd == null)
      throw new Error(
        `Unable to get pwd for certificate ${certId.toString(16)}`,
      );

    return CertBlender.blend(key, pwd);
  }
})();
