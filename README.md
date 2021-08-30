# auth-api

Heroku server at: https://dwhitmore-auth-prod.herokuapp.com/

## Endpoints:

Auth Endpoints:
- POST /signup: parameters of username and password. Creates a user with an encrypted password and attaches a token to the user.
- POST /signin: parameters of username and password. Use the same username and password to access you user profile and generate a new token.

Resource Endpoints:

Food: request body needs a name (string), calories(number), and type('fruit', 'vegetable', 'protein').
- POST /food: parameters 
- GET /food
- GET /food/:id
- PUT /food/:id
- DELETE /food/:id

Clothes: request body needs a name(string), color(string), size(string).
- POST /clothes
- GET /clothes
- GET /clothes/:id
- PUT /clothes/:id
- DELETE /clothes/:id


## ACL
Users: GET routes

Writer: GET and POST routes

Editors: GET, POST, PUT routes

Admin: All routes



