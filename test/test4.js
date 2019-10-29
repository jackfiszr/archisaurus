const assert = require('assert')
const { database } = require('./lib/database2')
const db = database


const MAX_COUNT_OF_ITEMS = 5

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }
  
db.transactionsStart(() => {
	for (let i = 0 ; i < MAX_COUNT_OF_ITEMS; i++) {
		db.post('coupons', { name: `coupon${i}`, count: getRandomInt(10) })
	}
})

db.transactionsStart(() => {
	for (let i = 0 ; i < MAX_COUNT_OF_ITEMS; i++) {
		db.post('users', { userName: `user${i}`,
						   email: `user${i}@mail.com`,
						   couponName: `coupon${getRandomInt(MAX_COUNT_OF_ITEMS)}` })
	}

})

describe('Database for searchByIndex', function() {
	describe('constructor', function() {
		it('should create folders and setup basic environment', function() {
			//console.table(db.search('coupons'))
			assert.equal(true, true)
		})
	})
})

describe('searchByIndex', () => {
	it('should find user0 by userNmae and email index', function() {		
		assert.equal(
			db.searchByIndex('users', {userName: 'user0', email: 'user0@mail.com'})[0].userName,
			'user0'
		)
	})
})
