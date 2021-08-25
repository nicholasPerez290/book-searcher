const { AuthenticationError } = require('apollo-server-core');
const { UniqueArgumentNamesRule } = require('graphql');
const { User } = require('../models');
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user){
                return User.findOne({ _id: context.user._id }).populate('savedBooks')
            }
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.create({ email, password })

            if(!user){
                throw new AuthenticationError("No account found with this email!");
            };

            const chkPassword = await user.isCorrectPassword(password);

            if(!chkPassword){
                throw new AuthenticationError("Incorrect password!!!");
            };

            const token = signToken(user)
            return {token, user};
        },
        addUser: async (parent, { username, email, password }) => {
            const user = User.create({ username, email, password });
            const token = signToken(user);
            return { token, user }
        },
        saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
            if(!context.user){
                throw new AuthenticationError('Cannot find a user with this id!');
            }
            const user = await User.findOneAndUpdate(
                { _id: context.user._id },
            { $addToSet: { savedBooks: {authors, description, title, bookId, image, link}} }
            )
    }
    }
}

module.exports = resolvers;