module.exports = {
  development: {
    username: 'dianerdiana',
    password: 'WDkcUzQ0jms2',
    database: 'neondb',
    host: 'ep-mute-fog-029041.ap-southeast-1.aws.neon.tech',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  test: {
    username: 'postgres',
    password: 23514114,
    database: 'db_dumblink',
    host: 'localhost',
    dialect: 'postgres',
  },
  production: {
    username: 'dianerdiana',
    password: 'WDkcUzQ0jms2',
    database: 'neondb',
    host: 'ep-mute-fog-029041.ap-southeast-1.aws.neon.tech',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
