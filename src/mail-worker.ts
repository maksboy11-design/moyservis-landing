import { runMailCli } from "./mail/cli";

void runMailCli(["worker"]).then((exitCode) => {
  process.exitCode = exitCode;
});
