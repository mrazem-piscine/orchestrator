module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    number_of_items: {
      type: DataTypes.INTEGER,
    //   allowNull: false
    },
    total_amount: {
      type: DataTypes.FLOAT,
    //   allowNull: false
    }
  }, {
    tableName: 'orders', // ensure table name is correct
    timestamps: false
  });

  return Order;
};