import { ensureDirSync, join } from "./deps.ts";
import config from "./config.ts";

class Archisaurus {
  constructor(public options: typeof config) {}

  createRecord(record: { [key: string]: unknown }) {
    if (!record.id) {
      throw (Error("Record should contain an `id` property"));
    }
    ensureDirSync(this.options.dbDir);
    const filePath = join(this.options.dbDir, `${record.id}.json`);
    Deno.writeTextFileSync(filePath, JSON.stringify(record));
  }
}

export function createDb(options: typeof config) {
  return new Archisaurus(options);
}
