import { assert, test } from "./test_deps.ts";
import { existsSync, join } from "./deps.ts";
import { createRecord } from "./mod.ts";
import config from "./config.ts";

function dropDb() {
  Deno.removeSync(config.dbDir, { recursive: true });
}

test({
  name: "createRecord() creates a file with correct name",
  fn: () => {
    const testRecord = {
      id: "test_record",
      val: "test_value",
    };
    createRecord(testRecord);
    const testFilePath = join(config.dbDir, `${testRecord.id}.json`);
    assert(existsSync(testFilePath));
    dropDb();
  },
});
