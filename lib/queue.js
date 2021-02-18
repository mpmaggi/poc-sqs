const {
  SQSClient, GetQueueUrlCommand, SendMessageBatchCommand
} = require('@aws-sdk/client-sqs');
const logger = require('./logger');

let sqs;
const queueUrl = {};

const initSqs = () => {
  sqs = new SQSClient();
};
const getSqsInstance = () => {
  if (!sqs) {
    initSqs();
  }
  return sqs;
};

const getQueueUrl = async (queueName) => {
  if (!queueUrl[queueName]) {
    logger.warn('Buscando URL da Fila')
    const client = getSqsInstance();
    try {
      const command = new GetQueueUrlCommand({ QueueName: queueName });
      const data = await client.send(command);
      queueUrl[queueName] = data.QueueUrl;
    } catch (err) {
      logger.error(`Error on getting QueueUrl from SQS. ${err}`);
    }
  }
  return queueUrl[queueName];
};

const initQueue = async (queueName) => {
  getSqsInstance();
  await getQueueUrl(queueName);
  logger.info(queueUrl[queueName]);
  return queueUrl[queueName];
};

const sendBatch = (batch, queueName, callback) => {
  const url = queueUrl[queueName];
  const client = getSqsInstance();
  
  const params = {
    Entries: batch,
    QueueUrl: url
  };
  const command = new SendMessageBatchCommand(params);
  logger.warn(`[CALLBACK] Enviando Batch com ${params.Entries.length} itens.`)
  return client.send(command, callback);
};

const sendBatchAsync = async (batch, queueName) => {
  const url = queueUrl[queueName];
  const client = getSqsInstance();

  const params = {
    Entries: batch,
    QueueUrl: url
  };
  const command = new SendMessageBatchCommand(params);
  try{ 
    logger.warn(`[ASYNC] Enviando Batch com ${params.Entries.length} itens.`)
    const data = await client.send(command);
    return { data } ;
  } catch (err) {
    return { err };
  }
};

module.exports = { initQueue, sendBatch, sendBatchAsync };
