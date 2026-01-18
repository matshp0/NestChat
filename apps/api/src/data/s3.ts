import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  avatarBucket: string;
  mediaBucket: string;
}

@Injectable()
export class S3Service extends S3Client {
  readonly avatarBucket: string;
  readonly mediaBucket: string;
  readonly region: string;
  constructor(private readonly configService: ConfigService) {
    const config = configService.get<S3Config>('aws')!;
    super(config);
    this.avatarBucket = config.avatarBucket;
    this.mediaBucket = config.mediaBucket;
    this.region = config.region;
  }

  getProfileUrl(key: string) {
    return `https://${this.avatarBucket}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
