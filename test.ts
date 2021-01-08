import { assert, test } from "./test_deps.ts";
import { existsSync, join } from "./deps.ts";
import { createRecord } from "./mod.ts";

function dropDb() {
  Deno.removeSync("db", { recursive: true });
}

test({
  name: "createRecord() creates a file with correct name",
  fn: () => {
    const testRecord = {
      id: "test_record",
      val: "test_value",
    };
    createRecord(testRecord);
    const testFilePath = join(".", "db", `${testRecord.id}.json`);
    assert(existsSync(testFilePath));
    dropDb();
  },
});
