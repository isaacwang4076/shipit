var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var bucket = 'meetatlassian';
var bot;

module.exports = function (controller) {
    bot = controller.spawn({
    token: process.env.botToken});

    pull_from_s3();
}

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

                if((object.Key).startsWith('aotw')) {
                    console.log(object);
                    params = {Bucket: bucket, Key: object.Key}
                    s3.getObject(params, function (err, data) {
                        if (err) console.log(err, err.stack); // an error occurred
                        else {
                            var info_dict = JSON.parse(data.Body);
                            info_dict_list.push(info_dict);
                        }
                    });
                };
            }
            setTimeout(function() {
                match_users(info_dict_list);
            }, 3000);
        }
    });

    // setInterval(function() {
    //     select_and_post_aotd(info_dict_list)
    // }, 10 * 1000);

    // setInterval(function() {
    // 	select_and_post_aotd(info_dict_list)
    // }, 10 * 1000);
}

function match_users(info_list){
    console.log("matching users...")
    var matches = [];

    // var day_dict = {
    //     'monday' : [],
    //     'tuesday' : [],
    //     'wednesday' : [],
    //     'thursday' : [],
    //     'friday' : []
    // }

    // for (var entry in info_list) {
    //     console.log(entry)
    //     day_dict[entry.available]
    // }

    while(info_list.length > 1){
        console.log('lit')
        var first = info_list[0];
        var found_match = false;
        for(var i=1; i < info_list.length; i++){
            var other = info_list[i];
            if(first['available']==other['available']){

                var match = [first['id'], other['id'], first['available']];
                matches.push(match)
                info_list.splice(i,1);
                info_list.splice(0,1);
                found_match = true;
                break;
            }
        }
        if (!found_match) {
            info_list.splice(0,1);
        }
    }

    console.log(matches);
    for (var i = 0; i < matches.length; i++) {
        var match = matches[i]
        start_one_on_one(match[0], match[1], match[2])
    }
}

function start_one_on_one(member_id_1, member_id_2, day) {
    var request = require('request')

    var headers = {
        'Content-type': 'application/x-www-form-urlencoded'
    };

    var dataString = 'token=' + process.env.botToken + '&return_im=true&users=' + member_id_1 + "," + member_id_2;

    var options = {
        url: 'https://slack.com/api/conversations.open',
        method: 'POST',
        headers: headers,
        body: dataString
    };
    console.log('day is ' + day)
  
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(JSON.parse(body))
            var channel_info = JSON.parse(body).channel;
            bot.startConversation({
                channel: channel_info.id,
            text: 'WOWZA... 1....2'
            }, (err, convo) => {
                if (err == null) {
                    console.log("Successfully started multi convo");
                    get_users_name(member_id_1, function(name1) {
                        get_users_name(member_id_2, function(name2) {
                            var first_name_1 = name1.split(" ")[0]
                            var first_name_2 = name2.split(" ")[0]
                            convo.say(first_name_1 + ", meet " + first_name_2 + ". " + first_name_2 + ", " 
                                + first_name_1 + ". You two are getting lunch this " + day + "!")
                        })
                    })
                }
            })

        }
    });
}

function get_users_name(id, callback) {

  var request = require('request')

  var headers = {
    'Content-type': 'application/x-www-form-urlencoded'
  };

  var dataString = 'token=' + process.env.botToken;

  var options = {
    url: 'https://slack.com/api/users.list',
    method: 'POST',
    headers: headers,
    body: dataString
  };
  
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      members = JSON.parse(body).members;
      members.forEach(function(member) {
        if (member.id == id) {
            callback(member.real_name)
        }
      })
    } else {
      console.log('fuck');
    }
  })
}


