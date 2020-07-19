import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { getAllTasksByUser } from '../../business/tasks';
import { createLogger } from '../../utils/logger';

const logger = createLogger('getTasks');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    logger.info("Processing event", event);
    const tasks = await getAllTasksByUser(event);

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: tasks
      })
    };
  } catch (error) {
    logger.error("getTasks", error);
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
    origin: "*"
  })
);