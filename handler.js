/*
* @Author: herby
* @Date:   2017-01-28 15:01:32
* @Last Modified by:   Stefan Wirth
* @Last Modified time: 2017-01-30 12:05:11
*/


'use strict';

const dataSetService = require('./services/dataSet');
const bucketUrlFormatService = require('./services/bucketUrlFormat');

const RESPONSE_OK = 200;
const RESPONSE_SERVER_ERROR = 500;

module.exports = {
    saveDataSet: saveDataSet,
    getCurrentDataSet: getCurrentDataSet,
    savePictureWithData: savePictureWithData,
    getPicturesWithData: getPicturesWithData,
    processSaveDataSet: processSaveDataSet
}

/** 
    Saves the dataset with a certain timestamp
*/
function saveDataSet(event, context, callback) {
    const message = event.Records[0].Sns.Message;
    const eventMessage = (typeof message === 'string') ? JSON.parse(message || "{}") : message;
    //handle event differently for sns
    dataSetService.save(eventMessage)
        .then(function(savedSet) {
            return sendResponse(RESPONSE_OK, {data: savedSet}, callback)
        })
        .catch(function(err) {
            console.log(err);
            return sendResponse(RESPONSE_SERVER_ERROR, {data: {err: err}}, callback)
        });
};

function getCurrentDataSet(event, context, callback) {
    dataSetService.getCurrent()
        .then(function(currentDataSet) {
            return sendResponse(RESPONSE_OK, {data: currentDataSet}, callback)
        })
        .catch(function(err) {
            console.log(err);
            return sendResponse(RESPONSE_SERVER_ERROR, {data: {err: err}}, callback)
        });
}

function getPicturesWithData(event, context, callback) {
    dataSetService.getImagesWithData(10)
        .then(function(imagesWithData) {
            return sendResponse(RESPONSE_OK, {data: imagesWithData}, callback)
        })
        .catch(function(err) {
            console.log(err);
            return sendResponse(RESPONSE_SERVER_ERROR, {data: {err: err}}, callback)
        });
}

function savePictureWithData(event, context, callback) {
    const resource = event.Records[0];
    const bucketName = resource.s3.bucket.name;
    const fileName = resource.s3.object.key;

    const completeUrl = bucketUrlFormatService.format(bucketName, fileName);

    dataSetService.getCurrent()
        .then(function(currentDataSet) {
            return dataSetService.saveImageWithUrl(completeUrl, currentDataSet);
        })
        .then(function(currentDataSetWithImage) {
            return sendResponse(RESPONSE_OK, {data: currentDataSetWithImage}, callback)
        })
        .catch(function(err) {
            console.log(err);
            return sendResponse(RESPONSE_SERVER_ERROR, {data: {err: err}}, callback)
        });
}

function processSaveDataSet(event, context, callback) {
    const resource = event.Records[0];
    return sendResponse(RESPONSE_OK, {data: event}, callback)
}

function sendResponse(statusCode, data, callback) {
    callback(null, {
        statusCode: statusCode,
        body: JSON.stringify(data)
    });
}