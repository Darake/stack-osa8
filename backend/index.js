const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const config = require('./utils/config')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

mongoose.set('useFindAndModify', false)

console.log('connecting to', config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  enum YesNo {
    YES
    NO
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    allAuthors(
      born: YesNo
    ): [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const JWT_SECRET = 'TEMP_SECRET_KEY'

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: (root, args) => {
      if (args.genre) return Book.find({ genres: { $in: args.genre }}).populate('author')
      return Book.find({}).populate('author')
    },
    allAuthors: (root, args) => {
      if (!args.born) {
        return Author.find({})
      }
      return Author.find({ born: { $exists: args.born === 'YES' }})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: (root) => Book.find({ author: { $eq: root.id }}).countDocuments()
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) throw new AuthenticationError('Not authenticated')
      
      let author = await Author.findOne({ name: args.author })
      let book

      try {
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }
        book = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author
        })
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return book
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) throw new AuthenticationError('Not authenticated')
      
      const author = await Author.findOne({ name: args.name })
      if (!author) return null
      author.born = args.setBornTo
      
      try {
        author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }

      return author
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      return user
        .save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      
      if (!user || args.password !== 'password') {
        throw new UserInputError('Wrong login info')
      }
      
      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, JWT_SECRET )}
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const authorization = req ? req.headers.authorization : null

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(authorization.substring(7), JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})