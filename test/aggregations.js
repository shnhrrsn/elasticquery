import test from 'ava'
import '../src/QueryBuilder'

test('terms', t => {
	const query = new QueryBuilder
	query.aggregate(aggregate => {
		aggregate.terms('field', field => field.size(10))
	})

	t.deepEqual(query.toBody(), {
		_source: { },
		aggregations: {
			field: {
				terms: {
					field: 'field',
					size: 10,
				}
			}
		}
	})
})

test('terms + filter', t => {
	const query = new QueryBuilder
	query.aggregate(aggregate => {
		aggregate.filter(filter => filter.where('abc', 123))
		aggregate.terms('field', field => field.size(10))
	})

	t.deepEqual(query.toBody(), {
		_source: { },
		aggregations: {
			field: {
				filter: {
					bool: {
						must: {
							term: {
								abc: 123
							}
						}
					}
				},
				aggregations: {
					field: {
						terms: {
							field: 'field',
							size: 10,
						}
					}
				}
			}
		}
	})
})

test('terms + sums', t => {
	const query = new QueryBuilder
	query.aggregate(query => {
		query.terms('field', query => {
			query.aggregate(query => {
				query.sum('nested.sum1', query => query.as('sum1'))
				query.sum('sum2')
			})
		})
	})

	t.deepEqual(query.toBody(), {
		_source: {},
		aggregations: {
			field: {
				aggregations: {
					sum1: {
						sum: {
							field: 'nested.sum1'
						}
					},
					sum2: {
						sum: {
							field: 'sum2'
						}
					}
				},
				terms: {
					field: 'field',
					size: 100
				}
			}
		}
	})
})

test('date histogram', t => {
	const query = new QueryBuilder
	query.aggregate(aggregate => {
		aggregate.dateHistogram('field', histogram => {
			histogram.interval('day')
			histogram.timezone('-05:00')
			histogram.bounds({ min: 'now-30d/d', max: 'now/d' })
			histogram.minDocCount(0)
			histogram.size(10)
		})
	})

	t.deepEqual(query.toBody(), {
		_source: { },
		aggregations: {
			field: {
				date_histogram: {
					field: 'field',
					interval: 'day',
					time_zone: '-05:00',
					min_doc_count: 0,
					extended_bounds: {
						min: 'now-30d/d',
						max: 'now/d'
					},
					size: 10
				}
			}
		}
	})
})

test('date histogram + filter', t => {
	const query = new QueryBuilder
	query.aggregate(aggregate => {
		aggregate.filter(filter => {
			filter.where('abc', 123)
		})

		aggregate.dateHistogram('field', histogram => {
			histogram.interval('day')
			histogram.timezone('-05:00')
			histogram.bounds({ min: 'now-30d/d', max: 'now/d' })
			histogram.minDocCount(0)
			histogram.size(10)
		})
	})

	t.deepEqual(query.toBody(), {
		_source: { },
		aggregations: {
			field: {
				filter: {
					bool: {
						must: {
							term: {
								abc: 123
							}
						}
					}
				},
				aggregations: {
					field: {
						date_histogram: {
							field: 'field',
							interval: 'day',
							time_zone: '-05:00',
							min_doc_count: 0,
							extended_bounds: {
								min: 'now-30d/d',
								max: 'now/d'
							},
							size: 10
						}
					}
				}
			}
		}
	})
})
