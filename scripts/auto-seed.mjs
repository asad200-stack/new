import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

const prisma = new PrismaClient();

try {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log("AUTO_SEED: skipping (users already exist).");
    process.exit(0);
  }

  console.log("AUTO_SEED: running prisma db seed...");
  await run("npx", ["prisma", "db", "seed"]);
  console.log("AUTO_SEED: done.");
} finally {
  await prisma.$disconnect();
}


