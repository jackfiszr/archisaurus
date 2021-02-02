import { Ask, ensureDirSync, existsSync, join } from "./deps.ts";
import defaultConfig, { UserConfig } from "./config.ts";

class Archisaurus {
  constructor(public options: typeof defaultConfig) {}

  createRecord(record: { [key: string]: unknown }) {
    if (!record.id) {
      throw (Error("Record should contain an `id` property"));
    }
    ensureDirSync(this.options.dbDir);
    const filePath = join(this.options.dbDir, `${record.id}.json`);
    Deno.writeTextFileSync(
      filePath,
      JSON.stringify(record, null, this.options.pretty),
    );
  }

  async dropDb(sure?: boolean) {
    if (!sure) {
      const ask = new Ask();
      const { answer } = await ask.input({
        name: "answer",
        message: "Are you sure you want to delete entire database? (yes/no)",
      });
      if (answer.toLowerCase() !== "yes") {
        return;
      }
    }
    if (existsSync(this.options.dbDir)) {
      Deno.removeSync(this.options.dbDir, { recursive: true });
    }
  }
}

export function createDb(options?: UserConfig) {
  return new Archisaurus(Object.assign({}, defaultConfig, options));
}
