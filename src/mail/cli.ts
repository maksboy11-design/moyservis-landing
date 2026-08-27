import { pathToFileURL } from "node:url";

import { checkMailHealth, enqueueTestMail } from "./operations";
import { MailService } from "./service";

export async function runMailCli(
  args: readonly string[] = process.argv.slice(2),
): Promise<number> {
  const command = args[0];
  const created = MailService.create();
  if (!created.ok) {
    console.error(
      JSON.stringify({
        ok: false,
        reason: created.reason,
        errors: created.errors,
      }),
    );
    return 1;
  }

  const { service } = created;
  try {
    if (command === "health") {
      const health = await checkMailHealth(service);
      console.log(JSON.stringify(health));
      return health.ok ? 0 : 1;
    }

    if (command === "test-send") {
      const recipient = args[1] ?? process.env.MAIL_TEST_TO;
      if (!recipient) {
        console.error("Recipient argument or MAIL_TEST_TO is required");
        return 2;
      }
      const result = await enqueueTestMail(service, recipient);
      console.log(JSON.stringify(result));
      return result.ok ? 0 : 1;
    }

    if (command === "worker") {
      const controller = new AbortController();
      const stop = () => controller.abort();
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
      try {
        await service.createWorker().start(controller.signal);
        return 0;
      } finally {
        process.removeListener("SIGINT", stop);
        process.removeListener("SIGTERM", stop);
      }
    }

    console.error("Usage: mail <health|test-send [recipient]|worker>");
    return 2;
  } finally {
    service.close();
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  void runMailCli().then((exitCode) => {
    process.exitCode = exitCode;
  });
}
