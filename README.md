# jsramverk# SSR Editor

Starter project for DV1677 JSRamverk

1. Added .env file to the root diretory of the project to save the enviroment variables for this project
2. Installed sqlite3
3. Added some sample data into the db
4. Updated the docs.mjs with a function updateOne that updates a row in the database
5. Updated the app.msj with a post route for /:id
6. Debuged, had to parse the req param id as Int and had to add the rowid in the select query for getting a row
7. Added a GET /new route to render the form for creating a new document, and implemented a POST /new route to handle form submission and save the document.

Frontend Framework: React
Why React?
- Component-Based Architecture
- Virtual DOM
- Rich Ecosystem
- Modern JavaScript
- Strong Community
