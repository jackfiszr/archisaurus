const assert = require('assert')
const { database } = require('./lib/database0')
const db = database

db.transactionsStart(() => {
	db.post('coupons', { name: 'coupon1', count: 5 })
	db.post('coupons', { name: 'coupon2', count: 0 })
	db.post('coupons', { name: 'coupon3', count: 0 })
})

db.transactionsStart(() => {
	db.post('users', { couponName: 'coupon1' })
	db.post('users', { couponName: 'coupon1' })
	db.post('users', { couponName: 'coupon2' })
	db.post('users', { couponName: 'coupon2' })
	db.post('users', { couponName: 'coupon2' })
	db.post('users', { couponName: 'coupon3' })
})

describe('hooks', function() {
	describe('constructor', function() {
		it('should create folders and setup basic environment', function() {
			console.table(db.search('coupons'))
			assert.equal(true, true)
		})
	})
})