const AWS = require("aws-sdk");
const crypto = require("crypto");
const s3 = new AWS.S3();
exports.handler = async (event, context) => {
  console.log("Welcome");
  const fileContent = Buffer.from(event.body, "base64");

  const fileName = crypto.randomBytes(16).toString("hex") + ".pdf";
  console.log("fileName", fileName);

  const s3Params = {
    Bucket: "csci-5409-final-project",
    Key: fileName,
    Body: fileContent,
  };

  await s3.putObject(s3Params).promise();
  console.log("file uploaded");

  const result = {
    s3Url: `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`,
    keywords: "Fix Data",
  };
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
