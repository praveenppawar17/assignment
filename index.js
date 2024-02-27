require("events").EventEmitter.defaultMaxListeners = 100;

const crypto = require("crypto");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });

const dynamoDB = new AWS.DynamoDB.DocumentClient();

// here logic to encodebase62
function encodeBase62(number) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let base62String = "";

  do {
    const remainder = number % 62;
    base62String = characters.charAt(remainder) + base62String;
    number = Math.floor(number / 62);
  } while (number > 0);

  return base62String;
}

async function checkCollision(shortHash) {
  try {
    const result = await dynamoDB
      .get({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { hash: shortHash },
      })
      .promise();

    // Return true if the hash already exists in the database
    return !!result.Item;
  } catch (error) {
    console.error("Error checking collision:", error);
    throw error;
  }
}

module.exports.generateHash = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing request body" }),
      };
    }
    const { url } = JSON.parse(event.body);
    // Validate input
    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid "url" parameter' }),
      };
    }

    // here i am hashing the URL using SHA-256
    const hashBuffer = crypto.createHash("sha256").update(url).digest();
    console.log("hashBuffer.... ", hashBuffer);
    // converts the first 4 bytes of the hash to a number
    const hashNumber = hashBuffer.readUInt32BE(0);

    // Encode the number using a base62 encoding
    const hash = encodeBase62(hashNumber);

    // uses the only the first 7 characters, padded with zeros if needed
    let shortHash = hash.slice(0, 7).padEnd(7, "0");

    // this wl checks for collisions and append a counter if needed
    let counter = 1;
    while (await checkCollision(shortHash)) {
      counter += 1;
      shortHash = hash.slice(0, 7 - counter.toString().length) + counter;
    }

    // store the hashed URL and associateds data in DynamoDB
    await dynamoDB
      .put({
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          hash: shortHash,
          url,
          singleUse: true,
          expirationTime: Math.floor(Date.now() / 1000) + 3600, // Expiry time (1 hour in this example)
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ hashedUrl: shortHash }),
    };
  } catch (error) {
    console.error("Error generating hash:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

module.exports.redirect = async (event) => {
  const { hash } = event.pathParameters;
  try {
    // this wil retrievee the hashed URL from DynamoDB
    const result = await dynamoDB
      .get({
        TableName: process.env.DYNAMODB_TABLE,
        Key: { hash },
      })
      .promise();

    if (
      result.Item &&
      result.Item.singleUse &&
      result.Item.expirationTime > Math.floor(Date.now() / 1000)
    ) {
      // this will rredirect to the original URL
      return {
        statusCode: 302,
        headers: {
          Location: result.Item.url,
        },
        body: "",
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Invalid Hash" }),
    };
  } catch (error) {
    console.error("Error redirecting:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
