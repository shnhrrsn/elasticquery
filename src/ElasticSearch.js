import './QueryBuilder'

const { Client } = require('elasticsearch')
const debug = require('debug')('elasticquery')

export class ElasticSearch {

	client = null
	_config = null

	constructor(config, customConfig) {
		this.client = new Client(config)
		this._config = config
		this._customConfig = customConfig
	}

	get defaultIndex() {
		return this._config.index
	}

	get indices() {
		return this.client.indices
	}

	bulk(...args) {
		const contentType = { 'Content-Type': 'application/x-ndjson' }
		args[0].headers = args[0].headers ? { ...args[0].headers, ...contentType } : contentType

		return this.client.bulk(...args)
	}

	search(...args) {
		args[0].index = args[0].index || this.defaultIndex
		return this.client.search(...args)
	}

	get(...args) {
		args[0].index = args[0].index || this.defaultIndex
		return this.client.get(...args)
	}

	mget(...args) {
		args[0].index = args[0].index || this.defaultIndex
		return this.client.mget(...args)
	}

	query(type, index) {
		return new QueryBuilder(type, index || this.defaultIndex, this)
	}

	createIndex(index) {
		return this.client.indices.create({ index, method: 'PUT' })
	}

	destroyIndex(index) {
		return this.indices.delete({ index })
	}

	async addSettings(index) {
		if(Object.keys(this._customConfig.settings).length === 0) {
			return
		}

		await this.indices.close({ index: index })
		await this.indices.putSettings({ index: index, body: this._customConfig.settings })
		await this.indices.open({ index: index })
	}

	async replaceAlias(alias, index) {
		debug('Checking for existing alias')
		const exists = await this.indices.existsAlias({ name: alias })
		let existingIndex = null

		if(exists) {
			debug('Resolving existing alias')
			existingIndex = await this.indices.getAlias({ name: alias })
			.then(response => Object.keys(response)[0])
		} else {
			debug('... No existing index')
		}

		debug('Optimizing index')
		await this.indices.forcemerge({ index })

		debug('Promoting index')
		await this.indices.putAlias({
			index: index,
			name: alias
		})

		if(existingIndex.isNil) {
			return
		}

		debug('Destroying previous index')
		return this.indices.delete({ index: existingIndex })
	}

}
