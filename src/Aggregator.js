import './QueryBuilder'

export class Aggregator {

	field = null
	additionalFields = [ ]
	_size = 100
	_include = null
	_exclude = null
	_filter = null

	constructor(field) {
		this.field = field
	}

	addField(field) {
		this.additionalFields.push(field)
		return this
	}

	include(value) {
		this._include = value
		return this
	}

	exclude(value) {
		this._exclude = value
		return this
	}

	filter(callback) {
		const builder = new QueryBuilder
		builder._subQuery = true

		callback(builder)
		this._filter = builder

		return this
	}

	size(value) {
		this._size = value
		return this
	}

	build() {
		let prefix = null

		if(this.field.indexOf('.') >= 0) {
			const lastIndex = this.field.lastIndexOf('.')
			prefix = this.field.substring(0, lastIndex)
		}

		const aggregation = { }

		aggregation.terms = {
			field: this.field
		}

		if(!this._include.isNil) {
			aggregation.terms.includes = this._include
		}

		if(!this._exclude.isNil) {
			aggregation.terms.excludes = this._exclude
		}

		if(!this._size.isNil) {
			aggregation.terms.size = this._size
		}

		if(this.additionalFields.length > 0) {
			aggregation.aggregations = { }

			for(const field of this.additionalFields) {
				aggregation.aggregations[field] = {
					terms: {
						field: field
					}
				}
			}
		}

		if(!this._filter.isNil) {
			aggregation.filter = this._filter.build(prefix)

			const otherAggregations = aggregation.aggregations
			delete aggregation.aggregations

			aggregation.aggregations = { }

			let aggregations = null

			if(prefix.isNil) {
				aggregations = aggregation.aggregations
				aggregation.aggregations = { [this.field]: aggregations }
			} else {
				aggregations = { }
				aggregation.aggregations[this.field] = aggregations
			}

			aggregations.terms = aggregation.terms
			delete aggregation.terms

			if(!otherAggregations.isNil) {
				aggregations.aggregations = otherAggregations
			}
		}

		if(prefix.isNil) {
			return aggregation
		}

		return {
			nested: {
				path: prefix
			},
			aggregations: {
				[this.field]: aggregation
			}
		}
	}

}
