import { assert, assertEquals, assertThrows, test } from "./test_deps.ts";
import { existsSync, join } from "./deps.ts";
import { createDb } from "./mod.ts";
import defaultConfig from "./config.ts";

const testRecord = {
  id: "test_record",
  val: "test_value",
};
const testFilePath = join(defaultConfig.dbDir, `${testRecord.id}.json`);

const db = createDb(defaultConfig);

test({
  name: "createRecord() creates a file with correct name",
  fn: () => {
    db.createRecord(testRecord);
    assert(existsSync(testFilePath));
    db.dropDb(true);
  },
});

test({
  name: "createRecord() creates a file with parsable contents",
  fn: () => {
    db.createRecord(testRecord);
    JSON.parse(Deno.readTextFileSync(testFilePath));
    db.dropDb(true);
  },
});

test({
  name: "createRecord() creates a file with correct contents",
  fn: () => {
    db.createRecord(testRecord);
    const testFileContents = JSON.parse(Deno.readTextFileSync(testFilePath));
    assertEquals(testFileContents, testRecord);
    db.dropDb(true);
  },
});

test({
  name: "createRecord() throws if record does not contain `id` property",
  fn: () => {
    const recordWithNoId = {
      val: "test_value",
    };
    assertThrows(() => {
      db.createRecord(recordWithNoId);
    });
    db.dropDb(true);
  },
});

test({
  name: "createDb() can customize db directory",
  fn: () => {
    const customOptions = { dbDir: "store" };
    assert(!existsSync(customOptions.dbDir));
    const dbWithCustomDir = createDb(customOptions);
    dbWithCustomDir.createRecord(testRecord);
    assert(existsSync(customOptions.dbDir));
    dbWithCustomDir.dropDb(true);
  },
});
