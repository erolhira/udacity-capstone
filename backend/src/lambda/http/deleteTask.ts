import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'source-map-support/register';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { deleteTask, deleteS3BucketObject, getTask } from '../../business/tasks';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTask');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Processing event", event);
    const taskId = event.pathParameters.taskId;

    const taskItem = await getTask(taskId, event);

    if (!taskItem) {
      const message = "Task does not exist or you are not authorized to delete the task";
      logger.warning("deleteTask", message);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: message
        })
      };
    }

    await deleteTask(taskId, event);
    await deleteS3BucketObject(taskId);

    return {
      statusCode: 200,
      body: ""
    };
  }
  catch (error) {
    logger.error("deleteTask", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error
      })
    };
  }
});

handler.use(
  cors({
    origin: "*",
    credentials: true
  })
);