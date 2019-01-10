export class QueryComponent {

	parent
	_aggregates = [ ]

	constructor(parent = null) {
		this.parent = parent
	}

	aggregate(callback) {
		if(this.isAggregation !== true && !this.parent.isNil && this.parent.isAggregation !== true) {
			throw new Error(`\`aggregate\` may only be called on a top level query, trying to run on ${this.parent.constructor.name}`)
		}

		const { AggregateQuery } = require('./AggregateQuery')
		const aggregate = new AggregateQuery(this)
		callback(aggregate)
		this._aggregates.push(aggregate)

		return this
	}

	build(fieldPrefix) {
		const json = { }

		if(this._aggregates.length > 0) {
			json.aggregations = { }

			for(const aggregate of this._aggregates) {
				Object.assign(json.aggregations, aggregate.build(fieldPrefix))
			}
		}

		return json
	}

}
