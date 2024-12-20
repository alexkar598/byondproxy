export default {
  bindAddress: "0.0.0.0",
  bindPort: 5001,

  targetAddress: "192.168.0.185",
  // targetAddress: "localhost",
  targetPort: 5000,

  sauthPath: ".byond/cfg/sauth.txt",
} satisfies ProxyConfig;
