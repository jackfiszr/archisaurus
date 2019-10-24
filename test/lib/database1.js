const { Archivarius } = require('../..')
const dir = `${__dirname}/../.local/test1`
const database = new Archivarius(
	{
		users: {
			onPost: (database, record) => {
				record.createdAt = Date.now()
				return (database, record) => {
					if (record.couponName) {
						const coupons = database.search('coupons', { name: record.couponName })
						if (coupons[0].count === coupons[0].countUsed) {
							throw new Error(`coupon ${record.couponName} is exceed its limit`)
						}
						coupons[0].countUsed++
						database.put('coupons', coupons[0])
					}
				}
			},
		},
		coupons: {
			onPost(database, record) {
				record.countUsed = 0
			},
		},
	},
	dir,
)

module.exports = {
	database,
	dir,
}
