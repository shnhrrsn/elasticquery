import './BaseMissingAggregator'

export class HistogramAggregator extends BaseMissingAggregator {

	type = 'histogram'
	_interval = null
	_minDocCount = null
	_bounds = null
	_keyed = null
	_missing = null

	interval(interval) {
		if(interval === void 0) {
			return this._interval
		}

		this._interval = interval
		return this
	}

	minDocCount(count) {
		if(count === void 0) {
			return this._minDocCount
		}

		this._minDocCount = count
		return this
	}

	bounds(bounds) {
		if(bounds.isNil) {
			return this._bounds
		}

		this._bounds = bounds
		return this
	}

	keyed(keyed) {
		if(keyed.isNil) {
			return this._keyed
		}

		this._keyed = keyed
		return this
	}

	missing(missing) {
		if(missing.isNil) {
			return this._missing
		}

		this._missing = missing
		return this
	}

	buildAggregation() {
		const aggregation = super.buildAggregation()

		if(!this._interval.isNil) {
			aggregation.interval = this._interval
		}

		if(!this._minDocCount.isNil) {
			aggregation.min_doc_count = this._minDocCount
		}

		if(!this._bounds.isNil) {
			aggregation.extended_bounds = this._bounds
		}

		if(!this._keyed.isNil) {
			aggregation.keyed = this._keyed
		}

		return aggregation
	}

}
