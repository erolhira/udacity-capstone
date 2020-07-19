const tasksBucketName = process.env.TASK_S3_BUCKET;
const signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION
const tasksTableName = process.env.TASK_TABLE;
const tasksTableIndexName = process.env.TASK_INDEX_NAME;
const isOffline = process.env.IS_OFFLINE;

export {
    tasksBucketName,
    signedUrlExpiration,
    tasksTableName,
    tasksTableIndexName,
    isOffline
};