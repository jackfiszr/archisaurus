const assert = require("assert");
const { Archivarius } = require("..");

const db = new Archivarius({
  transactions: {},
  accounts: {}
}, `${__dirname}/.local/test0`);

const savedData = {};

describe("basic operations", function() {
  describe("post", function() {
    it("should fail because transaction not started", function() {
      assert.throws(() => {
        db.post("accounts", { name: "account 1" });
      }, Error);
    });
    it("should fail because collection not exists", function() {
      assert.throws(() => {
        db.transactionsStart(() => {
          const account = db.post(
            "accountsNotExisting",
            { name: "account1" }
          );
        });
      }, Error);
    });

    it("should successfully post 1 account in transaction", function() {
      db.transactionsStart(() => {
        const account = db.post("accounts", { name: "account1" });
        return () => {
          assert.notEqual(account._, undefined);
        };
      });
    });

    it("should successfully post 2 account in transaction", function() {
      db.transactionsStart(() => {
        const account2 = db.post("accounts", { name: "account2" });
        const account3 = db.post("accounts", { name: "account3" });
      });
      assert.equal(db.search("accounts", {}).length, 3);
    });

    it("should successfully find only 1 record", function() {
      assert.equal(
        db.search("accounts", { name: "account2" }).length,
        1
      );
    });

    it("should successfully find account2", function() {
      assert.equal(
        db.search("accounts", { name: "account2" })[0].name,
        "account2"
      );
    });

    it("should fail to find account4", function() {
      assert.equal(
        db.search("accounts", { name: "account4" })[0],
        undefined
      );
    });
  });
});
