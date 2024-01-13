# AutoMailer

Assignment for Backend intern position in OpeninApp

<!-- Installation Process -->

## To Run

1. Add google application credentials to the .env

2. Change redis credentials and password in redis.js

3. Run `yarn install` or `npm install`

4. To run in dev environment:
   Run `nodemon index.js` or `yarn dev-start` or `npm run dev-start`
   To run in Production environment:
   Run `node index.js` or `yarn start` or `npm run start`

### Difficulties:

1. Handling web requests while continuosly checking for emails in gmail account

2. Handling checking for mails in multiple gmail account at the same time

### Possible Improvements:

1. Get emails from redis whenever it is added in it and restart the function with it

2. Error handling
