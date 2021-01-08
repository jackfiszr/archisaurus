import { ensureDirSync, join } from "./deps.ts";
import config from "./config.ts";

export function createRecord(record: { [key: string]: unknown }) {
  ensureDirSync(config.dbDir);
  const filePath = join(config.dbDir, `${record.id}.json`);
  const res = Deno.createSync(filePath);
  Deno.close(res.rid);
}