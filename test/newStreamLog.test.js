const axios = require("axios");
describe("logStream()", () => {
    it("returns 201", () => {
      axios.post("https://h173bq3s8k.execute-api.us-east-1.amazonaws.com/dev/stream", {
        userId: "12345",
    });
});
});
