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
    Key: {
        streamId: requestBody.streamId,
      },
      ConditionExpression: "#uid = :uid",
    ExpressionAttributeNames: {
      "#uid": "userId",
    },
    ExpressionAttributeValues: {
      ":uid": requestBody.userId,
    },
  };

  return db
    .delete(params, (error, data) => {
      console.log(data);
    })
    .promise()
    .then(() => {
       callback(null, response(204, `User stopped viewing stream`));
    })
    .catch((error) => {
      console.log(error);
    });
};