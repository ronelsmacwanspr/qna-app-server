const { generateAnswers, generateQuestions } = require("./utils");
const { User } = require("./models/User");

let questions = [],
  answers = [];
let currentUser = new User({ id: 0, name: "Ronels" });

generateQuestions(questions, currentUser);
generateAnswers(questions, answers, currentUser);

currentUser.upvotedAnswerIds.push("a-0");
currentUser.upvotedAnswerIds.push("a-2");

currentUser.downvotedAnswerIds.push("a-1");
currentUser.downvotedAnswerIds.push("a-3");

currentUser.answerIds.push("a-4");
currentUser.answerIds.push("a-5");

currentUser.questionIds.push("q-0");
currentUser.questionIds.push("q-1");
currentUser.questionIds.push("q-3");

currentUser = null;
let users = [];
module.exports = { questions, answers, currentUser, users };
