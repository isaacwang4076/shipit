module.exports = function(controller) {

  	console.log("time traveler is in")
	var timelines = ['../time/start_conversation.js', '../time/post_to_aotd.js', '../time/matching_meetups.js']
	var timeline_index = 0;

    controller.hears(['timetravel', 'time travel'], 'direct_message,direct_mention', function(bot, message) {
    	console.log("Zipping to timeline number " + (timeline_index + 1));
    	require(timelines[timeline_index])(controller);
    	timeline_index = (timeline_index + 1) % timelines.length ;
    });
}