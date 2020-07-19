import * as AWS from "aws-sdk";
const AWSXray = require('aws-xray-sdk');
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { TaskItem, TaskUpdate } from "../business/models";
import { config } from "../business";
import { UpdateTaskRequest } from "../business/requests";
import { createLogger } from "../utils/logger";

const XAWS = AWSXray.captureAWS(AWS);
const logger = createLogger('taskDao');

export class TaskDao {
    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly tasksTable = config.tasksTableName,
        private readonly tasksTableIndexName = config.tasksTableIndexName) {
    }

    async getTaskItem(taskId: string): Promise<TaskItem> {
        try {
            logger.info(`Getting task with id ${taskId}`);

            const params: DocumentClient.QueryInput = {
                IndexName: this.tasksTableIndexName,
                TableName: this.tasksTable,
                KeyConditionExpression: 'taskId = :taskId',
                ExpressionAttributeValues: {
                    ':taskId': taskId
                }
            };

            const result = await this.docClient.query(params).promise();

            if (result.Items && result.Items.length) {
                return Promise.resolve(result.Items[0] as TaskItem);
            }

            return Promise.resolve(undefined);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getTask(taskId: string, userId: string): Promise<TaskItem> {
        try {
            logger.info(`Getting task with id ${taskId}`);

            const params: DocumentClient.QueryInput = {
                TableName: this.tasksTable,
                KeyConditionExpression: 'taskId = :taskId and userId = :userId',
                ExpressionAttributeValues: {
                    ':taskId': taskId,
                    ':userId': userId
                }
            };

            const result = await this.docClient.query(params).promise();

            if (result.Items && result.Items.length) {
                return Promise.resolve(result.Items[0] as TaskItem);
            }

            return Promise.resolve(undefined);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getAllTasks(): Promise<TaskItem[]> {
        try {
            logger.info("Getting all tasks");

            const result = await this.docClient.scan({
                TableName: this.tasksTable
            }).promise();

            return Promise.resolve(result.Items as TaskItem[]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getAllTasksByUser(userId: string): Promise<TaskItem[]> {
        try {
            logger.info(`Getting all tasks with userId ${userId}`);

            const params: DocumentClient.QueryInput = {
                TableName: this.tasksTable,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            };

            const result = await this.docClient.query(params).promise();
            return Promise.resolve(result.Items as TaskItem[]);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async createTask(task: TaskItem): Promise<TaskItem> {
        try {
            logger.info("Creating a new task", task);

            const params: DocumentClient.PutItemInput = {
                TableName: this.tasksTable,
                Item: task
            };

            await this.docClient.put(params).promise();
            return Promise.resolve(task);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async updateAttachmentUrl(taskId: string, userId: string, attachmentUrl: string): Promise<void> {
        try {
            logger.info(`Updating attachment url of the task: ${taskId}`);

            const params: DocumentClient.UpdateItemInput = {
                TableName: this.tasksTable,
                Key: {
                    "taskId": taskId,
                    "userId": userId
                },
                UpdateExpression: "set #a = :a",
                ExpressionAttributeNames: {
                    '#a': 'attachmentUrl',
                },
                ExpressionAttributeValues: {
                    ":a": attachmentUrl
                }
            };

            await this.docClient.update(params).promise();
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    async updateTask(taskId: string, userId: string, item: UpdateTaskRequest): Promise<TaskUpdate> {
        try {
            logger.info(`Updating task with id: ${taskId}`);

            const params: DocumentClient.UpdateItemInput = {
                TableName: this.tasksTable,
                Key: {
                    "userId": userId,
                    "taskId": taskId
                },
                UpdateExpression: "set #a = :a, #b = :b, #c = :c",
                ExpressionAttributeNames: {
                    '#a': 'name',
                    '#b': 'dueDate',
                    '#c': 'done'
                },
                ExpressionAttributeValues: {
                    ":a": item.name,
                    ":b": item.dueDate,
                    ":c": item.done
                },
                ReturnValues: "UPDATED_NEW"
            };

            const updatedItem = await this.docClient.update(params).promise();
            return Promise.resolve(updatedItem.Attributes as TaskUpdate);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async deleteTask(taskId: string, userId: string): Promise<void> {
        try {
            logger.info(`Deleting task with id: ${taskId}`);

            const params: DocumentClient.DeleteItemInput = {
                TableName: this.tasksTable,
                Key: {
                    "userId": userId,
                    "taskId": taskId
                }
            };

            await this.docClient.delete(params).promise();
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }
}

const createDynamoDBClient = () => {
    if (config.isOffline) {
        logger.info("Creating a local DynamoDB instance");
        return new XAWS.DynamoDB.DocumentClient({
            region: "localhost",
            endpoint: "http://localhost:8000"
        });
    }

    return new XAWS.DynamoDB.DocumentClient();
};