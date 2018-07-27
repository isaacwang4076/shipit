//file for registering to meet in person
module.exports = function (controller) {
    var answers_dict = {};
    // var bot = controller.spawn({
    //     token: process.env.botToken});
    controller.hears(['register'], 'direct_message,direct_mention', function (bot, message) {

        bot.startConversation(message, function (err, convo) {
            convo.ask('Do you want to register for meetups?',[

                {
                    pattern: bot.utterances.yes,
                    callback: function (response, convo) {
                        askInfo(convo, 'What office are you in?', answers_dict, 'office', function (response, convo) {
                            console.log('this is the convo: '+message.user);
                            askInfo(convo, 'Great! Now, what day are you free for lunch?', answers_dict, 'available', function (response, convo) {

                                console.log(answers_dict);
                                convo.say('Perfect. We will set up a meeting for you');
                                convo.next();
                                upload_aotw(message.user, answers_dict);
                            })
                        })

                    },
                },
                {
                    pattern: bot.utterances.no,
                    callback: function (response, convo) {
                        convo.gotoThread('no_thread');
                    },
                },
                {
                    default: true,
                    callback: function (response, convo) {
                        convo.gotoThread('bad_response');
                    },
                }
            ]);
        });
    });

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
    console.log('askInfo called with msg: ' + msg);
    convo.ask(msg, function (response, convo) {
        console.log('yaboi')
        dict[key] = response.text
        on_response(response, convo)
    })
    convo.next()
}