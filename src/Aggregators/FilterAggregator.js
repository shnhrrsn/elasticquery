import '../QueryBuilder'

export class FilterAggregator extends QueryBuilder {

	constructor(parent) {
		super()

		this.parent = parent
	}

	build(fieldPrefix) {
		const json = super.build(fieldPrefix)
		json.filter = json.query
		delete json.query

		return json
	}

}
