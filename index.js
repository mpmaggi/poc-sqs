const queue = require('./lib/queue');
const queueV2 = require('./lib/queue-v2');
const logger = require('./lib/logger');

const batch = require('./batch.json');
const batches = [1,2,3,4,5,6,7,8,9,10];

const queueName = 'xewards-journey';
let url;

const callback = (err, data, type, extraInfo) => {
  if (err) {
    console.error(`Error sending batch to queue ${queueName}. Batch: ${
      JSON.stringify(batch)}. Error: ${err}`);
      return;
  }
  logger.info(`[${type}] ${data.Successful.length} enfileirados.`);

  if(extraInfo) {
    logger.cyan(extraInfo);
  }
};

const initUrl = async () => {
  logger.head('================================================================');
  logger.head('=================   INICIALIZA URL DA FILA   ===================');
  logger.head('================================================================');

  url = await queue.initQueue(queueName);
}

const useAsync = async () => {
  logger.head('================================================================');
  logger.head('=====================   USANDO ASYNC   =========================');
  logger.head('================================================================');
  const startAsync = process.hrtime();

  for (const i of batches) {
    const result = await queue.sendBatchAsync(batch, queueName);
    const {err, data} = result;
    callback(err, data, 'ASYNC');
  }
  const endAsync = process.hrtime(startAsync);
  logger.cyan(`[ASYNC] Tempo gasto: ${endAsync}`)
};

const useCallback = (title) => {
  title = title || '=====================   USANDO CALLBACK   ======================';
  logger.head('================================================================');
  logger.head(title);
  logger.head('================================================================');
  
  const startCb = process.hrtime();
  let cbCounter = 0;
  
  for (const i of batches) {
    queue.sendBatch(batch, queueName, (err, data) => {
      cbCounter += 1;
      let extraInfo;
      if(cbCounter === batches.length) {
        const endCb = process.hrtime(startCb);
        extraInfo = (`[CALLBACK] Tempo gasto: ${endCb}`);
      }
      return callback(err, data, 'CALLBACK', extraInfo);
    });
  }
};

const useV2Callback = (title) => {
  title = title || '=================== V2  USANDO CALLBACK   ======================';
  logger.head('================================================================');
  logger.head(title);
  logger.head('================================================================');
  
  const startCbV2 = process.hrtime();
  let cbCounterV2 = 0;

  for (const i of batches) {
    queueV2.sendBatch(batch, url, (err, data) => {
      cbCounterV2 += 1;
      let extraInfo;
      if(cbCounterV2 === batches.length) {
        const endCbV2 = process.hrtime(startCbV2);
        extraInfo = (`[V2 CALLBACK] Tempo gasto: ${endCbV2}`);
      }
      return callback(err, data, 'V2 CALLBACK', extraInfo);
    });
  }
};

(async() => {
  
  await initUrl();

  await useAsync();

  useCallback();
  useV2Callback();

  setTimeout(() => {
    useCallback('==========   USANDO CALLBACK - ESPERA DE 2 SEGUNDOS   ==========');
  }, 2000);

  setTimeout(() => {
    useV2Callback('========= V2  USANDO CALLBACK - ESPERA DE 4 SEGUNDOS   =========');
  }, 4000);
  
})();
