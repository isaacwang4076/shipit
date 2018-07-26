var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var bucket = 'meetatlassian';
var bot;
var aotd_channel_id = "CBWTT0QBA";

module.exports = function(controller) {
	console.log("esketit yaboi")

	console.log("post_to_aotd.js");

	//get_channels();

	bot = controller.spawn({
		token: process.env.botToken});
	pull_from_s3();
};

// function get_channels() {
// 	var request = require('request')

// 	var headers = {
// 		'Content-type': 'application/x-www-form-urlencoded'
// 	};

// 	var dataString = 'token=' + process.env.botToken;

// 	var options = {
// 	url: 'https://slack.com/api/channels.list',
// 	method: 'POST',
// 	headers: headers,
// 	body: dataString
// 	};

// 	request(options, function(error, response, body) {
// 		if (!error && response.statusCode == 200) {
// 			console.log(body);
// 		}
// 		else {
// 			console.log("fuck me mang")
// 		}
// 	});
// }


function pull_from_s3() {

	var info_dict_list = []

	var bucketParams = {Bucket: bucket}

	s3.listObjects(bucketParams, function(err, data) {
		if (err) {
			console.log("Error", err);
		} else {
			//console.log("Success", data);
			var num_objects = data.Contents.length;
			for (var i = 0; i < num_objects; i++) {
				var object = data.Contents[i]
				params = {Bucket: bucket, Key: object.Key}
				s3.getObject(params, function(err, data) {
		    		if (err) console.log(err, err.stack); // an error occurred
		    		else {
		    			var info_dict = JSON.parse(data.Body);
		    			info_dict_list.push(info_dict);
		    		}
				});
			}
		}
	});

	setTimeout(function() {
		post_aotd(info_dict_list)
	}, 3 * 1000);
}

function get_aotd_msg(info_dict) {
	
}

function post_aotd(info_dict_list) {
	console.log("posting aotd");
	info_dict_list = shuffle(info_dict_list);
	for (var i = 0; i < info_dict_list.length; i++) {
		var info_dict = info_dict_list[i]
		console.log("assessing " + JSON.stringify(info_dict))
		if (info_dict.new) {

			console.log("actually posting to aotd...")

			bot.startConversation({
		    	channel: aotd_channel_id,
		    	text: 'WOWZA... 1....2'
		    }, (err, convo) => {
		    	console.log(err)
		    	convo.say("esketit")
			})
			break;

			// bot.api.im.open({
			//     user: member.id,
			//     token: process.env.botToken
			// }, (err, res) => {
			//     if (err) {
			//      	bot.botkit.log('Failed to open IM with user', err)
			//     }
			//     console.log(res);
			//     bot.startConversation({
			//     	user: member.id,
			//     	channel: res.channel.id,
			//     	text: 'WOWZA... 1....2'
			//     }, (err, convo) => {
			// 	    if (err == null) {
			// 	    	console.log("Successfully started convertsation with user " + member.real_name);
			// 	    }
			// 	})
			// })

			// // indicate that we've posted this now
			// var key = 'aotd/' + info_dict.id
			// info_dict.new = false;
			// params = {Bucket: bucket, Key: key, Body: JSON.stringify(info_dict), ContentType: "application/json"};
			// s3.putObject(params, function(err, data) {
		 //    	if (err) {
		 //      		console.log(err)
		 //    	} else {
		 //      		console.log("Successfully uploaded data key: " + key);
		 //    	}

		 //  	});
		}
	}
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}