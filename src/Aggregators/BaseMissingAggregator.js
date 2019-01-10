import './BaseAggregator'

export class BaseMissingAggregator extends BaseAggregator {

	_missing = null

	missing(missing) {
		if(missing.isNil) {
			return this._missing
		}

		this._missing = missing
		return this
	}

	buildAggregation() {
		const aggregation = super.buildAggregation()

		if(!this._missing.isNil) {
			aggregation.missing = this._missing
		}

		return aggregation
	}

}
