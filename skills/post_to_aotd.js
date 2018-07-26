module.exports = function(controller) {

	
			var AWS = require('aws-sdk');
			var s3 = new AWS.S3();
			var bucket = 'meetatlassian';
			var key = 'aotd/' + info_dict.id;
			
	console.log("post_to_aotd.js");
	var bot = controller.spawn({
		token: process.env.botToken});
	pull_from_s3();
};


function pull_from_s3() {

	var info_dict_list = []

	var AWS = require('aws-sdk');
	var s3 = new AWS.S3();
	var bucket = 'meetatlassian';
	var bucketParams = {Bucket: bucket}
	// key = 'aotd/' + member.id;
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

	setTimeout(post_aotd(info_dict_list), 5 * 1000);
}

function post_aotd(info_dict_list) {
	console.log("posting aotd");
	info_dict_list = shuffle(info_dict_list);
	for (var info_dict in info_dict_list) {
		if (info_dict.new) {
			params = {Bucket: bucket, Key: key, Body: JSON.stringify(info_dict), ContentType: "application/json"};
			break;
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