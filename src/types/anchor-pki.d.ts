declare module "anchor-pki/auto-cert/integrations/next" {
  import type { NextConfig } from "next";

  function autoCert(config: { enabledEnv: string }): (nextConfig: NextConfig) => NextConfig;
  export default autoCert;
}
