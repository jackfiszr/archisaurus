const { Archivarius } = require("../..");

const dir = `${__dirname}/../.local/test0`;

const onPostUsers = (db, rec) => {
  rec.createdAt = Date.now();
  return () => {
    if (rec.couponName) {
      const coupons = database.search(
        "coupons",
        { name: rec.couponName }
      );
      coupons[0].countUsed++;
      if (coupons[0].count != 0 && coupons[0].count < coupons[0].countUsed) {
        throw new Error(`coupon ${rec.couponName} is exceed its limit`);
      }
      db.put("coupons", coupons[0]);
    }
  };
};

const onPostCoupons = (db, rec) => {
  rec.countUsed = 0;
};

const database = new Archivarius(
  {
    users: {
      onPost: onPostUsers
    },
    coupons: {
      onPost: onPostCoupons
    }
  },
  dir
);

module.exports = {
  database,
  dir
};
