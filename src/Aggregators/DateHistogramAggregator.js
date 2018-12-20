import './HistogramAggregator'

export class DateHistogramAggregator extends HistogramAggregator {

	type = 'date_histogram'
	_format = null
	_timezone = null
	_offset = null

	format(format) {
		if(format === void 0) {
			return this._format
		}

		this._format = format
		return this
	}

	timezone(timezone) {
		if(timezone === void 0) {
			return this._timezone
		}

		this._timezone = timezone
		return this
	}

	offset(offset) {
		if(offset === void 0) {
			return this._offset
		}

		this._offset = offset
		return this
	}

	buildAggregation() {
		const aggregation = super.buildAggregation()

		if(!this._format.isNil) {
			aggregation.format = this._format
		}

		if(!this._timezone.isNil) {
			aggregation.time_zone = this._timezone
		}

		if(!this._offset.isNil) {
			aggregation.offset = this._offset
		}

		return aggregation
	}

}
