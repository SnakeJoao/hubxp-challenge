/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { v4 } from 'uuid';

@Injectable()
export class S3Service implements OnModuleInit {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly s3Endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>(
      'S3_BUCKET_NAME',
      'default-bucket',
    );
    this.s3Endpoint = this.configService.get<string>(
      'S3_ENDPOINT',
      'http://localhost:4566',
    );

    this.s3Client = new S3Client({
      endpoint: this.s3Endpoint,
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
          'admin',
        ),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'admin',
        ),
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.verifyBucketExists();
  }

  private async verifyBucketExists() {
    try {
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
      console.log(`Bucket "${this.bucketName}" already exists.`);
    } catch (error) {
      console.warn(
        `Bucket "${this.bucketName}" does not exist. Creating...`,
        error,
      );
      try {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucketName }),
        );
        console.log(`Bucket "${this.bucketName}" created successfully.`);
      } catch (createError) {
        throw new InternalServerErrorException(
          `Failed to create bucket: ${createError}`,
        );
      }
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const fileKey = `${v4()}-${file.originalname}`;
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return `${this.s3Endpoint}/${this.bucketName}/${fileKey}`;
    } catch (error) {
      throw new InternalServerErrorException(`File upload failed: ${error}`);
    }
  }

  async getFileUrl(fileKey: string): Promise<string> {
    try {
      await this.s3Client.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: fileKey }),
      );
      return `${this.s3Endpoint}/${this.bucketName}/${fileKey}`;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve file: ${error}`,
      );
    }
  }
}
