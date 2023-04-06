const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
let {
  questions,
  answers,
  currentUser: _currentUserFromDummyData,
  users,
} = require("./dummyData");
const _ = require("lodash");
const { GraphQLError } = require("graphql");
const { User } = require("./models/User");
const { Question } = require("./models/Question");
const { Answer } = require("./models/Answer");
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

let tempUser = new User({ id: 1, name: "Ronels" });

class noSuchUserError extends GraphQLError {
  constructor({ id }) {
    super();
    this.message = `No Such user with Id : ${id}`;
  }
}

class noSuchAnswerError extends GraphQLError {
  constructor({ id }) {
    super();
    this.message = `No Such answer with Id : ${id}`;
  }
}

class noSuchQuestionError extends GraphQLError {
  constructor({ id }) {
    super();
    this.message = `No Such question with Id : ${id}`;
  }
}

const QUESTION_SEND_MAX_LIMIT = 100;

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
    user : User!
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
    user : User
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
    answers : [Answer!]
    questions : [Question!]
    upvotedAnswers : [Answer!]
    downvotedAnswers : [Answer!]
  }

  
  type Query{
    questions(first : Int) : [Question!]
    answers : [Answer!]
    question(id:ID!) : Question
    answer(id : ID!) : Answer
    user(id : Int!) : User
    loggedInUser : User
  }


  input UserInput{
    name : String!
    from : String
    bio : String

  }

  input QuestionInput{
    userId : Int!
    categories : [String!]
    title : String!
    description : String
  }

  input AnswerInput{
    userId : Int!
    description : String!
    questionId : ID!
  }

  type UserVoteActionResponse{
    success : Boolean!
    user : User
    answer : Answer
    message : String
  }


  type Mutation{
    addUser(inputUser : UserInput!) : User!
    addUpvotedAnswerId(userId : Int! , answerId : ID!) : UserVoteActionResponse!
    addDownvotedAnswerId(userId : Int! , answerId : ID!) : UserVoteActionResponse!
    removeUpvotedAnswerId(userId : Int! , answerId : ID!) : UserVoteActionResponse!
    removeDownvotedAnswerId(userId : Int! , answerId : ID!) : UserVoteActionResponse!
    addQuestion(inputQuestion : QuestionInput!) : Question!
    addAnswer(inputAnswer : AnswerInput!) : Answer!

  }
`;

const resolvers = {
  Query: {
    answers() {
      return answers;
    },
    questions(parent, args) {
      const { first } = args;
      if (first !== 0 && (first === null || first === undefined))
        return questions.slice(0, QUESTION_SEND_MAX_LIMIT);
      if (first < 0) {
        throw new GraphQLError("negative num of questions asked");
      }

      const send = Math.min(first, QUESTION_SEND_MAX_LIMIT);
      return questions.slice(0, send);
    },
    question(parent, args) {
      const { id } = args;
      const result = _.find(questions, (_ques) => _ques.id === id);
      return result;
    },
    answer(parent, args) {
      const { id } = args;
      const _ans = _.find(answers, (ans) => ans.id === id);
      return _ans;
    },
    user(parent, args) {
      const { id } = args;
      if (id >= users.length) {
        throw new GraphQLError("invalid user id", { extensions: { id: id } });
      }
      return users[id];
    },
    loggedInUser(par, args, contextValue) {
      const { userId } = contextValue;
      console.log("users", users);
      console.log("userId", userId);
      if (userId >= 0 && userId < users.length) return users[userId];
      return null;
    },
  },
  Question: {
    user(parent) {
      const { userId } = parent;
      if (userId < 0 || userId >= users.length) {
        throw noSuchUserError({ id: userId });
      }
      return users[userId];
    },
    answers(parent) {
      const res = _.filter(answers, (_ans) => _ans.questionId === parent.id);
      return res;
    },
    firstNAnswers(parent, args) {
      const { num } = args;
      if (num <= 0) {
        return null;
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
    user(parent) {
      const { userId } = parent;
      if (userId === null || userId === undefined) return null;

      if (typeof userId !== "number" || userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }
      return users[userId];
    },
  },
  User: {
    upvotedAnswers(parent) {
      const { id: userId } = parent;
      //get currentUser from userId
      if (userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }

      const res = users[userId].upvotedAnswerIds.map((_ansId) => {
        const _ans = _.find(answers, (a) => a.id === _ansId);
        if (!_ans) {
          throw new GraphQLError("Invalid data on server", {
            extensions: { id: _ansId, code: "NO data with given id exists" },
          });
        }
        return _ans;
      });

      return res;
    },
    downvotedAnswers(parent) {
      const { id: userId } = parent;
      //get currentUser from userId
      if (userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }

      const res = users[userId].downvotedAnswerIds.map((_ansId) => {
        const _ans = _.find(answers, (a) => a.id === _ansId);
        if (!_ans) {
          throw new GraphQLError("Invalid data on server", {
            extensions: { id: _ansId, code: "NO data with given id exists" },
          });
        }
        return _ans;
      });

      return res;
    },
    questions(parent) {
      const { id: userId } = parent;
      //get currentUser from userId

      if (userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }

      const res = users[userId].questionIds.map((_quesId) => {
        const _ques = _.find(questions, (q) => q.id === _quesId);

        if (!_ques) {
          throw new GraphQLError("Invalid data on server", {
            extensions: { id: _quesId, code: "NO data with given id exists" },
          });
        }
        return _ques;
      });

      return res;
    },
    answers(parent) {
      const { id: userId } = parent;
      //get currentUser from userId
      if (userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }

      const res = users[userId].answerIds.map((_ansId) => {
        const _ans = _.find(answers, (a) => a.id === _ansId);
        if (!_ans) {
          throw new GraphQLError("Invalid data on server", {
            extensions: { id: _ansId, code: "NO data with given id exists" },
          });
        }
        return _ans;
      });

      return res;
    },
  },

  Mutation: {
    addUser(par, args) {
      // console.log("args", args);
      const { inputUser } = args;
      const id = users.length,
        { name, bio, from } = inputUser;

      const newUser = new User({ id, name, bio, from });
      // console.log(newUser);
      // console.log(users);

      users.push(newUser);
      return newUser;
    },
    addUpvotedAnswerId(par, args) {
      const { userId, answerId } = args;

      if (userId >= 0 && userId < users.length) {
        const _user = users[userId];
        const correspondingAnswer = _.find(answers, (a) => a.id === answerId);

        if (!correspondingAnswer) {
          throw new GraphQLError("No such answer!", {
            extensions: { answerId: answerId },
          });
        }

        if (_user.upvotedAnswerIds.includes(answerId)) {
          return {
            success: false,
            message: "User has already upvoted",
            user: _user,
            answer: correspondingAnswer,
          };
        }

        _user.upvotedAnswerIds.push(answerId);
        // added upvoted answer id

        correspondingAnswer.numUpvotes++;
        // updated upvote cnt of answer

        return {
          success: true,
          message: "Succesfully added upvoted answer, answer data updated",
          user: _user,
          answer: correspondingAnswer,
        };
      } else {
        throw new GraphQLError("No such user!", {
          extensions: { userId: userId },
        });
      }
    },
    addDownvotedAnswerId(parent, args) {
      const { userId, answerId } = args;

      if (userId >= 0 && userId < users.length) {
        const _user = users[userId];
        const correspondingAnswer = _.find(answers, (a) => a.id === answerId);

        if (!correspondingAnswer) {
          throw new noSuchAnswerError({ id: answerId });
        }

        if (_user.downvotedAnswerIds.includes(answerId)) {
          return {
            success: false,
            message: "User has already downvoted",
            user: _user,
            answer: correspondingAnswer,
          };
        }

        _user.downvotedAnswerIds.push(answerId);
        // added upvoted answer id

        correspondingAnswer.numDownvotes++;
        // updated upvote cnt of answer

        return {
          success: true,
          message: "Succesfully added downvoted answer, answer data updated",
          user: _user,
          answer: correspondingAnswer,
        };
      } else {
        throw new noSuchUserError({ id: userId });
      }
    },
    removeUpvotedAnswerId(parent, args) {
      const { userId, answerId } = args;
      if (userId >= 0 && userId < users.length) {
        const _user = users[userId];
        const correspondingAnswer = _.find(answers, (a) => a.id === answerId);

        if (!correspondingAnswer) {
          throw new noSuchAnswerError({ id: answerId });
        }
        if (!_user.upvotedAnswerIds.includes(answerId)) {
          return {
            success: false,
            message: `User hasn't upvoted this answer id : ${answerId}`,
            user: _user,
            answer: correspondingAnswer,
          };
        }
        //remove id from user
        _.remove(_user.upvotedAnswerIds, (_ansId) => _ansId === answerId);
        // decrement numUpvotes from answer
        correspondingAnswer.numUpvotes--;

        return {
          success: true,
          message: "Successfully removed upvoted answerId, answer data updated",
          user: _user,
          answer: correspondingAnswer,
        };
      } else {
        throw new noSuchUserError({ id: userId });
      }
    },
    removeDownvotedAnswerId(parent, args) {
      const { userId, answerId } = args;
      if (userId >= 0 && userId < users.length) {
        const _user = users[userId];
        const correspondingAnswer = _.find(answers, (a) => a.id === answerId);

        if (!correspondingAnswer) {
          throw new noSuchAnswerError({ id: answerId });
        }
        if (!_user.downvotedAnswerIds.includes(answerId)) {
          return {
            success: false,
            message: `User hasn't downvoted this answer id : ${answerId}`,
            user: _user,
            answer: correspondingAnswer,
          };
        }
        //remove id from user
        _.remove(_user.downvotedAnswerIds, (_ansId) => _ansId === answerId);
        // decrement numUpvotes from answer
        correspondingAnswer.numDownvotes--;

        return {
          success: true,
          message:
            "Successfully removed downvoted answerId, answer data updated",
          user: _user,
          answer: correspondingAnswer,
        };
      } else {
        throw new noSuchUserError({ id: userId });
      }
    },
    addQuestion(parent, args) {
      const { title, description, categories, userId } = args.inputQuestion;

      if (userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }

      const id = `q-${questions.length}`,
        date = new Date(),
        day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear(),
        datePosted = `${day}/${month}/${year}`;

      const user = users[userId];
      const _ques = new Question({
        id,
        userId,
        title,
        description,
        categories,
        datePosted,
      });

      user.questionIds.push(id);
      questions.push(_ques);
      console.log("questions", questions);
      return _ques;
    },
    addAnswer(parent, args) {
      const { description, questionId, userId } = args.inputAnswer;

      if (userId < 0 || userId >= users.length) {
        throw new noSuchUserError({ id: userId });
      }

      const id = `a-${answers.length}`,
        date = new Date(),
        day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear(),
        datePosted = `${day}/${month}/${year}`;

      const user = users[userId];

      const _answer = new Answer({
        id,
        description,
        userId,
        datePosted,
        questionId,
      });

      const correspondingQuestion = _.find(
        questions,
        (q) => q.id === questionId
      );

      if (!correspondingQuestion) {
        throw new noSuchQuestionError({ id: questionId });
      }

      user.answerIds.push(id);
      correspondingQuestion.answerIds.push(id);
      answers.push(_answer);

      console.log("new ans is", _answer);
      return _answer;
    },
  },
};
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
    context: async ({ req, res }) => {
      const userId = req.headers.authorization;
      // console.log("user-id in header", userId);
      if (!userId) return null;
      return { userId };
    },
  });

  console.log("url ", url);
};

startServer();
