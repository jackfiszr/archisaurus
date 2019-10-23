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
