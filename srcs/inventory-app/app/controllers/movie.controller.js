const db = require("../models");
const Movie = db.movies;

// Create and Save a new Movie
exports.create = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).send(movie);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Read / Retrieve all Movies
exports.findAll = async (req, res) => {
  const title = req.query.title;
  const condition = title ? { title: { [db.Sequelize.Op.iLike]: `%${title}%` } } : null;

  try {
    const data = await Movie.findAll({ where: condition });
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Find a single Movie by id
exports.findOne = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);
    if (movie) res.send(movie);
    else res.status(404).send({ message: "Movie not found" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Update a Movie by id
exports.update = async (req, res) => {
  try {
    const [updated] = await Movie.update(req.body, { where: { id: req.params.id } });
    if (updated) res.send({ message: "Movie updated" });
    else res.status(404).send({ message: "Movie not found" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Delete a Movie by id
exports.delete = async (req, res) => {
  try {
    const deleted = await Movie.destroy({ where: { id: req.params.id } });
    if (deleted) res.send({ message: "Movie deleted" });
    else res.status(404).send({ message: "Movie not found" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// Delete all Movies
exports.deleteAll = async (req, res) => {
  try {
    const num = await Movie.destroy({ where: {}, truncate: false });
    res.send({ message: `${num} movies deleted` });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
