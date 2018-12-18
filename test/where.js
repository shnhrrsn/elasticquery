import test from 'ava'
import '../src/QueryBuilder'

test('simple where', t => {
	const query = new QueryBuilder
	query.where('abc', 'def')
	t.deepEqual(query.toBody(), {
		_source: { },
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
