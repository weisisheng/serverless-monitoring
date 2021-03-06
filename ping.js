const request = require('request-promise-native');
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

const { url, accountId, region, snsTopic } = process.env;

const serviceContext = { accountId, region, snsTopic };

const publisher = (context) => (message, success) =>
  sns.publish({
      Message: message,
      MessageAttributes: {
        success: {
          DataType: 'String',
          StringValue: JSON.stringify(success)
        }
      },
      TopicArn: `arn:aws:sns:${context.region}:${context.accountId}:${context.snsTopic}`
  }, (err) => {
      if (err) {
          console.error('Error in publishing to SNS topic', err.stack);
          return;
      }
  });

module.exports.handler = async (event) => {
    const publishMessage = publisher(serviceContext);
    return request(url)
        .then(
          () => {
            publishMessage(`${url} IS available!`, true)
            return true;
          },
          () => {
            publishMessage(`${url} NOT available!`, false)
            return false;
          }
        );
}
