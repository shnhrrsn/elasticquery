import '../QueryComponent'

export class BaseAggregator extends QueryComponent {

	type = null
	field = null
	isAggregation = true
	_size = null
	_explicitName = null

	constructor(field, parent) {
		super()

		this.field = field
		this.parent = parent
	}

	get name() {
		return this._explicitName || this.field
	}

	as(name) {
		this._explicitName = name
		return this
	}

	size(value) {
		this._size = value
		return this
	}

	build(fieldPrefix) {
		const aggregation = super.build(fieldPrefix)
		aggregation[this.type] = this.buildAggregation()

		return aggregation
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
