require('dotenv').config();
const AWS = require('aws-sdk');
const logger = require('./logger');
const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_API_VERSION } = process.env;

const settings = {
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey:AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  apiVersion: AWS_API_VERSION
};

AWS.config.update(settings);
let sqs;

const initializeSqs = () => {
  sqs = new AWS.SQS();
}
const getQueueInstance = () => {
  if (!sqs) {
    initializeSqs();
  }
  return sqs;
}

const sendBatch = (batch, queueUrl, callback) => {
  const sqs = getQueueInstance();
  const params = {
    Entries: batch,
    QueueUrl: queueUrl
  };
  logger.warn(`[V2 CALLBACK] Enviando Batch com ${params.Entries.length} itens.`);
  sqs.sendMessageBatch(params, callback);
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessageBatch-property
};

const sendBatchAsync = async (batch, queueUrl, callback) => {
  const sqs = getQueueInstance();
  const params = {
    Entries: batch,
    QueueUrl: queueUrl
  };
  try{ 
    logger.warn(`[V2 ASYNC] Enviando Batch com ${params.Entries.length} itens.`)
    const data = await sqs.sendMessageBatch(params).promise();
    return { data } ;
  } catch (err) {
    return { err };
  }
    
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html#sendMessageBatch-property
};

module.exports = { sendBatch, sendBatchAsync };