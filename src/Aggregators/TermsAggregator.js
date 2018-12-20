import './BaseAggregator'

export class TermsAggregator extends BaseAggregator {

	type = 'terms'
	_include = null
	_exclude = null

	include(value) {
		this._include = value
		return this
	}

	exclude(value) {
		this._exclude = value
		return this
	}

	buildAggregation() {
		const aggregation = super.buildAggregation()

		if(!this._include.isNil) {
			aggregation.includes = this._include
		}

		if(!this._exclude.isNil) {
			aggregation.excludes = this._exclude
		}

		return aggregation
	}

}
