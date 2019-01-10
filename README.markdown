<p align="center">
<a href="https://travis-ci.org/shnhrrsn/elasticquery"><img src="https://img.shields.io/travis/shnhrrsn/elasticquery.svg" alt="Build Status"></a>
<a href="https://www.npmjs.com/package/elasticquery"><img src="https://img.shields.io/npm/dt/elasticquery.svg" alt="Total Downloads"></a>
<a href="https://www.npmjs.com/package/elasticquery"><img src="https://img.shields.io/npm/v/elasticquery.svg" alt="Latest Version"></a>
<a href="https://www.npmjs.com/package/elasticquery"><img src="https://img.shields.io/npm/l/elasticquery.svg" alt="License"></a>
</p>

# ElasticQuery

ElasticQuery is an easy to use query builder for the rather verbose ElasticSearch DSL.  It covers a large portion of the ES DSL, but does not currently have full coverage — pull requests welcome!

## Installation

### yarn

```bash
yarn add elasticquery
```

### npm

```bash
npm install --save elasticquery
```

## Documentation

TODO! In the mean time, check out some [examples](#examples) below, the [tests](tests/) and [source code](src/).

## Examples

### Create a Connection

```javascript
const { ElasticSearch } = require('elasticquery')
const search = new ElasticSearch({
  host: 'localhost:9200'
  index: 'locations'
})
```

### Conditions

```javascript
const results = await search.query('doc').where('country', 'US')
```

```javascript
const results = await search.query('doc').whereNot('country', 'US')
```

```javascript
const results = await search.query('doc').whereIn('country', [ 'US', 'CA' ])
```

```javascript
const query = search.query('doc')
query.distance('location', '5mi', '40.782420', '-73.965600')
query.orDistance('location', '10mi', '40.782420', '-73.965600')
```

```javascript
const query = search.query('doc')
query.range('established', '1700', '1800')
```

### Aggregating

```javascript
await search.query('doc').aggregate(agg => agg.terms('field'))
```

```javascript
search.query('doc').aggregate(agg => {
  agg.terms('field', term => {
    term.aggregate(query => {
      query.sum('nested.sum1', sum => sum.as('sum1'))
      query.sum('sum2')
    })
  })
})
```

```javascript
search.query('doc').aggregate(aggregate => {
  aggregate.filter(filter => {
    filter.where('abc', 123)
  })

  aggregate.dateHistogram('field', histogram => {
    histogram.interval('day')
    histogram.timezone('-05:00')
    histogram.bounds({ min: 'now-30d/d', max: 'now/d' })
    histogram.minDocCount(0)
    histogram.size(10)
  })
})
```

## License

`ElasticQuery` was created by [Shaun Harrison](https://github.com/shnhrrsn) and is made available under the [MIT license](LICENSE).
