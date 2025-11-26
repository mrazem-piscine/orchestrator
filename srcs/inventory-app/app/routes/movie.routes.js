module.exports = app => {
  const movies = require("../controllers/movie.controller.js");
  const router = require("express").Router();

  // Express router that handles CRUD operations
  // rest endpoints: 
  router.post("/", movies.create); // create
  router.get("/", movies.findAll); // read
  router.get("/:id", movies.findOne); // read
  router.put("/:id", movies.update); // update
  router.delete("/:id", movies.delete); // delete
  router.delete("/", movies.deleteAll);

  app.use("/api/movies", router);
};
