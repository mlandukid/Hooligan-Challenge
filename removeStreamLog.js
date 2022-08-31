"use strict";
const AWS = require("aws-sdk");

let options = {};

if (process.env.IS_OFFLINE) {
  options = {
    region: "localhost",
    endpoint: "http://localhost:8001",
  };
}

const db = new AWS.DynamoDB.DocumentClient(options);

const userStreams = process.env.USER_STREAMS_TABLE;

const response = (statusCode, message) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({
      statusCode: statusCode,
      message: message,
    }),
  };
};

module.exports.removeStream = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);

  const params = {
    TableName: userStreams,
    ProjectionExpression: "#uid, #sid",
    FilterExpression: "#uid = :uid and #sid = :sid",
    ExpressionAttributeNames: {
      "#uid": "userId",
      "#sid": "streamId",
    },
    ExpressionAttributeValues: {
      ":uid": requestBody.userId,
      ":sid": requestBody.streamId,
    },
  };

  return db
    .delete(params, (error, data) => {
      console.log(data);
    })
    .promise()
    .then(() => {
      callback(
        null,
        response(
          204,
          `${data.Item.userId} stopped viewing stream ${data.Item.userId}`
        )
      );
    })
    .catch((error) => {
      console.log(error);
    });
};