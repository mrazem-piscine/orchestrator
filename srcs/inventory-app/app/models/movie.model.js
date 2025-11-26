module.exports = (sequelize, Sequelize) => {
  const Movie = sequelize.define("movie", {
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    }
    // ,
    // year: {
    //   type: Sequelize.INT
    // }
  },
{
  tableName: "films",
  timestamps: false, //disable created at / updated at columns

});
  return Movie;
};
