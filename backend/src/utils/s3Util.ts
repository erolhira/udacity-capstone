import * as AWS from "aws-sdk";
const AWSXray = require('aws-xray-sdk');
import { config } from "../business";

const XAWS = AWSXray.captureAWS(AWS);

export class S3Util {
    constructor(
        private readonly s3: AWS.S3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly urlExpiration = parseInt(config.signedUrlExpiration, 10)) {
    }

    getUploadUrl(taskId: string): string {
        if (!taskId) {
            return "";
        }

        return this.s3.getSignedUrl('putObject', {
            Bucket: config.tasksBucketName,
            Key: taskId,
            Expires: this.urlExpiration
        });
    }

    deleteObject(taskId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!taskId) {
                    return resolve();
                }

                await this.s3.deleteObject({
                    Bucket: config.tasksBucketName,
                    Key: taskId
                }).promise();

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    static getAttachmentUrl(taskId: string): string {
        return `https://${config.tasksBucketName}.s3.amazonaws.com/${taskId}`;
    }
};