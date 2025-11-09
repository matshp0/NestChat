export default () => ({
  port: parseInt(process.env.PORT!, 10),
  db: process.env.DATABASE_URL!,
  jwt: {
    secret: process.env.JWT_SECRET,
    ttl: process.env.JWT_TTL || 900000,
    refreshTtl: process.env.JWT_REFRES_TTL || 604800000,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
    avatarBucket: process.env.AWS_AVATAR_BUCKET!,
    mediaBucket: process.env.AWS_MEDIA_BUCKET!,
  },
});
