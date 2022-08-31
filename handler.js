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

  const params = {
    TableName: userStreams,
    ProjectionExpression: "#uid",
    FilterExpression: "#uid = :uid",
    ExpressionAttributeNames: {
      "#uid": "userId",
    },
    ExpressionAttributeValues: {
      ":uid": requestBody.userId,
    },
  };

  const stream = {
    streamId: uuidv4(),
    userId: requestBody.userId,
  };

  return db.scan(params, (error, data) => {
    if (data.Items.length < 3) {
      db.put({
        TableName: userStreams,
        Item: stream,
      })
        .promise()
        .then(() => {
          callback(null, response(201, stream));
        })
        .catch((error) => {
          response(null, response(error.statusCode, error));
        });
    } else {
      callback(
        null,
        response(403, "Unable to start a new stream, maximum limit reached")
      );
    }
  });
};