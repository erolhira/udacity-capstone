import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { updateTask, getTask } from '../../business/tasks';
import { UpdateTaskRequest } from '../../business/requests';
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTask');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Processing event", event);
    const taskId = event.pathParameters.taskId;
    const updatedTask: UpdateTaskRequest = JSON.parse(event.body);
    const taskItem = await getTask(taskId, event);

    if (!taskItem) {
      const message = "Task does not exist or you are not authorized to update the task";
      logger.warning("updateTask", message);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: message
        })
      };
    }

    await updateTask(taskId, updatedTask, event);

    return {
      statusCode: 200,
      body: ""
    };
  } catch (error) {
    logger.error("updateTask", error);
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
