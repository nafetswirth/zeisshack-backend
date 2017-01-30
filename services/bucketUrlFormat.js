/*
* @Author: herby
* @Date:   2017-01-28 19:47:48
* @Last Modified by:   Stefan Wirth
* @Last Modified time: 2017-01-28 19:52:36
*/

'use strict';

const BUCKET_URL = 'https://s3-eu-west-1.amazonaws.com/:bucketName/:fileName';

module.exports = {
    format: format
}

function format(bucketName, fileName) {
    return BUCKET_URL
        .replace(':bucketName', bucketName)
        .replace(':fileName', fileName);
}