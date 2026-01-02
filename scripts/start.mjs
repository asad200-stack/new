import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

const port = process.env.PORT || "3000";

try {
  // Ensure DB schema is up to date in production (Railway-friendly).
  await run("npx", ["prisma", "migrate", "deploy"]);
  if (process.env.AUTO_SEED === "1") {
    await run("node", ["scripts/auto-seed.mjs"]);
  }
  await run("npx", ["next", "start", "-p", port]);
} catch (err) {
  console.error(err);
  process.exit(1);
}


