import { DataTypes, Sequelize } from 'sequelize';
module.exports = (sequelize: Sequelize) => {
  const Products = sequelize.define('Products', {
    name: DataTypes.TEXT,
    favoriteColor: {
      type: DataTypes.TEXT,
      defaultValue: 'green',
    },
    age: DataTypes.INTEGER,
    cash: DataTypes.INTEGER,
  }, {schema: "tenant"});

  return Products;
}

