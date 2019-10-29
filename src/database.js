import fs from 'fs'

// todo implement indexes
// todo implement search cache

const Database = class {
	constructor(collections = {}, storageDir = `${__dirname}/.local`) {
		this.__collections = collections
		this.__storageDir = storageDir

		this.__guidBase = Date.now()

		this.__data = {}
		this.__indexes = {
			values: {},
			_: {},
		}

		this.__transactionsDepth = 0
		this.__transactionsData = {}

		const hookDefault = (database, dataBefore) => (database, dataAfter) => null

		Object.keys(this.__collections).forEach(collection => {
			const collectionDescription = {
				...{
					onPost: hookDefault,
					onPut: hookDefault,
					onPatch: hookDefault,
					onDelete: hookDefault,
				},
				...this.__collections[collection],
			}
			this.__collections[collection] = collectionDescription
			this.__data[collection] = {}
		})

		this.__restore()

		process.on('exit', code => {
			console.log('exiting with code and shutting down database', code)
			this.__shutdown()
		})

		// catches ctrl+c event
		process.on('SIGINT', e => {
			console.log('SIGINT', e)
			process.exit()
		})

		// catches "kill pid" (for example: nodemon restart)
		process.on('SIGUSR1', e => {
			console.log('SIGUSR1', e)
			process.exit()
		})

		process.on('SIGUSR2', e => {
			console.log('SIGUSR2', e)
			process.exit()
		})

		// catches uncaught exceptions
		process.on('uncaughtException', e => {
			console.log('uncaughtException', e)
			process.exit()
		})
	}

	transactionsStart(callback) {
		this.__transactionsDepth++
		if (callback) {
			try {
				const afterCommit = callback(this, this.__transactionsDepth)
				this.transactionsCommit()
				afterCommit && afterCommit()
			} catch (e) {
				console.error(e)
				this.transactionsRollback()
				throw new Error(e)
			}
		}
	}

	transactionsCommit() {
		this.__transactionsDepth > 0 && (this.__transactionsDepth--)

		if (this.__transactionsDepth === 0) {
			Object.values(this.__transactionsData).forEach(c => {
				c.delete === true
					? delete this.__data[c.collection][c.record._]
					: this.__data[c.collection][c.record._] = c.record
				this.__updateIndexes(c)
			})

			const date = new Date().toISOString().split('T')[0]
			const transactionsFileName = `${this.__storageDir}/transactions/${date}.txt`
			fs.appendFileSync(
				transactionsFileName,
				JSON.stringify(this.__transactionsData) + '\n'
			)
			this.__transactionsData = {}
		}
	}

	transactionsRollback() {
		this.__transactionsData = {}
		this.__transactionsDepth = 0
	}

	post(collection, record = {}) {
		if (this.__transactionsDepth === 0) {
			throw new Error(`start transaction before doing post`)
		}

		if (!this.__collections[collection]) {
			throw new Error(`collection ${collection} not exists`)
		}

		record._ = this.__getNextGuid()

		const doAfter = this.__collections[collection].onPost(this, record)
		this.__transactionsData[record._] = { collection, record }
		doAfter && doAfter(this, { ...record })

		return record
	}

	put(collection, record) {
		if (this.__transactionsDepth === 0) {
			throw new Error(`start transaction before doing put`)
		}
		const doAfter = this.__collections[collection].onPut(this, record)
		this.__transactionsData[record._] = { collection, record }
		doAfter && doAfter(this, { ...record })

		return this.__transactionsData[record._].record
	}

	patch(collection, record) {
		if (this.__transactionsDepth === 0) {
			throw new Error(`start transaction before doing patch`)
		}
		const recordInData = this.__data[collection][record._]
		const recordInTransaction = this.__data[collection][record._]

		const recordPatch = {
			...this.__data[collection][record._],
			...(this.__transactionsData[record._] || {}),
			...record,
		}
		const doAfter = this.__collections[collection].onPut(this, record)
		this.__transactionsData[record._] = { collection, record: recordPatch }
		doAfter && doAfter(this, { ...recordPatch })

		return this.__transactionsData[record._].record
	}

	get(collection, _) {
		if (!this.__data[collection]) {
			throw new Error(`collection not exists`)
		}

		if (!this.__data[collection][_]) {
			throw new Error(`record not found`)
		}

		return { ...this.__data[collection][_] }
	}

	delete(collection, _) {
		if (this.__transactionsDepth === 0) {
			throw new Error(`start transaction before doing delete`)
		}
		this.__transactionsData[_] = { collection, record: { _ }, delete: true }

		return this.__transactionsData[record._].record
	}


	filter(collection, filter = () => true) {
		return Object.values(this.__data[collection]).filter(filter)
	}

	search(collection, query = {}) {
		const keys = Object.keys(query)
		const values = Object.values(this.__data[collection]).filter(
			i => keys.reduce((a, c) => a && i[c] === query[c], true),
		)
		return values
	}

	__restore() {
		const collectionsFileName = `${this.__storageDir}/collections/index.json`
		const indexesFileName = `${this.__storageDir}/indexes/index.json`

		if (!fs.existsSync(this.__storageDir)) {
			fs.mkdirSync(`${this.__storageDir}`)
		}

		if (!fs.existsSync(`${this.__storageDir}/collections`)) {
			fs.mkdirSync(`${this.__storageDir}/collections`)
			fs.writeFileSync(collectionsFileName, '{}', { encoding: 'utf8' })
		}

		if (!fs.existsSync(`${this.__storageDir}/indexes`)) {
			fs.mkdirSync(`${this.__storageDir}/indexes`)
			fs.writeFileSync(indexesFileName, '{}', { encoding: 'utf8' })
		}

		if (!fs.existsSync(`${this.__storageDir}/transactions`)) {
			fs.mkdirSync(`${this.__storageDir}/transactions`)
		}

		const collectionsContent = fs.readFileSync(collectionsFileName, { encoding: 'utf8' })
		const collectionsData = JSON.parse(collectionsContent)

		const indexesContent = fs.readFileSync(indexesFileName, { encoding: 'utf8' })
		const indexesData = JSON.parse(indexesContent)

		Object.assign(this.__data, collectionsData)
		Object.assign(this.__indexes, indexesData)
	}

	__shutdown() {
		const collectionsFileName = `${this.__storageDir}/collections/index.json`
		const indexesFileName = `${this.__storageDir}/indexes/index.json`

		fs.writeFileSync(collectionsFileName, JSON.stringify(this.__data), { encoding: 'utf8' })
		fs.writeFileSync(indexesFileName, JSON.stringify(this.__indexes), { encoding: 'utf8' })
	}

	__updateIndexes(commit) {
		//console.warn('__updateIndexes not implemented ')
	}

	__getNextGuid() {
		return this.__guidBase++
	}
}

export { Database }