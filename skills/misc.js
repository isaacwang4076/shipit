module.exports = function(controller) {
	var aotd_channel_id = "CBWTT0QBA";

    controller.hears(['help', 'usage'], 'direct_message,direct_mention', function(bot, message) {

        bot.startConversation(message, function(err, convo) {
            convo.say('I make getting to know your fellow Atlassians easy. Here\'s some of what I can do:\n\
            	\t- Ask random Atlassians to be featured on <#' + aotd_channel_id + '>\n\
            	\t- Manage registration and scheduling for Once-A-Week, your weekly one-on-one with a random Atlassian (command: register)\n\
            	\t- Travel through time (command: timetravel)\n\
            	\t- Tell you what I do (commands: help, usage)');
        });
    });
}