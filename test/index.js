const { Archivarius } = require('../dist')
const dir = `${__dirname}/.local`
const fs = require('fs')
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
const assert = require('assert')
const savedData = {}

describe('Database', function() {
	describe('constructor', function() {
		it('should create folders and setup basic environment', function() {
			const test =
				fs.existsSync(`${dir}/collections`) &&
				fs.existsSync(`${dir}/transactions`) &&
				fs.existsSync(`${dir}/indexes`)
			assert.equal(test, true)
		})
	})

	describe('basic operations post/put/patch/delete/get/search', function() {
		it('add new record and generate _', function() {
			database.transactionsStart()
			const record = database.post(
				'users',
				{ username: 'username' },
			)
			savedData.recordPosted = record
			database.transactionsCommit()
			//console.table([database.get('users', record._)])
			assert.equal(!!record._, true)
		})

		it(`should get record by _`, function() {
			const record = database.get(
				'users',
				savedData.recordPosted._,
			)
			assert.equal(savedData.recordPosted._, record._)
		})

		it('should replace record by _', function() {
			database.transactionsStart()
			const result = database.put(
				'users',
				{
					_: savedData.recordPosted._,
					name: 'myname',
				},
			)
			database.transactionsCommit()
			const record = database.get('users', savedData.recordPosted._)
			assert.equal(record.username === undefined && record.name === 'myname', true)
		})

		it('should update record by _', function() {
			database.transactionsStart()
			const result = database.patch('users', {
				_: savedData.recordPosted._,
				profile: { lastName: 'lastname' },
			})
			database.transactionsCommit()
			const record = database.get('users', savedData.recordPosted._)
			assert.equal(record.name === 'myname' && record.profile.lastName === 'lastname', true)
		})

		it('should not anyhow affect initial posted record', function() {
			assert.equal(
				savedData.recordPosted.username === 'username' &&
				savedData.recordPosted.name === undefined &&
				savedData.recordPosted.profile === undefined,
				true,
			)
		})

		it('should delete record by _ //wip', function() {
			assert.equal(true, true)
		})

		it('should find one record by indexes //wip', function() {
			const users = database.search('users', { name: 'myname' })
			assert.equal(users.length === 1, true)
		})

		it('should not find any record by indexes //wip', function() {
			const users = database.search('users', { name: 'myname1' })
			assert.equal(users.length === 0, true)
		})

		it('should filter records by callback //wip', function() {
			assert.equal(true, true)
		})

		it('should update coupons count after post new user', function() {
			database.transactionsStart()
			const coupon = database.post('coupons', { name: 'coupon1', count: 2 })
			database.transactionsCommit()

			database.transactionsStart()
			database.post('users', { couponName: 'coupon1' })
			database.transactionsCommit()

			database.transactionsStart()
			database.post('users', { couponName: 'coupon1' })
			database.transactionsCommit()

			assert.equal(database.get('coupons', coupon._).countUsed, 2)
		})

		it('should fail because coupons limit exceed', function() {
			const doFail = () => {
				database.transactionsStart()
				database.post('users', { couponName: 'coupon1' })
				database.transactionsCommit()
			}
			assert.throws(doFail, Error, 'im error')
		})

		it('should check that failed transaction did not affect storage', function() {
			const users = database.search('users')
			//const coupons = database.search('coupons')
			//console.table(users)
			//console.table(coupons)
			assert.equal(users.length === 3, true)
		})
	})

	describe('delete', function() {

	})

	describe('search', function() {

	})

	describe('filter', function() {

	})
})