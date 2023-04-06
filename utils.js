const { User } = require("./models/User");
const { Answer } = require("./models/Answer");
const { Question } = require("./models/Question");

function generateQuestions(questions, currentUser) {
  let count = 0;
  const date = new Date(),
    day = date.getDate(),
    month = date.getMonth() + 1,
    year = date.getFullYear();

  let question1 = new Question({
    id: `q-${count++}`,
    userId: currentUser.id,
    datePosted: `${day}/${month}/${year}`,
    categories: ["Music", "Entertainment"],
    title: `How to play a guitar? `,
    description: `Recently I got a new idea of 
     playing guitar as my hobby. Since my childhood I am big of One Direction, Beatles and when I see them playing guitar, I wished I could 
     also do the same. Please give some tips of playing guitar`,
    answerIds: [],
  });

  questions.push(question1);

  let question2 = new Question({
    id: `q-${count++}`,
    userId: currentUser.id,
    datePosted: `${day}/${month}/${year}`,
    categories: ["Coding", "Web Development", "Front-end"],
    title: "How to become good at Javascript?",
    description: `I am in 
     my first year of college and want to learn Web development. I want to begin with getting my hands on frontend. Please share some
     resources to be good at it`,
    answerIds: [],
  });

  let question3 = new Question({
    id: `q-${count++}`,
    userId: currentUser.id,
    datePosted: `${day}/${month}/${year}`,
    categories: ["Cricket", "Bowling"],
    title: `How to in-swing a ball ? `,
    description: `I've been playing cricket since past 
     few weeks and want to learn to swing a bowl especially inswing. Please guide me through correct steps im. Sed ornare, metus nec faucibus rhoncus, nunc turpis ultricies metus, ut venenatis lorem ante 
     e. a ligula sapien, sollicitudin vel molestie et, tempor eget odio. Vivamus ullamcorper quam id finibus sollicitudin. 
     Suspendisse  placerat magna leo, tempus malesuada tellus semper at. Donec rutrum id ipsum quis semper. Donec eget lacus a turpis maximus 
     pellentesque sit amet at nibh. Sed mattis d`,
    answerIds: [],
  });

  let question4 = new Question({
    id: `q-${count++}`,
    userId: currentUser.id,
    datePosted: `${day}/${month}/${year}`,
    categories: ["Cricket", "Bowling"],
    title: "How to in-swing a ball ?",
    description: `I've been playing cricket since past 
     few weeks and want to learn to swing a bowl especially inswing. Please guide me through correct steps`,
    answerIds: [],
  });

  questions.push(question2);
  questions.push(question3);
  questions.push(question4);
}

function generateAnswers(questions, answersArray, currentUser) {
  let count = 0;
  const date = new Date(),
    day = date.getDate(),
    month = date.getMonth() + 1,
    year = date.getFullYear();

  let prev = 3;
  for (let question of questions) {
    for (let j = 0; j < prev; ++j) {
      const answer = new Answer({
        id: `a-${count++}`,
        questionId: question.id,
        datePosted: `${day}/${month}/${year}`,
        userId: currentUser.id,
        numUpvotes: 30,
        numDownvotes: 20,
        description: `Hi this is my fist answer on QnA web app. Hope you like it.
        
        The fundamental difference of getting good at anything is to be consistent with it.Learnt it and practice
        it daily without fail. Ask your mentors your doubts and never hesistate on that.

        Make sure to spned atleast 1 hr everyday to learn side things you're intrested in.Not just JavaScript, everything in the known universe can be learned & perfected via practice.
        Start building stuff with Javascript. If you think you’ll learn everything about JavaScript before starting, then you’ll never see daylight. You cannot learn everything about JavaScript. More importantly, you cannot remember everything you learn about Javascript.
        `,
      });

      question.answerIds.push(answer.id);
      answersArray.push(answer);
    }
  }
}

module.exports = { generateQuestions, generateAnswers };
