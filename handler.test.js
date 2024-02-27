require("dotenv").config();
const { generateHash } = require("./index.js");
const AWSMock = require("aws-sdk-mock");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

describe("generateHash", () => {
  beforeEach(() => {
    // Mock DynamoDB put method
    AWSMock.mock("DynamoDB.DocumentClient", "put", (params, callback) => {
      // successful mock for all cases
      callback(null, {});
    });
  });

  afterEach(() => {
    // Restore AWS SDK after each test
    AWSMock.restore("DynamoDB.DocumentClient");
  });

  it("should generate a short URL for a valid input", async () => {
    const event = {
      body: JSON.stringify({
        url: "https://www.youtube.com/watch?v=diji6JMYKdo",
      }),
    };

    // this Calls th generateHash function
    const result = await generateHash(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();
    const parsedBody = JSON.parse(result.body);
    expect(parsedBody.hashedUrl).toBeDefined();
  });
});
