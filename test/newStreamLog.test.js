const axios = require("axios");
describe("logStream()", () => {
  xit("logs a new stream to the stream log", async () => {
        const post = () => {
          return axios.post(
            "https://h173bq3s8k.execute-api.us-east-1.amazonaws.com/dev/stream",
            {
              userId: "1",
            }
          );
        };
    
        await post().then((response) => {
          expect(response.data.statusCode).toEqual(201);
          expect(response.data.message.userId).toEqual("1");
          expect(response.data.message.streamId).toBeDefined();
    });
});
});
