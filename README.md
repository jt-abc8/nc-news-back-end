# NC News Seeding

## Project Summary
This project is a RESTful API for a Reddit-style application, providing access to a database of articles, comments, users and topics. The link to the hosted version can be found here: [NC News API](https://nc-news-i5we.onrender.com/api)

## Running a local version
To run a local version of this project, follow these steps:

### 1. Clone database
Run the following command in your terminal:

`git clone https://github.com/jt-abc8/nc-news.git`

### 2. Install dependencies
This project uses [Express](https://expressjs.com/), [node-postgres](https://node-postgres.com/), [dotenv](https://github.com/motdotla/dotenv) and [pg-format](https://github.com/datalanche/node-pg-format). 

The dev dependencies used for testing include [Jest](https://jestjs.io/), [SuperTest](https://github.com/ladjs/supertest) and [Husky](https://github.com/typicode/husky). 

Navigate to the project folder in your terminal and then run `npm i` to install them all.

### 3. Create databases
Run the following command in your terminal: 

`npm run setup-dbs` 

This will create test and development databases.

### 4. Create environment variables
Create the following files in order to connect to the sample databases:

- .env.test
- .env.development

In .env.test, include this line:
`PGDATABASE=nc_news_test`

In .env.development, include this line:
`PGDATABASE=nc_news`

### 5. Run tests
You should now be able to run a local version of this project. To run the tests for the available endpoint requests, run the following command in your terminal: 

`npm t app`

## Minimum Versions
The minimum versions of Node.js and PostgreSQL required to run this project are as follows:
- Node.js: v23.4.0
- PostgreSQL: v16.8
