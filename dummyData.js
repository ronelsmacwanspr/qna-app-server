const { generateAnswers, generateQuestions } = require("./utils");
const { User } = require("./models/User");

let questions = [],
  answers = [];
let currentUser = new User({ id: 1, name: "Ronels" });

generateQuestions(questions, currentUser);
generateAnswers(questions, answers, currentUser);

module.exports = { questions, answers, currentUser };
