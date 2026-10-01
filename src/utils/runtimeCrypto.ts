// Universal entry: no Node dependency is loaded in edge runtimes.
export const nodeCrypto: typeof import('node:crypto') | undefined = undefined;
