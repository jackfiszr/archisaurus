import { ensureDirSync, join } from "./deps.ts";

export function createRecord(record: { [key: string]: unknown }) {
  ensureDirSync("db");
  const filePath = join("db", `${record.id}.json`);
  const res = Deno.createSync(filePath);
  Deno.close(res.rid);
}
