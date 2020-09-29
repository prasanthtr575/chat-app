const bcrypt = require('bcryptjs');
const { UserInputError } = require("apollo-server");

const { User } = require('../database/models');

module.exports = {
    Query: {
        getUsers: async () => {
            try {
                const users = await User.findAll();

                return users;
            } catch (err) {
                console.log(err);
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