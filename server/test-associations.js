const db = require('./dist/src/models').default;

console.log('Checking associations...');
console.log('Game associations:', Object.keys(db.Game.associations || {}));
console.log('Genre associations:', Object.keys(db.Genre.associations || {}));
console.log('Company associations:', Object.keys(db.Company.associations || {}));

// Test if associate function exists
console.log('Game.associate exists?', typeof db.Game.associate === 'function');
console.log('Genre.associate exists?', typeof db.Genre.associate === 'function');

// Try to manually call associations
if (typeof db.Game.associate === 'function') {
  console.log('Calling Game.associate...');
  db.Game.associate(db);
  console.log('Game associations after:', Object.keys(db.Game.associations || {}));
}

process.exit(0);