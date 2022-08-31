const { DocumentClient } = require("aws-sdk/clients/dynamodb");

const isTest = process.env.JEST_WORKER_ID;
const config = {
  convertEmptyValues: true,
  ...(isTest && {
    endpoint: "localhost:8000",
    sslEnabled: false,
    region: "local-env",
  }),
};

const ddb = new DocumentClient(config);

describe("dynamodb local tests", () => {
  it("should insert item into table", async () => {
    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "1", userId: "1" } })
      .promise();

    const { Item } = await ddb
      .get({ TableName: "userStreams", Key: { streamId: "1" } })
      .promise();

    expect(Item).toEqual({
      streamId: "1",
      userId: "1",
    });
  });
  it("should scan for stream log by id", async () => {
    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "1", userId: "1" } })
      .promise();

    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "2", userId: "2" } })
      .promise();

    const { Items } = await ddb
      .scan({
        TableName: "userStreams",
        ProjectionExpression: "#uid",
        FilterExpression: "#uid = :uid",
        ExpressionAttributeNames: {
          "#uid": "userId",
        },
        ExpressionAttributeValues: {
          ":uid": "1",
        },
      })
      .promise();

    expect(Items[0]).toEqual({ userId: "1" });
  });
  it("should find multiple user stream logs", async () => {
    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "1", userId: "3" } })
      .promise();
    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "2", userId: "3" } })
      .promise();
    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "3", userId: "3" } })
      .promise();

    const { Items } = await ddb
      .scan({
        TableName: "userStreams",
        ProjectionExpression: "#uid",
        FilterExpression: "#uid = :uid",
        ExpressionAttributeNames: {
          "#uid": "userId",
        },
        ExpressionAttributeValues: {
          ":uid": "3",
        },
      })
      .promise();

    expect(Items.length).toEqual(3);
  });
  it("removes a log stream", async () => {
    await ddb
      .put({ TableName: "userStreams", Item: { streamId: "1", userId: "4" } })
      .promise();

    await ddb.delete({
      TableName: "userStreams",
      Key: {
        streamId: "2",
      },
      ConditionExpression: "#uid = :uid",
      ExpressionAttributeNames: {
        "#uid": "userId",
      },
      ExpressionAttributeValues: {
        ":uid": "1",
      },
    });

    const { Items } = await ddb
      .scan({
        TableName: "userStreams",
        ProjectionExpression: "#uid",
        FilterExpression: "#uid = :uid",
        ExpressionAttributeNames: {
          "#uid": "userId",
        },
        ExpressionAttributeValues: {
          ":uid": "2",
        },
      })
      .promise();

    expect(Items.length).toEqual(0);
  });
});