const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
} = graphql;
const _ = require("lodash");

let books = [
  { id: "1", name: "5 point someone", genre: "Youth", authorId: "1" },
  { id: "2", name: "Think and grow rich", genre: "Finance", authorId: "3" },
  { id: "3", name: "Revolution 2020", genre: "Fiction", authorId: "2" },
  { id: "4", name: "Rich dad poor dad", genre: "Money", authorId: "1" },
  { id: "5", name: "Ikigai", genre: "Self help", authorId: "3" },
];

let authors = [
  { id: "1", name: "A1", age: 22 },
  { id: "2", name: "A2", age: 33 },
  { id: "3", name: "A3", age: 12 },
];

class Author {
  constructor({ name, age }) {
    this.name = name;
    this.age = age;
    this.id = `${authors.length + 1}`;
  }
}
const BookType = new GraphQLObjectType({
  name: "BookType",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      resolve(parent, args) {
        return _.find(authors, { id: parent.authorId });
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "AuthorType",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        console.log(parent.id);
        return _.filter(books, { authorId: parent.id });
      },
    },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        if (!args.id) return books;
        return _.find(books, { id: args.id });
      },
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        console.log(parent);
        return _.find(authors, { id: args.id });
      },
    },
    books: {
      type: new GraphQLList(BookType),
      resolve(parent, args) {
        return books;
      },
    },
    authors: {
      type: new GraphQLList(AuthorType),
      resolve(parent, args) {
        console.log(authors);
        return authors;
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "MutationType",
  fields: {
    addAuthor: {
      type: AuthorType,
      args: { name: { type: GraphQLString }, age: { type: GraphQLInt } },
      resolve(parent, args) {
        let _author = new Author({ name: args.name, age: args.age });
        authors.push(_author);
        return _author;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
module.exports = schema;

// import { buildSchema } from "graphql";
// const schema = buildSchema(`
//    type Address{
//       city : String,
//       pincode : Int!,
//       landmark : String
//    }

//    type SliceChars{
//       val : String
//    }
//    type Query{
//         hello : String,
//         age : Int,
//         address : Address!,
//         firstNCharsOfHello({num : Int}) : SliceChars
//    }
// `);

// export default schema;
