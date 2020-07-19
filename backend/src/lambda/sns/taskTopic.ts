import { SNSEvent, SNSHandler, S3Event } from 'aws-lambda';
import "source-map-support/register";
import { createLogger } from '../../utils/logger';
import { getTaskItem, updateAttachmentUrl } from '../../business/tasks';
import { S3Util } from '../../utils/s3Util';

const logger = createLogger('taskTopic');

export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info("Processing SNS event", event);

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        logger.info("Processing S3 event", s3EventStr);
        const s3Event: S3Event = JSON.parse(s3EventStr);

        for (const record of s3Event.Records) {
            try {
                const taskId = record.s3.object.key;
                const taskItem = await getTaskItem(taskId);

                if (!taskItem) {
                    logger.error("Task does not exist", taskId);
                    continue;
                }

                await updateAttachmentUrl(taskItem.taskId, taskItem.userId, S3Util.getAttachmentUrl(taskId));
            } catch (error) {
                logger.error("Processing event record", error);
            }
        }
    }
};