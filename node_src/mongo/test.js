const { Client } = require('@elastic/elasticsearch')
const { ElasticsearchClientError } = require('@elastic/elasticsearch/lib/errors')
const client = new Client({ 
  node: 'http://10.11.2.8:9201',
})

async function run () {
  // Let's search!
  const { body } = await client.search({
    index: 'library',
    // type: '_doc', // uncomment this line if you are using {es} ≤ 6
    body: {
      query: {
        match: { title: 'Wood' }
      }
    }
  })

  console.log(body.hits.hits)
}

run().catch(console.log)
