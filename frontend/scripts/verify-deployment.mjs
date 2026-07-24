import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = [
  "package.json",
  "app/layout.tsx",
  "app/page.tsx",
  "next.config.ts",
];

const missingFiles = requiredFiles.filter(
  (file) => !existsSync(resolve(process.cwd(), file))
);

if (missingFiles.length) {
  throw new Error(
    `MealNest frontend build is running from the wrong directory. Missing: ${missingFiles.join(", ")}`
  );
}

console.log("[MealNest deployment] Frontend root verified.");
console.log("[MealNest deployment] App Router root route detected: app/page.tsx.");
console.log(
  `[MealNest deployment] NEXT_PUBLIC_API_URL configured: ${Boolean(process.env.NEXT_PUBLIC_API_URL)}`
);
