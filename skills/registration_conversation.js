//file for registering to meet in person
module.exports = function (controller) {
    var answers_dict = {};
    // var bot = controller.spawn({
    //     token: process.env.botToken});
    controller.hears(['register'], 'direct_message,direct_mention', function (bot, message) {
        bot.startConversation(message, function (err, convo) {
            message_params = message.text.split(" ");
            if (message_params.length == 3) {
                answers_dict['office'] = message_params[1]
                answers_dict['available'] = message_params[2]
                convo.say('Gotcha. I\'ll let you know when your one-on-one is set up!');
                convo.next();
                upload_aotw(message.user, answers_dict);
            } else {
                askInfo(convo, 'Thanks for your interest in Once-A-Week! Before I register you, what office are you in?', answers_dict, 'office', function (response, convo) {
                    askInfo(convo, 'Great! Now, what days are you free for lunch?', answers_dict, 'available', function (response, convo) {
                        convo.say('Perfect. I\'ll let you know when your one-on-one is set up!');
                        convo.next();
                        upload_aotw(message.user, answers_dict);
                    })
                })
            }
        });
    })
};

function upload_aotw(member_id, info_dict) {
    //console.log("uploading aotd for " + member.real_name);

    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();

    // Bucket names must be unique across all S3 users

    var bucket = 'meetatlassian';

    var key = 'aotw/' + member_id;

    //info_dict.new = true;
    info_dict.id = member_id


    params = {Bucket: bucket, Key: key, Body: JSON.stringify(info_dict), ContentType: "application/json"};

    s3.putObject(params, function(err, data) {

        if (err) {

            console.log(err)

        } else {

            console.log("Successfully uploaded data key: " + key);

        }

    });
}

function askInfo(convo, msg, dict, key, on_response) {
    convo.ask(msg, function (response, convo) {
        console.log('yaboi')
        dict[key] = response.text
        on_response(response, convo)
    })
    convo.next()
}