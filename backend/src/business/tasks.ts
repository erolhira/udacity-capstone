import * as uuid from "uuid";
import { CreateTaskRequest } from "./requests";
import { TaskItem, TaskUpdate } from "./models";
import { TaskDao } from "../dao/taskDao";
import { S3Util } from "../utils/s3Util";
import { APIGatewayProxyEvent } from "aws-lambda";
import { AuthUtil } from "../utils/authUtil";
import { UpdateTaskRequest } from "./requests";

const taskAccess = new TaskDao();
const s3Helper = new S3Util();

export const getTaskItem = async (taskId: string): Promise<TaskItem> => {
    return await taskAccess.getTaskItem(taskId);
};

export const getTask = async (taskId: string, event: APIGatewayProxyEvent): Promise<TaskItem> => {
    const userId = AuthUtil.getUserId(event);
    return await taskAccess.getTask(taskId, userId);
};

export const getAllTasks = async (): Promise<TaskItem[]> => {
    return await taskAccess.getAllTasks();
};

export const getAllTasksByUser = async (event: APIGatewayProxyEvent): Promise<TaskItem[]> => {
    const userId = AuthUtil.getUserId(event);
    return await taskAccess.getAllTasksByUser(userId);
};

export const createTask = async (request: CreateTaskRequest, event: APIGatewayProxyEvent): Promise<TaskItem> => {
    const taskId = uuid.v4();
    const userId = AuthUtil.getUserId(event);

    return await taskAccess.createTask({
        createdAt: new Date().toISOString(),
        done: false,
        dueDate: request.dueDate,
        name: request.name,
        taskId,
        userId,
        attachmentUrl: ""
    });
};

export const updateAttachmentUrl = async (taskId: string, userId: string, attachmentUrl: string): Promise<void> => {
    return await taskAccess.updateAttachmentUrl(taskId, userId, attachmentUrl);
};

export const updateTask = async (taskId: string, request: UpdateTaskRequest, event: APIGatewayProxyEvent): Promise<TaskUpdate> => {
    const userId = AuthUtil.getUserId(event);
    return await taskAccess.updateTask(taskId, userId, request);
};

export const deleteTask = async (taskId: string, event: APIGatewayProxyEvent): Promise<void> => {
    const userId = AuthUtil.getUserId(event);
    return await taskAccess.deleteTask(taskId, userId);
};

export const getUploadUrl = (taskId: string) => s3Helper.getUploadUrl(taskId);

export const deleteS3BucketObject = (taskId: string) => s3Helper.deleteObject(taskId);