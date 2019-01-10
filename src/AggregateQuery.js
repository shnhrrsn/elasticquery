import './QueryComponent'

import './Aggregators/AverageAggregator'
import './Aggregators/CountAggregator'
import './Aggregators/DateHistogramAggregator'
import './Aggregators/FilterAggregator'
import './Aggregators/HistogramAggregator'
import './Aggregators/MaxAggregator'
import './Aggregators/MinAggregator'
import './Aggregators/SumAggregator'
import './Aggregators/TermsAggregator'

export class AggregateQuery extends QueryComponent {

	isAggregation = true
	_aggregators = [ ]
	_implicitName = null
	_explicitName = null
	_filter = null

	get name() {
		if(typeof this._explicitName === 'string') {
			return this._explicitName
		}

		if(!this._filter.isNil) {
			if(this._aggregators.length > 0) {
				return this._aggregators[0].name
			} else if(this._aggregates.length > 0) {
				return this._aggregates[0].name
			}
		}

		return this._implicitName || 'agg'
	}

	as(name) {
		this._explicitName = name
		return this
	}

	terms(field, callback) {
		return this._aggregate(TermsAggregator, field, callback)
	}

	histogram(field, callback) {
		return this._aggregate(HistogramAggregator, field, callback)
	}

	dateHistogram(field, callback) {
		return this._aggregate(DateHistogramAggregator, field, callback)
	}

	average(field, callback) {
		return this._aggregate(AverageAggregator, field, callback)
	}

	count(field, callback) {
		return this._aggregate(CountAggregator, field, callback)
	}

	min(field, callback) {
		return this._aggregate(MinAggregator, field, callback)
	}

	max(field, callback) {
		return this._aggregate(MaxAggregator, field, callback)
	}

	sum(field, callback) {
		return this._aggregate(SumAggregator, field, callback)
	}

	filter(callback) {
		if(!this._filter.isNil) {
			throw new Error('An aggregation may only contain one filter.')
		}

		this._filter = new FilterAggregator(this)
		callback(this._filter)

		return this
	}

	_aggregate(aggregatorType, field, callback) {
		if(this._implicitName.isNil) {
			this._implicitName = field
		}

		const aggregator = new aggregatorType(field, this)
		if(typeof callback === 'function') {
			callback(aggregator)
		}

		this._aggregators.push(aggregator)

		return this
	}

	build(fieldPrefix) {
		let json = super.build(fieldPrefix)
		let target = json

		if(!this._filter.isNil) {
			const filter = this._filter.build(fieldPrefix)
			Object.assign(json, filter)

			if(this._aggregators.length > 0) {
				if(json.aggregations.isNil) {
					json.aggregations = { }
				}

				target = json.aggregations
			}

			json = { [this.name]: json }
		}

		for(const aggregator of this._aggregators) {
			const aggregation = aggregator.build(fieldPrefix)

			if(aggregator.name.isNil) {
				Object.assign(target, aggregator.build(fieldPrefix))
			} else {
				target[aggregator.name] = aggregation
			}
		}

		return json
	}

}
