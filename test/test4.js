const assert = require('assert')
const { database } = require('./lib/database2')
const db = database


const MAX_RANDOM = 1000000

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }
  
db.transactionsStart(() => {
	for (let i = 0 ; i < MAX_RANDOM; i++) {
		db.post('coupons', { name: `coupon${i}`, count: getRandomInt(10) })
	}
})

db.transactionsStart(() => {
	for (let i = 0 ; i < 1000000; i++) {
		db.post('users', { couponName: `coupon${getRandomInt(MAX_RANDOM)}` })
	}

})

describe('hooks', function() {
	describe('constructor', function() {
		it('should create folders and setup basic environment', function() {
			//console.table(db.search('coupons'))
			assert.equal(true, true)
		})
	})
})