const path = require("path");

module.exports = {
  output: "export",
  images: { unoptimized: true },
  serverExternalPackages: ["@amplitude/ai", "@amplitude/analytics-node"],
  // Pin to this app so a stray ~/package-lock.json is not treated as the workspace root
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
};
