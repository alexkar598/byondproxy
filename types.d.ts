declare interface ProxyConfig {
  bindAddress: string;
  bindPort: number;

  targetAddress: string;
  targetPort: number;

  sauthPath: string;
}
