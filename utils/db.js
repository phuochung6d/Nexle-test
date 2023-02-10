import knex from 'knex';

const builder = knex({
  client: 'mysql',
  connection: {
    host: '178.128.109.9',
    user: 'test01',
    password: 'PlsDoNotShareThePass123@',
    database: 'entrance_test'
  },
  pool: {
    min: 0,
    max: 5
  }
});

export default builder;