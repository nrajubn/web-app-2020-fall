#!/usr/bin/env node

// Load environment variables from .env file,
// where API keys and passwords can be configured.
// dotenv.config({ path: '.env.example' })
const dotenv = require('dotenv');
const vars = dotenv.config({ path: '.env' });
if (vars.error) {
  throw vars.error;
}
console.info(process.env.PORT);
console.info(vars.parsed);
console.info('Environment variables loaded.');

const http = require('http');
const db = require('../models/index');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3020');

const app = require('../app');
app.set('port', port);
console.log(`Server Launch at port: ${port}`);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Database functions
async function assertDatabaseConnectionOk() {
  console.log(`Checking database connection...`);
  try {
    await db.authenticate();
    console.log('Database connection OK!');
  } catch (error) {
    console.log('Unable to connect to the database:');
    console.log(error.message);
  }
}

async function dbInit() {

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {

    const connectionString = process.env.DATABASE_URL;
    const { Pool } = require('pg');

    // pools will use environment variables
    // for connection information
    const pool = new Pool({
      connectionString: connectionString,
      ssl: true,
    });

    // the pool will emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err)
      process.exit(-1)
    });

    (async () => {
      const client = await pool.connect()
      try {
        const res = await client.query('SELECT NOW() as now')
        console.log(res.rows[0])
      } finally {
        // Make sure to release the client before any error handling,
        // just in case the error handling itself throws an error.
        client.release()
      }
    })().catch(err => console.log(err.stack))

  }

  await assertDatabaseConnectionOk();
  await seedDatabase();
}

async function seedDatabase() {
  console.log('Initialize database with dummy data.');
  await db.sync({ force: true });
  //console.dir(db.models);

  // Dr. Case - rabbit
  try {
    await db.models.Rabbit.bulkCreate([
      { name: 'Bugs', age: 2, isCartoon: true },
      { name: 'Huggy', age: 2, isCartoon: false },
      { name: 'Doc', age: 2, isCartoon: true },
    ]);
    const numRabbits = await db.models.Rabbit.count();
    console.info(`Seeded ${numRabbits} rabbits.`);
  } catch (err) {
    console.error(`ERROR: Rabbit - ${err.message}`);
  }

  // Dr. Hoot - tea
  await db.models.Tea.bulkCreate([
    { name: 'LongJing', pricePerGram: 4.0, isPuer: false },
    { name: 'YiWu', pricePerGram: 3.5, isPuer: true },
    { name: 'LiShan', pricePerGram: 2.5, isPuer: false },
    { name: 'TiGuanYin', pricePerGram: 0.4, isPuer: false },
  ]);
  const numTeas = await db.models.Tea.count();
  console.info('Seeded ${numTeas} teas .');

  // Blake - game
  try {
    await db.models.Game.bulkCreate([
      { name: 'Uno', playerCount: 6, isCardGame: true },

      { name: 'Sorry', playerCount: 4, isCardGame: false },

      { name: 'Monopoly', playerCount: 4, isCardGame: false },
    ]);
    const numGames = await db.models.Game.count();
    console.info(`Seeded ${numGames} games.`);
  } catch (err) {
    console.error(`ERROR: Game - ${err.message}`);
  }

  // Varsha - animal
  try {
    await db.models.Animal.bulkCreate([
      { name: 'Dog', lifeSpan: 22, isPet: true },
      { name: 'Fox', lifeSpan: 14, isPet: false },
      { name: 'Cat', lifeSpan: 25, isPet: true },
    ]);
    const numAnimals = await db.models.Animal.count();
    console.info(`Seeded ${numAnimals} animals.`);
  } catch (err) {
    console.error(`ERROR: Game - ${err.message}`);
  }
  // Felipe - ?

  // Jack - chief

  // Sreenidhi - plant
  try {
    await db.models.Plant.bulkCreate([
      { name: 'Hibiscus', variety: 1, isPlant: true },
      { name: 'Apple', variety: 1, isPlant: false },
      { name: 'AloeVera', variety: 2, isPlant: true },
    ]);
    const numPlant = await db.models.Plant.count();
    console.info(`Seeded ${numPlant} plant.`);
  } catch (err) {
    console.error(`ERROR: - Plant ${err.message}`);
  }

  // Nithya - series
  await db.models.Series.bulkCreate([
    { name: 'Better Things', seasons: 4, isComedy: true },
    { name: 'Breaking Bad', seasons: 5, isComedy: false },
    { name: 'Money Heist', seasons: 4, isComedy: false },
  ]);
  const numSeries = await db.models.Series.count();
  console.info(`Seeded ${numSeries} seriess.`);

  // Sri Vasavi - food
  await db.models.Food.bulkCreate([
    { name: 'Lamb', pricePerLB: 8, isMeat: true },
    { name: 'Fish', pricePerLB: 4, isMeat: true },
    { name: 'Spinach', pricePerLB: 2, isMeat: false },
  ]);
  const numFood = await db.models.Food.count();
  console.info(`Seeded ${numFood} foods.`);

  // Joseph - software
  try {
    await db.models.Software.bulkCreate([
      { name: 'Linux', firstReleased: 1991, isOpenSource: true },
      { name: 'Tmux', firstReleased: 2007, isOpenSource: true },
      { name: 'Windows', firstReleased: 1985, isOpenSource: false },
    ]);
    const numSoftware = await db.models.Software.count();
    console.info(`Seeded ${numSoftware} softwares`);
  } catch (err) {
    console.error(`ERROR: - Software ${err.message}`);
  }
  // Stephen - whiskey
  try {
    await db.models.Whiskey.bulkCreate([
      { name: 'Laphroaig 10', age: 10, is: true },
      { name: 'Highland Park 12', age: 12, is: true },
      { name: 'Redbreast 12', age: 12, is: false },
    ]);
    const numWhiskey = await db.models.Whiskey.count();
    console.info(`Seeded ${numWhiskey} whiskey.`);
  } catch (err) {
    console.error(`ERROR: - Whiskey ${err.message}`);
  }

  // Shivani - book
  try {
    await db.models.book.bulkCreate([
      { book: 'harrypotter ', publishedDate: 1997, isFantasy: true },
      { book: 'animalfarm ', publishedDate: 1945, isFantasy: false },
      { book: 'hobbit', publishedDate: 1937, isFantasy: true },
    ]);
    const numbook = await db.models.book.count();
    console.info(`Seeded ${numbook} book.`);
  } catch (err) {
    console.error(`ERROR: - Book ${err.message}`);
  }

  // Kunal - videogame
  try {
    await db.models.videogame.bulkCreate([
      { name: 'GTA V', playersNeeded: 1, isReleased: true },
      { name: 'A Way Out', playersNeeded: 2, isReleased: true },
      { name: 'Cyberpunk 2077', playersNeeded: 1, isReleased: false },
    ]);
    const numVideoGame = await db.models.videogame.count();
    console.info(`Seeded ${numVideoGame} video game.`);
  }
  catch (err) {
    console.error(`ERROR: videogame - ${err.message}`)
  }
  // Chandler - company

  // Praneeth - cricket
  await db.models.Cricket.bulkCreate([
    { teamName: 'Indian Team', age: 2, captain: 'Dhoni' },
    { teamName: 'Australian Team', age: 2, captain: 'Smith' },
    { teamName: 'South African Team', age: 2, captain: 'ABD' },
  ]);
  const numCricket = await db.models.Cricket.count();
  console.info(`Seeded ${numCricket} cricket team.`);

  // Zach - fruit
  try {
    await db.models.Fruit.bulkCreate([
      { name: 'Apple', daysGrowth: 150, isRipe: true },
      { name: 'Orange', daysGrowth: 20, isRipe: false },
      { name: 'Pineapple', daysGrowth: 700, isRipe: true },
    ]);
    const numFruit = await db.models.Fruit.count();
    console.info(`Seeded ${numFruit} fruit.`);
  } catch (err) {
    console.error(`ERROR: Fruit - ${err.message}`);
  }

  // Prashansa - dance
  try {
    await db.models.dance.bulkCreate([
      { form: 'Kuchipudi', yearIntro: 1502, isTraditional: True },
      { form: 'Bollywood ', yearIntro: 1960, isTraditional: False },
      { form: 'Bhagra', yearIntro: 1940, isTraditional: True },
    ]);
    const numdance = await db.models.dance.count();
    console.info(`Seeded ${numdance} dance.`);
  } catch (err) {
    console.error(`ERROR: - Dance ${err.message}`);
  }

  // Sam - ship

  // Lindsey - pokemon

  console.log('Done seeding!');
}

/**
 * Event listener for HTTP server "listening" event.
 */
async function onListening() {
  try {
    await dbInit();
  }
  catch (err) {
    console.error(`ERROR with database:${err.message}`);
  }
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}