import { assert, assertEquals, assertThrows, test } from "./test_deps.ts";
import { existsSync, join } from "./deps.ts";
import { createRecord } from "./mod.ts";
import config from "./config.ts";

function dropDb() {
  if (existsSync(config.dbDir)) {
    Deno.removeSync(config.dbDir, { recursive: true });
  }
}

const testRecord = {
  id: "test_record",
  val: "test_value",
};
const testFilePath = join(config.dbDir, `${testRecord.id}.json`);

test({
  name: "createRecord() creates a file with correct name",
  fn: () => {
    createRecord(testRecord);
    assert(existsSync(testFilePath));
    dropDb();
  },
});

test({
  name: "createRecord() creates a file with parsable contents",
  fn: () => {
    createRecord(testRecord);
    JSON.parse(Deno.readTextFileSync(testFilePath));
    dropDb();
  },
});

test({
  name: "createRecord() creates a file with correct contents",
  fn: () => {
    createRecord(testRecord);
    const testFileContents = JSON.parse(Deno.readTextFileSync(testFilePath));
    assertEquals(testFileContents, testRecord);
    dropDb();
  },
});

test({
  name: "createRecord() throws if record does not contain `id` property",
  fn: () => {
    const recordWithNoId = {
      val: "test_value",
    };
    assertThrows(() => {
      createRecord(recordWithNoId);
    });
    dropDb();
  },
});
