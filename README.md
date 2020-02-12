# digi-doodle --- Built by Sophia Koeut | Michael Weedman | Jonathan Jackson | Austin Tumlinson | Daniel Kent

## About 

Lorem ipsum bla bla bla bla project description stuff here!

## Tech Stack:

FRONT END - 
<br/>
BACK END - 
<br/>
OTHER TOOLS -

## Repo & Live Server Links

[Live Server](url goes here in parentheses)
[Client Repo](url goes here in parentheses)
[Server Repo](url goes here in parentheses)

### Screenshots
![alt text here](screenshot link here and repeat as needed)

### Routes

> /player - method:post - receives a username in a req.body and then writes a new user to the database.  This returns the userID (UUID).
>> request format: { "username":"usernameHere" }
>> response format: { "uuidHere" }

> /game - method:post - writes a new game to database. This returns the game object from database.
>> response format: { "id": uuid(), "canvas":"canvasURL", "current_drawer": null, "current_answer": null, "time_limit": 6000 }