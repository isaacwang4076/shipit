module.exports = function(controller) {

    controller.hears(['awkward'], 'direct_message, direct_mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            convo.say(get_random_question());
        });
    });
}

function get_random_question() {
	var fs = require('fs');
  var path = require('path');
  var jsonPath = path.join(__dirname, '..', 'questions.txt');
  var jsonString = fs.readFileSync(jsonPath, 'utf8');
  var questions = jsonString.split("\n");
  var question = questions[Math.floor(Math.random()*questions.length)];
  return question
}