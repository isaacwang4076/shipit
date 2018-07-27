module.exports = function(controller) {

    // controller.hears(['ask'], 'direct_message, direct_mention', function(bot, message) {

    //     bot.startConversation(message, function(err, convo) {
    //         convo.say('This is an example of using convo.ask with a single callback.');

    //         convo.ask('What is your favorite color?', function(response, convo) {

    //             convo.say('Cool, I like ' + response.text + ' too!');
    //             convo.next();

    //         });
    //     });
    // });
    get_random_conv();
}

function get_random_conv() {
	var fs = require('fs');
  var path = require('path');
  var jsonPath = path.join(__dirname, '..', 'questions.txt');
  var jsonString = fs.readFileSync(jsonPath, 'utf8');
  console.log(jsonString);
}