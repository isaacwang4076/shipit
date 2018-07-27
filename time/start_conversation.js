var aotd_channel_id = "CBWTT0QBA";

module.exports = function(controller) {
  var bot = controller.spawn({
    token: process.env.botToken});
  
  // members = get_workspace_members();

  // nonBots = get_non_bots(members);

  // nonBots.forEach(function(member) {
  //   console.log("Sending message to " + member.real_name)
  //   start_aotd_conversation(member.id)
  // })
  
  start_aotd_conversation_with_workplace(bot);
  //test_aws();
  //test();
};

function start_aotd_conversation_with_workplace(bot) {

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

      nonBots = get_non_bots(members);
      nonBots.forEach(function(member) {
        console.log("Sending message to " + member.real_name)
        start_aotd_conversation(bot, member, function(answers_dict) {
          upload_aotd(member, answers_dict);
        })
      })
    } else {
      console.log('fuck');
    }
  })
}



function test() {
  test_member = { 
    //id: 'UBXAAQF2Q',
    id: 'test_id_3',
  team_id: 'TBX13JJGH',
  name: 'iwang',
  deleted: false,
  color: '9f69e7',
  real_name: 'Isaac Wang',
  tz: 'America/Los_Angeles',
  tz_label: 'Pacific Daylight Time',
  tz_offset: -25200,
  profile: 
   { title: 'Software Engineering Intern',
     phone: '',
     skype: '',
     real_name: 'Isaac Wang',
     real_name_normalized: 'Isaac Wang',
     display_name: 'iwang',
     display_name_normalized: 'iwang',
     status_text: '',
     status_emoji: '',
     status_expiration: 0,
     avatar_hash: '7c747fdbb1f1',
     image_original: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_original.jpg',
     email: 'iwang@atlassian.com',
     first_name: 'Isaac',
     last_name: 'Wang',
     image_24: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_24.jpg',
     image_32: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_32.jpg',
     image_48: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_48.jpg',
     image_72: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_72.jpg',
     image_192: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_192.jpg',
     image_512: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_512.jpg',
     image_1024: 'https://avatars.slack-edge.com/2018-07-26/407108608214_7c747fdbb1f131c1e0fb_1024.jpg',
     status_text_canonical: '',
     team: 'TBX13JJGH',
     is_custom_image: true },
  is_admin: true,
  is_owner: true,
  is_primary_owner: true,
  is_restricted: false,
  is_ultra_restricted: false,
  is_bot: false,
  is_app_user: false,
  updated: 1532646942 }

  test_answers_dict = {}
  test_answers_dict['description'] = 'yaboi'
  test_answers_dict['spirit animal'] = 'chicken'
  test_answers_dict['motto'] = 'esketit'
  test_answers_dict['office'] = 'mtv'

  upload_aotd(test_member, test_answers_dict)
}

function upload_aotd(member, info_dict) {
  console.log("Uploading aotd for " + member.real_name);

  var AWS = require('aws-sdk');
  var s3 = new AWS.S3();

  // Bucket names must be unique across all S3 users

  var bucket = 'meetatlassian';

  var key = 'aotd/' + member.id;

  info_dict.new = true;
  info_dict.id = member.id
  info_dict.real_name = member.real_name
  info_dict.image = get_best_image(member);
  info_dict.title = member.profile.title;
  info_dict.display_name = member.profile.display_name;

  params = {Bucket: bucket, Key: key, Body: JSON.stringify(info_dict), ContentType: "application/json"};

  s3.putObject(params, function(err, data) {

    if (err) {

      //console.log(err)

    } else {

      console.log("Successfully uploaded data key: " + key);

    }

  });
}

function get_best_image(member) {
  var best_num = 0
  var best_image = null
  for (var attribute in member.profile) {
    if (attribute.startsWith('image_')) {
      var num = parseInt(attribute.substring(6))
      if (num > best_num) {
        best_num = num
        best_image = member.profile[attribute]
      }
    }
  }
  return best_image
}

function get_non_bots(members) {
  nonBots = []
  members.forEach(function(member) {
    if (!member.is_bot) {
      nonBots.push(member)
    }
  })
  return nonBots
}

function start_aotd_conversation(bot, member, on_answers_collected) {
  bot.api.im.open({
    user: member.id,
    token: process.env.botToken
  }, (err, res) => {
    if (err) {
      bot.botkit.log('Failed to open IM with user', err)
    }
    bot.startConversation({
      user: member.id,
      channel: res.channel.id,
      text: 'WOWZA... 1....2'
    }, (err, convo) => {
      if (err == null) {
        console.log("Successfully started conversation with user " + member.real_name);
      }

      convo.setTimeout(30 * 1000)

      var answers_dict = {}

      // create a path for when a user says YES
      convo.addMessage({
              text: 'Awesome! First up: what office are you in?'
      },'yes_thread');

      convo.addQuestion('Awesome. To start, please describe yourself in a couple sentences.', function(response, convo) {
        answers_dict['description'] = response.text
        convo.gotoThread('q2')
      }, {}, 'q1')

      convo.addQuestion('Great! Now, what\'s your spirit animal?', function(response, convo) {
        answers_dict['spirit animal'] = response.text
        convo.gotoThread('q3')
      }, {}, 'q2')

      convo.addQuestion('Sweet. What\'s your motto?', function(response, convo) {
        answers_dict['motto'] = response.text
        convo.gotoThread('q4')
      }, {}, 'q3')

      convo.addQuestion('Last thing, I promise! Which office are you in?', function(response, convo) {
        answers_dict['office'] = response.text
        on_answers_collected(answers_dict);
        convo.gotoThread('final')
      }, {}, 'q4')

      convo.addMessage({
          text: 'Perfect. Thanks for participating! You\'ll see yourself in <#' + aotd_channel_id +'> within a week or so.',
          action: 'stop'
      }, 'final');

      // create a path for when a user says NO
      // mark the conversation as unsuccessful at the end
      convo.addMessage({
          text: 'No problem! Have a good day.',
          action: 'stop', // this marks the converation as unsuccessful
      },'no_thread');

      // create a path where neither option was matched
      // this message has an action field, which directs botkit to go back to the `default` thread after sending this message.
      convo.addMessage({
          text: 'Sorry I did not understand. Say `yes` or `no`',
          action: 'default',
      },'bad_response');

      // Create a yes/no question in the default thread...
      convo.ask('Hey ' + member.real_name.split(" ")[0] + "! I'm looking for an Atlassian of the Day. Got a minute to answer a few quick questions?", [
          {
              pattern:  bot.utterances.yes,
              callback: function(response, convo) {
                convo.gotoThread('q1')
                // askInfo(convo, 'Awesome. To start, please describe yourself in a couple sentences.', answers_dict, 'description', function(response, convo) {
                //   askInfo(convo, 'Great! Now, what\'s your spirit animal?', answers_dict, 'spirit animal', function(response, convo) {
                //     askInfo(convo, 'Sweet. What\'s your motto?', answers_dict, 'motto', function(response, convo) {
                //       askInfo(convo, 'Last thing, I promise! Which office are you in?', answers_dict, 'office', function(response, convo) {
                //         convo.say('Perfect. Thanks for participating! You\'ll see yourself in <#'+ aotd_channel_id + '> within a week or so.');
                //         convo.next();
                //         on_answers_collected(answers_dict);
                //       })
                //     })
                //   })
                // })
              },
          },
          {
              pattern:  bot.utterances.no,
              callback: function(response, convo) {
                  convo.gotoThread('no_thread');
              },
          },
          {
              default: true,
              callback: function(response, convo) {
                  convo.gotoThread('bad_response');
              },
          }
      ]);
    });
  })
}

function askInfo(convo, msg, dict, key, on_response) {
  convo.ask(msg, function(response, convo) {
    dict[key] = response.text
    on_response(response, convo)
  })
  convo.next()
}