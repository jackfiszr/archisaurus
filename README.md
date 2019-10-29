# Archivarius

Note
-
This version is published for demo and testing purpose. Wait for the version 1.x before using in production
-

Fast and reliable file based database for microservices
good enough to handle 100+ mln records per collection

  
## Highlights

- synchronous — yep, to much chaos in this world and sometimes we need to get back in sync 
- reliable — you can hard switch off server and this will be fine handled 
- dependency free
- in memory with synchronous persisting to the disk
- high performance
- transactional
- simple as possible 

```javascript
import { Archivarius } from 'archivarius'

const collections = {
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
}
const storageDir = `${__dirname}/../archivarius`

const db = new Archivarius(collections, storageDir)

const userNew = { 
  username: 'john', 
  password: '555555'
}

// every data changing operation should be wrapped in transaction
// option 1 - callback
// this option fill 
db.transactionsStart(() => {
  const user = db.post('users', userNew)
  return () => {
    console.log('you will see me after transaction is committed')
  }
})

// option 2 - direct use, please carefully catch exceptions you will have to rollback transactions manually 
const query = { username: 'john' }
const users = db.search('users', query)

db.transactionsStart()
try {
  users[0].email = 'john@gmail.com'
  db.put('users', users[0])
} catch (e) {
  console.error(e)
  db.transactionsRollback()
}
db.transactionsCommit()

const query = { username: 'john' }
const users = db.search('users', query)

db.delete('users', users[0]._)
```
 
## Best Practice 
 
## Road Map
 - Indexes 
 - Hooks
 - Full test coverage
 
## Changelog

### 0.1.13
- now storage dir will be created if not exists instead of exception

### 0.1.12
- fix: delete method now return {_}

### 0.1.0 
- transactions hooks

### 0.0.9
- documentation updates
- bug fixes
- tests
- development tools improvements

### 0.0.8
 - readme updates and some refactoring 