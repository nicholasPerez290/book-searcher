const { AuthenticationError } = require('apollo-server-core');
const { UniqueArgumentNamesRule, locatedError } = require('graphql');
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
            let user = await User.findOne({ email })
            console.log(user)
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
            let user = User.create({ username, email, password });
            const token = signToken(user);
            return { token, user }
        },
        saveBook: async (parent, { BookData }, context) => {
            if(!context.user){
                throw new AuthenticationError('Cannot find a user with this id!');
            }
            let user = await User.findOneAndUpdate(
                { _id: context.user._id },
            { $addToSet: { savedBooks: { BookData }} }
            );
            return user
    },
    removeBook: async (parent, { bookId }, context) => {
        let user = await User.findOneAndUpdate(
            {_id: context.user._id},
            {$pull: {savedBooks: {bookId: bookId }} }
        )
    }
    }
}

module.exports = resolvers;