import { Elysia } from "elysia";
import { exists, unlink } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

const path = join(homedir(), "Documents", "FOYER");
let confirmed = {
  shutdown: false,
  delete: false,
};

const app = new Elysia()
  .state({ confirmed: false })
  .get("/", () => "Hello Elysia")
  .get("/obs", () => {
    Bun.spawn([
      "open",
      "/Applications/OBS.app",
      "--args",
      "--scene",
      "Recorded",
    ]);
    return { message: "Reopened OBS at Recorded" };
  })
  .get("/stop", () => {
    Bun.spawn(["killall", "OBS"]);
    return { message: "Stopped OBS" };
  })
  .get("/shutdown", () => {
    if (!confirmed.shutdown) {
      confirmed.shutdown = true;
      return { message: "Press again to shutdown" };
    }
    confirmed.shutdown = false;
    Bun.spawn(["shutdown", "now"]);
    return { message: "Shutting down" };
  })
  .get("/delete", async () => {
    if (!(await exists(`${path}.mkv`))) {
      return {
        message: "File not found",
      };
    }
    if (!confirmed.delete) {
      confirmed.delete = true;
      return { message: "Press again to delete" };
    }
    if (confirmed) {
      await unlink(`${path}.mkv`);
      await unlink(`${path}.mp4`);
      confirmed.delete = false;
      return { message: "Deleted" };
    }
    return {
      message: "Error",
    };
  })

  .listen({
    port: 3000,
    hostname: "0.0.0.0",
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
