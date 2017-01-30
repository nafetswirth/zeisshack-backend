/*
* @Author: herby
* @Date:   2017-01-28 15:01:32
* @Last Modified by:   Stefan Wirth
* @Last Modified time: 2017-01-30 12:44:45
*/

'use strict';

const AWS = require('aws-sdk');
//pls don't do this in case the deps change
const UUID = require('aws-sdk/node_modules/uuid');
const request = require('request-promise');

//hardcode all the things. env vars are too mainstream
AWS.config.update({
    region: 'eu-west-1',
    endpoint: 'https://dynamodb.eu-west-1.amazonaws.com'
});

const DATA_SET_TABLE_NAME = 'microscopeDataSet';
const DATA_SET_WITH_IMAGE_TABLE_NAME = 'microscopePicture'
const CUSTOMER_ID = '1';
const GLOBAL_SECONDARY_INDEX_NAME = 'index';
const IMAGE_GLOBAL_SECONDARY_INDEX_NAME = 'pictureCreatedAt';

const client = new AWS.DynamoDB.DocumentClient();

module.exports = {
    save: save,
    getCurrent: getCurrent,
    saveImageWithUrl: saveImageWithUrl,
    getImagesWithData: getImagesWithData
};

function save(dataSet) {
    const params = {
        TableName: DATA_SET_TABLE_NAME,
        Item: {
            id: UUID(),
            customerId: CUSTOMER_ID,
            createdAt: Date.now(),
            data: dataSet
        }
    };

    return putItem(params);
}

function getCurrent() {
    const params = {
        TableName: DATA_SET_TABLE_NAME,
        IndexName: GLOBAL_SECONDARY_INDEX_NAME,
        KeyConditionExpression: 'customerId = :customerId',
        ExpressionAttributeValues: {
            ':customerId' : CUSTOMER_ID
        },
        Limit: 1,
        ScanIndexForward: false
    };

    return new Promise(function(resolve, reject) {
        client.query(params, function(err, data) {
            if(err) {
                return reject(err);
            } else {
                return resolve(data.Items.shift());
            }
        });
    })
    .then(function(currentItem) {
        const id = currentItem.id;
        return new Promise(function(resolve, reject) {
            client.get({
                TableName: DATA_SET_TABLE_NAME,
                Key: {
                    id: id
                }
            }, function(err, data) {
                if(err) {
                    return reject(err);
                } else {
                    return resolve(data.Item);
                }
            });
        });
    });
}

function saveImageWithUrl(imageUrl, dataSet) {
    const params = {
        TableName: DATA_SET_WITH_IMAGE_TABLE_NAME,
        Item: {
            id: UUID(),
            customerId: CUSTOMER_ID,
            createdAt: Date.now(),
            imageUrl: imageUrl,
            dataSet: dataSet
        }
    };
    return putItem(params);
}

function getImagesWithData(limit) {
    const params = {
        TableName: DATA_SET_WITH_IMAGE_TABLE_NAME,
        IndexName: IMAGE_GLOBAL_SECONDARY_INDEX_NAME,
        KeyConditionExpression: 'customerId = :customerId',
        ExpressionAttributeValues: {
            ':customerId' : CUSTOMER_ID
        },
        Limit: 10,
        ScanIndexForward: false
    };

    return new Promise(function(resolve, reject) {
        client.query(params, function(err, data) {
            if(err) {
                return reject(err);
            } else {
                return resolve(data.Items);
            }
        });
    })
    .then(function(imagesWithData) {
        const imagePromises = imagesWithData.map(function(image) {
            //batch get item didn't work so doing 10 single queries instread...
            return new Promise(function(resolve, reject) {
                client.get({
                    TableName: DATA_SET_WITH_IMAGE_TABLE_NAME,
                    Key: {
                        id: image.id
                    }
                }, function(err, data) {
                    if(err) {
                        return reject(err);
                    } else {
                        return resolve(data.Item);
                    }
                });
            });
        });
        return Promise.all(imagePromises);
    });
}

function putItem(params) {
    return new Promise(function(resolve, reject) {
        client.put(params, function(err, data) {
            if(err) {
                return reject(err);
            } else {
                return resolve(params.Item);
            }
        });
    });
}