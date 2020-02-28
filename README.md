# digi-doodle --- Built by Sophia Koeut | Michael Weedman | Jonathan Jackson | Austin Tumlinson | Daniel Kent

## About 

DigiDoodle is an application that uses Canvas and Socket.io to re-create the classic game, Pictionary. A user can sign up with a username and be automatically navigated to an open avaliable game. Users take turns to draw and guess the corresponding prompts on the screen. When the prompt is answered correctly, the drawer is awarded 2 points and the user who guesses correctly receives one point. The first person who reaches 15 points wins the game!

## Tech Stack:

*FRONT END* - 
HTML | CSS | JS | REACT | RESTFUL API | COOKIES | SOCKET.IO | JEST | ENZYME

*BACK END* - 
NODE | EXPRESS | SOCKET.IO | MOCHA | CHAI

## Repo & Live Server Links

[Live App](https://digi-doodle.now.sh/)

[Client Repo](https://github.com/thinkful-ei-iguana/digi-doodle-client)

[Server Repo](https://github.com/thinkful-ei-iguana/digi-doodle-server)

### Notes
Digi-doodle uses websockets as a primary form of data exchange. As such, there are only two traditional endpoints. The game lifecycle states indicate the object passed to the client fron the server for each of the stages of a game.


## Game lifecycle states
1. 'waiting for players'
> ```js
>	{
>		id: 'game uuid',
> 	current_drawer: null,
> 	current_answer: null,
> 	status: 'waiting for players',
> 	winner: null
> }
>```
2. 'standby'
> ```js
>	{
>		id: 'game uuid',
> 	current_drawer: 'drawer uuid', //drawer who is up next
> 	current_answer: null,
> 	status: 'standby',
> 	winner: null
> }
>```
2. 'drawing'
> ```js
>	{
>		id: 'game uuid',
> 	current_drawer: 'drawer uuid',
> 	current_answer: 'current answer',
> 	status: 'standby',
> 	winner: null
> }
>```
2. Game ended
> ```js
>	{
>		id: 'game uuid',
> 	current_drawer: 'drawer uuid',
> 	current_answer: 'current answer',
> 	status: 'standby',
> 	winner: 'winner username'
> }
>```


## /api/player - POST
Receives a username in a req.body and then writes a new user to the database. This returns the userID (UUID).

**Request Format**:
```json
{
	"username": "example-user-name"
}
```
**Success Response**
> Returns only the new user's id.
> **Code** : `200 OK`
> ```json
> "a2ddf32a-9a60-4075-8626-a85928e093af"
> ```

**Error Response**
>If a username is not provided: 
> **Code** : `404 `
> **Body**:
>```json
>{
>	"error": "Request must include a username"
>}
>```

>If a username is already taken: 
> **Code** : `404 `
> **Body**:
>```json
>{
>	"error": "Duplicate usernames are not allowed"
>}
>```

~~____________________________________________________~~

## /api/game/join - POST
Looks at all current games. If there is a game with an empty seat, it places the requesting player in that game and returns the game id. If there are no games with open seats, it will create a new game, place the player in it, and return the game id.

**Request Format**:
> ```json
> {
>   "playerId": "player id here",
>   "username": "username here",
> }
> ```

**Success Response**
> Returns the gameId of the game joined
> **Code** : `200 OK`
> ```json
> {
>   "gameId": "game uuid here",
> }
> ```

**Error Response**
>If user is already in a game
> **Code** : `404 `
> **Body**:
>```json
> {
>   "error": "You are already in a game"
> }
>```
