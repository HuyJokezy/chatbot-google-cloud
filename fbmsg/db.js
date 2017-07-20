// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'chatbot-52601';

// Instantiates a client
const datastore = Datastore({
  keyFilename: 'key.json'
});

// The kind for the new entity
const kind = 'Fbpage';
// The name/ID for the new entity
const name = 'sampletask1';
// The Cloud Datastore key for the new entity
const taskKey = datastore.key([kind, name]);

// Prepares the new entity
const task = {
  key: taskKey,
  data: {
    description: 'Buy milk'
  }
};

var query = datastore.createQuery('Page').filter('ngu', '=', true);
var res = datastore.runQuery(query).then(function (results) {
    const x = results[0];
    // console.log(x);
    // console.log(x);
    console.log('Result:');
    x.forEach((x) => console.log(x.token));
});
// console.log(res);

// var key = datastore.key(['Page',5629499534213120]);
//
// datastore.get(key, function(err, entity) {
//   // entity = The record.
//   // entity[datastore.KEY] = The key for this entity.
//   console.log(err);
//   console.log(entity);
// });
// Saves the entity
// datastore.save(task)
//   .then(() => {
//     console.log(`Saved ${task.key.name}: ${task.data.description}`);
//   })
//   .catch((err) => {
//     console.error('ERROR:', err);
//   });
