/* eslint-disable max-lines */
import './Aggregator'

const debug = require('debug')('elasticquery')

export class QueryBuilder {

	_must = [ ]
	_mustNot = [ ]
	_should = [ ]
	_aggregators = [ ]
	_sort = null
	_from = null
	_size = null
	_include = [ ]
	_exclude = [ ]
	_inner = false

	_type = null
	_index = null
	_search = null
	_subQuery = false

	constructor(type, index, search) {
		this._type = type
		this._index = index
		this._search = search
	}

	from(value) {
		this._from = value
		return this
	}

	size(value) {
		this._size = value
		return this
	}

	include(...fields) {
		if(Array.isArray(fields[0])) {
			this._include.push(...fields[0])
		} else {
			this._include.push(...fields)
		}

		return this
	}

	exclude(...fields) {
		if(Array.isArray(fields[0])) {
			this._exclude.push(...fields[0])
		} else {
			this._exclude.push(...fields)
		}

		return this
	}

	sort(field, desc, filter) {
		if(!Array.isArray(this._sort)) {
			this._sort = [ ]
		}

		desc = desc === true || desc === 'desc' || desc === 'DESC'

		if(typeof field === 'string') {
			if(typeof filter === 'function') {
				const builder = new QueryBuilder
				builder._subQuery = true
				filter(builder)

				const nestedPath = field.indexOf('.') === -1 ? void 0 : field.split(/\./)[0]

				field = [
					{
						[field]: {
							order: desc ? 'desc' : 'asc',
							// mode: desc ? 'max' : 'min',
							nested_path: nestedPath,
							nested_filter: builder.build()
						}
					}
				]
			} else {
				field = [ { [field]: desc ? 'desc' : 'asc' } ]
			}
		} else if(!Array.isArray(field)) {
			field = [ field ]
		}

		for(const f of field) {
			for(const key of Object.keys(f)) {
				let value = f[key]

				if(typeof value !== 'object') {
					value = {
						order: value === true || value === 'desc' || value === 'DESC' ? 'desc' : 'asc'
					}
				}

				this._sort.push({ [key]: value })
			}
		}
	}

	matchPhrase(field, value, options = { }) {
		return this._matchPhrase(field, value, '_must', options)
	}

	orMatchPhrase(field, value, options = { }) {
		return this._matchPhrase(field, value, '_should', options)
	}

	_matchPhrase(field, value, type, options = { }) {
		this[type].push({
			type: 'match_phrase',
			field: field,
			value: value,
			...options
		})
	}

	matchPhrasePrefix(field, value, options = { }) {
		return this._matchPhrasePrefix(field, value, '_must', options)
	}

	orMatchPhrasePrefix(field, value, options = { }) {
		return this._matchPhrasePrefix(field, value, '_should', options)
	}

	_matchPhrasePrefix(field, value, type, options = { }) {
		this[type].push({
			type: 'match_phrase_prefix',
			field: field,
			value: value,
			...options
		})
	}

	where(...args) {
		return this._where(args, '_must')
	}

	whereIn(field, values) {
		this._must.push({
			type: 'terms',
			field: field,
			value: values
		})
	}

	whereInLegacy(field, values) {
		return this.where(builder => {
			for(const value of values) {
				builder.orWhere(field, value)
			}
		})
	}

	whereAll(values, ...args) {
		for(const value of values) {
			this.where(...args, value)
		}

		return this
	}

	whereNot(...args) {
		return this._where(args, '_mustNot')
	}

	orWhere(...args) {
		return this._where(args, '_should')
	}

	whereWildcard(...args) {
		return this.where('wildcard', ...args)
	}

	whereNotWildcard(...args) {
		return this.whereNot('wildcard', ...args)
	}

	orWhereWildcard(...args) {
		return this.orWhere('wildcard', ...args)
	}

	_where(args, type) {
		if(typeof args[0] === 'function') {
			const builder = new QueryBuilder
			builder._subQuery = true

			args[0](builder, ...args.slice(1))
			this[type].push({
				type: 'sub',
				builder: builder
			})
		} else if(args.length === 2) {
			this[type].push({
				type: 'term',
				field: args[0],
				value: args[1]
			})
		} else if(args.length === 3) {
			this[type].push({
				type: args[0],
				field: args[1],
				value: args[2]
			})
		} else {
			throw new Error(`Invalid arguments: ${args}`)
		}

		return this
	}

	nested(field, callback) {
		const builder = new QueryBuilder
		builder._subQuery = true

		callback(builder)

		this._must.push({
			type: 'nested',
			field: field,
			builder: builder
		})

		return this
	}

	inner(value = true) {
		this._inner = value
		return this
	}

	whereMatch(field, value, operator, minimumMatch) {
		return this._whereMatch(field, value, operator, minimumMatch, '_must')
	}

	whereNotMatch(field, value, operator, minimumMatch) {
		return this._whereMatch(field, value, operator, minimumMatch, '_mustNot')
	}

	orWhereMatch(field, value, operator, minimumMatch) {
		return this._whereMatch(field, value, operator, minimumMatch, '_should')
	}

	_whereMatch(field, value, operator, minimumMatch, type) {
		this[type].push({
			type: 'match',
			field: field,
			value: value,
			operator: operator,
			minimumMatch: minimumMatch
		})

		return this
	}

	whereNull(field) {
		return this._whereNull(field, '_mustNot')
	}

	whereNotNull(field) {
		return this._whereNull(field, '_must')
	}

	orWhereNotNull(field) {
		return this._whereNull(field, '_should')
	}

	_whereNull(field, type) {
		this[type].push({
			type: 'exists',
			field: field,
		})
	}

	range(field, min, max) {
		return this._range(field, min, max, '_must')
	}

	notRange(field, min, max) {
		return this._range(field, min, max, '_mustNot')
	}

	orRange(field, min, max) {
		return this._range(field, min, max, '_should')
	}

	_range(field, min, max, type) {
		this[type].push({
			type: 'range',
			field: field,
			min: min,
			max: max
		})

		return this
	}

	distance(field, distance, lat, lon) {
		return this._distance(field, distance, lat, lon, '_must')
	}

	orDistance(field, distance, lat, lon) {
		return this._distance(field, distance, lat, lon, '_should')
	}

	_distance(field, distance, lat, lon, type) {
		this[type].push({
			type: 'distance',
			field: field,
			distance: distance,
			lat: lat,
			lon: lon
		})

		return this
	}

	aggregate(field, callback) {
		if(this._subQuery) {
			throw new Error('`aggregate` may only be called on a top level query.')
		}

		const aggregator = new Aggregator(field)
		callback(aggregator)
		this._aggregators.push(aggregator)

		return this
	}

	build(fieldPrefix) {
		const query = { bool: { } }

		if(this._must.length > 0) {
			query.bool.must = this.buildConditions(fieldPrefix, this._must)
		}

		if(this._mustNot.length > 0) {
			query.bool.must_not = this.buildConditions(fieldPrefix, this._mustNot)
		}

		if(this._should.length > 0) {
			query.bool.should = this.buildConditions(fieldPrefix, this._should)
		}

		for(const key of [ 'must', 'must_not', 'should' ]) {
			if(query.bool[key].isNil || query.bool[key].length !== 1) {
				continue
			}

			query.bool[key] = query.bool[key][0]
		}

		if(Object.keys(query.bool).length === 0) {
			return { }
		}

		return query
	}

	buildConditions(fieldPrefix, conditions) {
		let prefix = fieldPrefix || ''

		if(prefix.length > 0) {
			prefix += '.'
		}

		return conditions.map(condition => {
			if(condition.type === 'range') {
				const range = { }

				if(!condition.min.isNil) {
					range.gte = condition.min
				}

				if(!condition.max.isNil) {
					range.lte = condition.max
				}

				return {
					range: {
						[`${prefix}${condition.field}`]: range
					}
				}
			} else if(condition.type === 'term' || condition.type === 'terms') {
				return {
					[condition.type]: {
						[`${prefix}${condition.field}`]: condition.value
					}
				}
			} else if(condition.type === 'exists') {
				return {
					exists: {
						field: `${prefix}${condition.field}`
					}
				}
			} else if(condition.type === 'wildcard') {
				return {
					wildcard: {
						[`${prefix}${condition.field}`]: condition.value
					}
				}
			} else if(condition.type === 'match') {
				const match = {
					query: condition.value
				}

				if(!condition.operator.isNil) {
					match.operator = condition.operator
				}

				if(!condition.minimumMatch.isNil) {
					match.minimum_should_match = condition.minimumMatch
				}

				return {
					match: {
						[`${prefix}${condition.field}`]: match
					}
				}
			} else if(condition.type === 'match_phrase') {
				return {
					match_phrase: {
						[`${prefix}${condition.field}`]: {
							query: condition.value,
							slop: (condition.slop || 0)
						}
					}
				}
			} else if(condition.type === 'match_phrase_prefix') {
				return {
					match_phrase_prefix: {
						[`${prefix}${condition.field}`]: {
							query: condition.value,
							slop: (condition.slop || 0),
							max_expansions: (condition.max_expansions || 50)
						}
					}
				}
			} else if(condition.type === 'sub') {
				return condition.builder.build(fieldPrefix)
			} else if(condition.type === 'nested') {
				return {
					nested: {
						path: condition.field,
						query: condition.builder.build(`${prefix}${condition.field}`),
						inner_hits: condition.builder._inner ? { } : void 0
					}
				}
			} else if(condition.type === 'distance') {
				return {
					geo_distance: {
						distance: condition.distance,
						[`${prefix}${condition.field}`]: {
							lat: condition.lat,
							lon: condition.lon
						}
					}
				}
			}

			throw new Error(`Unsupported condition: ${JSON.stringify(condition)}`)
		})
	}

	toString() {
		return this.toBody()
	}

	toBody() {
		const body = { query: this.build(), _source: { } }

		if(body.query === null || Object.keys(body.query).length === 0) {
			delete body.query
		}

		if(this._from !== null) {
			body.from = this._from
		}

		if(this._size !== null) {
			body.size = this._size
		}

		if(this._include.length > 0) {
			body._source.includes = this._include
		}

		if(this._exclude.length > 0) {
			body._source.excludes = this._exclude
		}

		if(Array.isArray(this._sort)) {
			body.sort = this._sort[0]
		}

		if(this._aggregators.length > 0) {
			body.aggregations = { }

			for(const aggregator of this._aggregators) {
				body.aggregations[aggregator.field] = aggregator.build()
			}
		}

		return body
	}

	then(...args) {
		try {
			if(this._search.isNil) {
				throw new Error('This query builder is not registered.')
			}

			const body = this._buildBody()

			debug('Executing search', JSON.stringify(body.body, null, ' '))

			return this._search.search(body).then(...args)
		} catch(err) {
			return Promise.reject(err)
		}
	}

	catch(...args) { return this.then().catch(...args) }
	finally(...args) { return this.then().finally(...args) }

	scroll(callback) {
		if(this._search.isNil) {
			throw new Error('This query builder is not registered.')
		}

		const body = this._buildBody()
		body.scroll = '30s'
		body.sort = body.sort || [ '_doc' ]

		debug('Executing search', JSON.stringify(body.body, null, ' '))

		let processed = 0
		let processScroll = null

		const search = this._search

		processScroll = response => {
			processed += response.hits.hits.length

			return Promise.resolve(callback(response)).then(() => {
				if(processed === response.hits.total) {
					return
				}

				return search.client.scroll({
					scrollId: response._scroll_id,
					scroll: '30s'
				}).then(processScroll)
			})
		}

		return search.search(body).then(processScroll)
	}

	destroy() {
		const ids = [ ]

		return this.scroll(result => {
			ids.push(...result.hits.hits.map(hit => hit._id))
		}).then(() => {
			if(ids.length === 0) {
				return
			}

			return this._search.bulk({
				body: ids.map(id => ({
					delete: {
						_index: this._index,
						_type: this._type,
						_id: id
					}
				}))
			})
		})
	}

	_buildBody() {
		const body = { body: this.toBody() }

		if(!this._type.isNil) {
			body.type = this._type
		}

		if(!this._index.isNil) {
			body.index = this._index
		}

		return body
	}

}
