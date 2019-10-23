import { Database } from './database'

const db = new Database(
	{
		users: [{ name: 'index1', fields: ['username', 'password'] }],
		accounts: ['_'],
		transactions: ['_', '_account'],
	},
	`${__dirname}/../../@local/archivarius`,
)

const timers = {
	empty: 0,
	post: 0,
	put: 0,
}

const act = (count, cb) => {
	const from = Date.now()
	for (let i = 0; i < count; i++) cb.call(null)
	const to = Date.now()
	return to - from
}

const count = 100
//const count = 2
//
//
// timers.post = act(count, () => {
// 	db.transactionsStart()
// 	const user = db.post('users', { username: 'ruslan', 'password': '131313' })
// 	db.transactionsCommit()
// })

console.table(timers)
