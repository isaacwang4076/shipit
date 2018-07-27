var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var bucket = 'meetatlassian';

module.exports = function (controller) {
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
            }, 5000);
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
    var matches = [];
    while(info_list.length != 0){
        var first = info_list[0];
        for(var i=1; i < info_list.length; i++){
            var other = info_list[i];
            if(first['available']==other['available']){

                var match = [first['id'], other['id']];
                matches.push(match)
                info_list.splice(i,1);
            }
            info_list.splice(0,1);
        }


    }

    console.log(matches);
}


