const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
let { questions, answers, currentUser } = require("./dummyData");
const _ = require("lodash");
const { GraphQLError } = require("graphql");
// const _books = [{name : 'Book-1'} , {name : 'Book-2'} , {name : 'Book-3'} , {name : 'Book-4'}];

// const _persons = [{gender : 'MALE' , favBooks :null} ,
//                  { gender : 'MALE' , favBooks : []},
//                  {gender : 'MALE' , favBooks : [{name : 'Book-3'}]},
//                  {gender : 'FEMALE', favBooks : [{name : 'Book-1'}]} ,
//                  {gender : 'FEMALE', favBooks : [{name : 'Book-3'}]}
//                 ];

// const typeDefs = `
//     type Book{
//         name : String!
//     }

//     enum GENDER{
//         MALE
//         FEMALE
//     }

//     type Person{
//         gender : GENDER!
//         favBooks : [Book!]
//     }

//     type Query{
//         books: [Book!]!
//         person(gender : GENDER!) : Person
//         persons : [Person!]!

//     }
// `

// const resolvers = {
//         Query:{
//             books(){
//                 return _books;
//             },
//             persons(){
//                 return _persons;
//             },
//             person(parent , args){

//                 const {gender} = args;
//                 console.log(typeof gender);
//                 return _persons.find(person => person.gender === gender);
//             }
//         }
// }

const typeDefs = `
  type Question{
    id : ID!
    userId : Int!
    datePosted : String!
    categories : [String!]
    title : String!
    description : String
    answers : [Answer!]
    answerIds : [String!]!
    firstNAnswers(num : Int!) : [Answer!]
  }

  type Answer{
    id : ID!
    questionId : String!
    description : String!
    userId : Int!
    datePosted : String!
    numUpvotes : Int!
    numDownvotes : Int!
    question : Question!
  }

  type User{
    id : Int!
    name : String!
    from : String
    bio : String
    questionIds : [String!]
    answerIds : [String!]
    upvotedAnswerIds : [String!]
    downvotedAnswerIds : [String!]
  }

  type Query{
    questions : [Question!]
    answers : [Answer!]
    question(id:ID!) : Question
    user : User
  }
`;

const resolvers = {
  Query: {
    answers() {
      return answers;
    },
    questions() {
      return questions;
    },
    question(parent, args) {
      const { id } = args;
      const result = _.find(questions, (_ques) => _ques.id === id);
      if (!result) {
        throw new GraphQLError("No such user exists", {
          extensions: { code: "BAD_USER_INPUT", id: id },
        });
      }
    },
    user() {
      return currentUser;
    },
  },
  Question: {
    answers(parent) {
      const res = _.filter(answers, (_ans) => _ans.questionId === parent.id);
      return res;
    },
    firstNAnswers(parent, args) {
      const { num } = args;
      if (num < 0) {
        throw new GraphQLError("Negative number of answers asked", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      const res = [];
      const _question = _.find(questions, (q) => q.id === parent.id);

      for (let i = 0; i < Math.min(num, _question.answerIds.length); ++i) {
        // find ans with questionId
        const requiredAnswerId = _question.answerIds[i];
        const _answer = _.find(answers, (a) => a.id === requiredAnswerId);

        res.push(_answer);
      }
      return res;
    },
  },
  Answer: {
    question(parent) {
      const res = _.find(questions, (_ques) => _ques.id === parent.questionId);
      return res;
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log("url ", url);
};

startServer();
