"use strict";
const AWS = require("aws-sdk");
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
const { v4: uuidv4 } = require("uuid");

const userStreams = process.env.USER_STREAMS_TABLE;

const response = (statusCode, message) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message),
  };
};

module.exports.logStream = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);

  const stream = {
    streamId: uuidv4(),
    userId: requestBody.userId,
  };

  return db
    .put({
      TableName: userStreams,
      Item: stream,
    })
    .promise()
    .then(() => {
      callback(null, response(201, stream));
    })
    .catch((error) => {
      callback(null, response(error.statusCode, error));
    });
};