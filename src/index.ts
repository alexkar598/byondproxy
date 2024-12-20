import "dotenv/config";

import * as net from "node:net";
import listener from "./net/listener";
import config from "./config";
import { RUNSUB } from "./net/runsub";
import { CertBlender } from "./net/certblender";

const server = net.createServer(
  {
    noDelay: true,
  },
  listener,
);

server.listen(config.bindPort, config.bindAddress, () => {
  console.log("Listening on port", config.bindPort);
});
