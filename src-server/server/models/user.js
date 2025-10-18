// import bcrypt from 'bcrypt';
const bcrypt = require('bcrypt')
// import jwt from 'jsonwebtoken';
const jwt= require('jsonwebtoken');
// import sendMail from '../MailSender';
const sendMail = require('../MailSender');
// import EMAIL_CONTENT from '../email-template/content';
// const EMAIL_CONTENT = require('../email-template/content');
import { USER_TYPES, ACCOUNT_STATUS } from '../constant';

const {USER_TYPES,ACCOUNT_STATUS} = require('../constant');

const encryptPassword = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));


module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          min: 3,
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          min: 3,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          min: 6,
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [11, 14],
        },
      },
      phoneNumber2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { isIn: [[0, 1, 2, 3, 999]] },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      activationToken: {
        type: DataTypes.STRING,
      },
      activatedAt: {
        type: DataTypes.DATE,
      },
      referral: {
        type: DataTypes.STRING,
      },
      source: {
        type: DataTypes.STRING,
        defaultValue: 'Direct',
      },
      bandRole: {
        type: DataTypes.STRING,
      },
      referredBy: {
        type: DataTypes.INTEGER,
      },
      profileImageURL: {
        type: DataTypes.STRING,
      },
      profileImageID: {
        type: DataTypes.STRING,
      },
      firstTimeLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      commissionId: {
        type: DataTypes.INTEGER,
      },
      accountStatus: {
        type: DataTypes.STRING,
        defaultValue: ACCOUNT_STATUS.ACTIVE,
      },
      accountName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      accountNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: (user) => {
          user.password = encryptPassword(user.password);
          user.activationToken = jwt.sign(
            {
              userId: user.id,
              type: user.type,
            },
            process.env.SECRET
          );
          user.referral = Date.now().toString(36).slice(-5);
        },
        afterCreate: (user) => {
          const models = require('./');
          const link = `${process.env.HOST}/activate/${user.activationToken}`;
          if (user.source === 'Direct') {
            sendMail(EMAIL_CONTENT.ACTIVATE_YOUR_ACCOUNT, user, {
              link,
            });
          }
          const indentityInformation = () =>
            [
              'EntertainerProfile',
              'BankDetail',
              'Identification',
              'ApprovalComment',
            ].map((model) => models[model].create({ userId: user.id }));
          if (user.type === USER_TYPES.ENTERTAINER) {
            return Promise.all(indentityInformation());
          }
          return Promise.resolve(null);
        },
        beforeUpdate: (user) => {
          if (user.changed('password')) {
            user.password = encryptPassword(user.password);
          }
        },
      },
    },
    {
      classMethods: {
        associate: (models) => {
          // associations can be defined here
          // User.hasMany(User, {foreignKey: 'userId', as: 'bandMembers'});
          // User.hasOne(models.EntertainerProfile, {foreignKey: 'userId', as: 'profile'});
          // console.log('models', models);
          // User.hasMany(models.Gallery, {
          //   foreignKey: 'userId',
          //   onDelete: 'CASCADE',
          //   hooks: true
          // });
        },
      },
    }
  );
  return User;
};
