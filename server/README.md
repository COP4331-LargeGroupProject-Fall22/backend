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

In order to perform any operations on the User Endpoints you will need accessToken related to the specific user on which you are going to call API calls.
You can get accessToken from the client side firebase implementation, which you should have if you want to use API. Firebase docs have information on how you can setup client side
authentication.

Now, when you have client side of the app, you can authenticate/create user and upon successful login you will be able to recieve userCredentials object which looks like this:

![alt](https://i.imgur.com/OcVtK2q.png)

Notice that you can get accessToken from the field defined in the object...

Now, when you try to access any User Endpoint, you have to attach this accessToken to the "Authorization" header in your request.

![alt](https://i.imgur.com/LF497sH.png)


# Endpoints:

User has option to Login or Register. Those operations retrieve/create user object in the MongoDB _id of which is then used in conjunction with accessToken to perform some operations on User.

#### Login endpoint example:

![alt](https://i.imgur.com/nuRFyl9.png)

uid is a unique identifier of the user which is defined in the firebase, _id is a unique identifier of the user which is defined in the MongoDB

#### Register endpoint example:

If user doesn't exist in the MongoDB, you can register user using register endpoint:

![alt](https://i.imgur.com/m0ZpWP6.png)

![alt](https://i.imgur.com/2UXAUbH.png)


#### Authenticated User

Authenticated user has several operations that they can perform.

They can retrieve short summary of all users existing:

![alt](https://i.imgur.com/wUThsjC.png)

They can retrieve information about themselves:

![alt](https://i.imgur.com/KTeq7K6.png)

They can update information about themselves:

![alt](https://i.imgur.com/seuaAiS.png)

They can delete information about themselves:

![alt](https://i.imgur.com/VTvCowi.png)

Note that in order to perform api calls to Update/Delete/Get of User, user must pass their own _id in the URL.



