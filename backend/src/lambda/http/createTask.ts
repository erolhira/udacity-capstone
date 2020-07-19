import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateTaskRequest } from '../../business/requests';
import { createTask } from '../../business/tasks';
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTask');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info('Processing event:', event);

    const newTask: CreateTaskRequest = JSON.parse(event.body);
    const newItem = await createTask(newTask, event);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    };
  } catch (error) {
    logger.error("createTask", error);
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