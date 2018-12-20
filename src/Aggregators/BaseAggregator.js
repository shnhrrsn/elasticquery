import '../QueryBuilder'

export class BaseAggregator {

	type = null
	field = null
	additionalFields = [ ]
	_size = 100
	_filter = null

	constructor(field) {
		this.field = field
	}

	addField(field) {
		this.additionalFields.push(field)
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
		aggregation[this.type] = this.buildAggregation()

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

			aggregations[this.type] = aggregation[this.type]
			delete aggregation[this.type]

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

	buildAggregation() {
		const aggregation = {
			field: this.field
		}

		if(!this._size.isNil) {
			aggregation.size = this._size
		}

		return aggregation
	}

}
