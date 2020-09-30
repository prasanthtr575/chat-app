const { UserInputError, AuthenticationError } = require("apollo-server");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User } = require('../database/models');
const { JWT_SECRET } = require('../database/config/env.json');

module.exports = {
    Query: {
        getUsers: async (_, __, context) => {
            let user;

            try {
                const authToken = context.req.headers.authourization.split('Bearer ')[1];
                jwt.verify(authToken, JWT_SECRET, (err, decodedToken) => {
                    if(err) {
                        throw new AuthenticationError('Unauthorized access');
                    }
                    user = decodedToken;
                });

                const users = await User.findAll({
                    where: {
                        username: {
                            [Op.ne]: user.username
                        }
                    }
                });

                return users;
            } catch (err) {
                throw err;
            }
        },
        login: async (_, args) => {
            const { username, password } = args;
            let errors = {};

            // Validate inputs
            if (username.trim() === '') errors.username = 'Username must not be empty';
            if (password.trim() === '') errors.password = 'Password must not be empty';

            if (Object.keys(errors).length > 0) {
                throw new UserInputError('Login credentials must not be empty', {
                    errors: errors,
                });
            }

            // Get user with username
            try {
                const user = await User.findOne({ where: { username } })

                if(!user) {
                    errors = {username: "User not found"};
                    throw new AuthenticationError('User not found', { errors });        
                }

                const passwordMatch = await bcrypt.compare(password, user.password);

                if(!passwordMatch) {
                    errors = {password: "Wrong password"};
                    throw new AuthenticationError('Wrong password', {errors});
                }

                const token = jwt.sign(
                    { username }, 
                    JWT_SECRET, 
                    { expiresIn: 60 * 60 }
                );
                user.token = token;

                return {
                    ...user.toJSON(),
                    createdAt: user.createdAt.toISOString(),
                    token
                };
            } catch (err) {
                throw new AuthenticationError('Login failed', {
                    errors: err
                });     
            }
        }
    },
    Mutation: {
        signUp: async (_, args) => {
            const { username, email, password, confirmPassword } = args
            let errors = {};

            // Validate inputs
            if (username.trim() === '') errors.username = 'Username should not be empty';
            if (email.trim() === '') errors.email = 'Email should not be empty';
            if (password.trim() === '') errors.password = 'Password should not be empty';
            if (confirmPassword.trim() === '') errors.confirmPassword = 'Repeat password should not be empty';

            if (Object.keys(errors).length > 0) {
                throw new UserInputError('Signup data should not be empty', {
                    errors: errors,
                });
            }

            //Create user
            try {
                const hashedPassword = await bcrypt.hash(password, 6);
                const user = await User.create({ username, email, password: hashedPassword });

                return user;
            } catch (err) {
                if (err.name === 'SequelizeUniqueConstraintError') {  //Duplicate usename or email
                    err.errors.forEach(
                        (e) => (errors[e.path] = e.message)
                    )
                } else if (err.name === 'SequelizeValidationError') {
                    err.errors.forEach((e) => (errors[e.path] = e.message))
                }
                throw new UserInputError('Bad input', { errors })
            }
        }
    }
}