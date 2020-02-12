const express = require('express');
const PromptServices = require('./prompt-services');

const PromptRouter = express.Router();

PromptRouter
  .get('/', (req, res, next) => {
    PromptServices.getAllPrompts(req.app.get('db'))
      .then(arr => {
        const i = Math.floor(Math.random() * arr.length);
        res.status(200);
        res.send(arr[i]);
      });
  });

module.exports = PromptRouter;