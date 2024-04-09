import { Elysia } from "elysia";
import { exists, unlink } from "fs/promises";

const path = "/Users/tomdurrant/Documents/FOYER";
let confirmed = false;

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
  .get("/delete", async () => {
    if (!(await exists(`${path}.mkv`))) {
      return {
        message: "File not found",
      };
    }
    if (!confirmed) {
      confirmed = true;
      return { message: "Press again to delete" };
    }
    if (confirmed) {
      await unlink(`${path}.mkv`);
      await unlink(`${path}.mp4`);
      confirmed = false;
      return { message: "Deleted" };
    }
    return {
      message: "Error",
    };
  })

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
