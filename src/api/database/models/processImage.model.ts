import { DataTypes, Model, Sequelize } from 'sequelize';

class ProcessImage extends Model {
  declare productName: string;
  declare inputImageUrls: string;
  declare outputImageUrls: string | null;
  declare status: string;
}

const initModel = (sequelize: Sequelize) => {
  ProcessImage.init(
    {
      productName: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      inputImageUrls: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      },
      outputImageUrls: {
        type: new DataTypes.STRING(128),
        allowNull: true,
      },
      status: {
        type: new DataTypes.STRING(128),
        allowNull: true,
      },
      requestId: {
        type: new DataTypes.STRING(128),
        allowNull: false,
      }
    },
    {
      tableName: 'ProcessImage',
      sequelize,
      schema: 'tenant'
    }
  );
  return ProcessImage;
};

export default initModel;