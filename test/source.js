import test from 'ava'
import '../src/QueryBuilder'

test('include', t => {
	const query = new QueryBuilder
	query.include('abc')
	t.deepEqual(query.toBody(), {
		_source: {
			includes: [ 'abc' ]
		}
	})
})

test('exclude', t => {
	const query = new QueryBuilder
	query.exclude('abc')
	t.deepEqual(query.toBody(), {
		_source: {
			excludes: [ 'abc' ]
		}
	})
})
