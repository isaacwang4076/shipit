var fs = require('fs');
var path = require('path');
var jsonPath = path.join(__dirname, '..', 'questions.txt');
var jsonString = fs.readFileSync(jsonPath, 'utf8');
var questions = jsonString.split("\n");

module.exports = function(controller) {

    controller.hears(['awkward'], 'direct_message, direct_mention', function(bot, message) {
        bot.startConversation(message, function(err, convo) {
            convo.say(get_random_question());
        });
    });
    controller.hears(['keep em comin'], 'direct_message, direct_mention', function(bot, message) {
        var interval_id = setInterval(function() {
          bot.startConversation(message, function(err, convo) {
              convo.say(get_random_question());
          });
        }, 2000);
        setTimeout(function() {
          clearInterval(interval_id)
        }, 60 * 1000);
    });
}

function get_random_question() {
  var question = questions[Math.floor(Math.random()*questions.length)];
  return question
}