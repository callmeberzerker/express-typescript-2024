# Tech Test

The technical test will mainly happen via a virtual face-to-face. The various parts of the test are described below; most of which will require work prior to the actual interview.

## Part 1

You’ve asked a junior developer to write some code for a user login endpoint and an endpoint that allows users to see their own data.

Their code is given below. During the tech test, you’ll be asked to do a code review as if speaking to the junior developer who wrote it.

```jsx
const SERVER_PORT = 8080;
const DB_CONNECTION_STRING =
  "postgresql://db_user:2yjUks4xbcy9Er3C@production_db.example.com:5432/juicy_database";
const AUTH_SECRET = "bgM7u94JSxqtQdwp";

const express = require("express");
const knex = require("knex");
const jwt = require("jsonwebtoken");

const app = express();
const db = knex({
  client: "pg",
  connection: DB_CONNECTION_STRING,
  pool: { min: 2, max: 10 },
});

app.post("/login", express.json(), async (req, res) => {
  let { email, password } = req.body.login;

  let user = await db("users").where("email", email).first();

  if (!user) {
    // couldn't find user
    return res.status(404).end();
  }

  if (password !== user.password) {
    // incorrect password given
    return res.status(404).end();
  }

  jwt.sign(
    { user_id: user.id },
    AUTH_SECRET,
    { algorithm: "RS256" },
    function (err, token) {
      res.send(token);
    }
  );
});

app.get("/me", async (req, res) => {
  var authToken = req.get("X-Auth") || "";

  jwt.verify(authToken, AUTH_SECRET, async function (err, decoded) {
    if (err) {
      // incorrect auth token
      return res.status(404).end();
    }

    const user = await db("users").where("id", decoded.user_id).first();

    if (!user) {
      // couldn't find user
      return res.status(404).end();
    }

    res.send(user);
  });
});

// start server:
const server = app.listen(SERVER_PORT, "localhost", () => {
  console.log(`Server now listening on ${SERVER_PORT}`);
});
```

### Part 2

This part of the tech test will involve some coding. You should be familiar with:

- node ([https://nodejs.org/](https://nodejs.org/en/))
- express ([https://expressjs.com/](https://expressjs.com/))

i) Take the following endpoints and add some form of token-based authentication to them (e.g. JWT, or some sort of stateful session token, etc.).

ii) Add a per-user rate-limit to the `/one` endpoint.

You don’t need to send us the code prior to the interview; just have it ready on the day so we can discuss it. We may also do some live coding to add additional features.

```jsx
const SERVER_PORT = 8080;

import express from "express";

const app = express();

app.post("/one", async (req, res) => {
  res.send({ msg: "ok" });
});

app.post("/two", async (req, res) => {
  res.send({ msg: "two" });
});

// start server:
const server = app.listen(SERVER_PORT, "localhost", () => {
  console.log(`Server now listening on ${SERVER_PORT}`);
});
```

### Part 3

You'll be asked to describe SQL joins and transactions, specifically within postgres ([https://www.postgresql.org/](https://www.postgresql.org/)). You don't need to worry about how these work under the hood, just describe how/when/why they're used, and give an example of each.

### Part 4

You'll be asked to give an informal 5 - 10 minute presentation on a tech topic of your choice. Example topics would be:

- describing the code base of an open source project you like, or have worked on
- talking about a personal project you've coded
- explaining how some algorithm works
- describe the infrastructure/architecture of a project or product that you're familiar with

Again, this can be super-informal/very-conversational. No need to prepare slides or anything (unless you think they're needed).
