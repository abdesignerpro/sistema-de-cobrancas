import { Model, DataTypes } from 'sequelize';
import sequelize from '../index';

class Charge extends Model {
  public id!: number;
  public clientId!: string;
  public amount!: number;
  public dueDate!: Date;
  public status!: string;
  public pixTxid!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Charge.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
    },
    pixTxid: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Charge',
    tableName: 'charges',
  }
);

export default Charge;
