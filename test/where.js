import test from 'ava'
import '../src/QueryBuilder'

test('simple where', t => {
	const query = new QueryBuilder
	query.where('abc', 'def')
	t.deepEqual(query.toBody(), {
		query: {
			bool: {
				must: {
					term: {
						abc: 'def'
					}
				}
			}
		}
	})
})

test('nested whereIn + range', t => {
	const query = new QueryBuilder
	query.where(query => {
		query.whereIn('abc', [ 'def', 'ghi' ])
	})

	query.range('date', 'now-60d/d', 'now-30d/d')

	t.deepEqual(query.toBody(), {
		query: {
			bool: {
				must: [
					{
						bool: {
							must: {
								terms: {
									abc: [ 'def', 'ghi' ]
								}
							}
						}
					},
					{
						range: {
							date: {
								gte: 'now-60d/d',
								lte: 'now-30d/d'
							}
						}
					}
				]
			}
		}
	})
})
