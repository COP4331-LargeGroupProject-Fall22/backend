# API setup:

## Mongo Database setup:

- Create MongoDB account.

- Create Database cluster.

- Create User collection.

- In the "Database Deployments" overview, press on "Connect".

![alt](https://i.imgur.com/A0Dwk6F.png)

- In the popup press on "Connect your application" and then you will be greeted with the screen which will have connection string defined for you:

![alt](https://i.imgur.com/uUSSwMD.png)

In the above example, "user" is username who has an access to your database cluster, and password is theirs password.

- To register new user who will have an access to the cluster (admin user because), go to the "Database Access" and press on "Add new database user".

![alt](https://i.imgur.com/x6CyUzw.png)

Save password of that user and their username, you will use it in your connection string.

- Finally, in "Network Access" change IP address to 0.0.0.0 to make your Database accessible by any IP (anyone who has connection string with correct user credentials you defined in previous step).

![alt](https://i.imgur.com/A4a8mbQ.png)

- In the project folder, create ".env" file and fill it with your information. Example is here:

![alt](https://i.imgur.com/msHT5eu.png)

Environment variable names should be the same, the only parts that change are values.

## Environment Variables:

Aside from environment variables for MongoDB we also utilize several other variables that should be initialized in .env file.

`PORT` should be defined with a port number for the server
`NODE_ENV` if `dev` is assigned, server will use `LOCAL_MONGODB_CONNECTION_STRING`, otherwise 
`MONGODB_CONNECTION_STRING` is chosen for database connection.

`MONGODB_CONNECTION_STRING` defines connection string to the MongoDB account
`LOCAL_MONGODB_CONNECTION_STRING` defines connection string to the local MongoDB account

`PRIVATE_KEY_FOR_USER_TOKEN` shoud be defined with the random string that will act as unique private key for bcrypt encryption

`SPOONACULAR_API_KEY` should be defined with a key to spoonacular api

`SPOONACULAR_HOST="spoonacular-recipe-food-nutrition-v1.p.rapidapi.com"`

`SPOONACULAR_INGREDIENTS_BASE_URL="https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients"`
`SPOONACULAR_GROCERY_PRODUCT_BASE_URL="https://api.spoonacular.com/food/products"`

`SPOONACULAR_RECIPE_BASE_URL="https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes"`

## Run Server:

To run server install latest npm and run `npm install`. All required packages will be installed automatically. Now, go to the project directory and run `npm start`.

## Testing:

To run tests use `npm run test` or `npm test`.

## User Endpoints:

https://app.swaggerhub.com/apis/mplekunov/Smart-Chef-API/1.0.0


# DataModels Used:

![alt](https://i.imgur.com/ekM6S8C.png)