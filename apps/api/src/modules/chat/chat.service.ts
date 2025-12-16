import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'src/data/repositories/chat.repository';
import { validateAvatar } from 'src/common/helpers/files/validateAvatar';
import { createHash, randomUUID } from 'crypto';
import { MessageRepository } from 'src/data/repositories/message.repository';
import { UserRepository } from 'src/data/repositories/user.repository';
import { MessageMapper } from 'src/data/mappers/message.mapper';
import { RoleRepository } from 'src/data/repositories/role.repository';
import { ChatMapper } from 'src/data/mappers/chat.mapper';
import { RoleMapper } from 'src/data/mappers/role.mapper';
import { plainToInstance } from 'class-transformer';
import { type MultipartFile } from '@fastify/multipart';
import sharp from 'sharp';
import { DEFAULT_ROLES_PERMISSIONS } from 'src/common/enums/defaultRoles';
import { DEFAULT_ROLES } from '@repo/utils/db';
import {
  ChatDto,
  ChatUserDto,
  MessageDto,
  RoleDto,
} from '@repo/utils/response';
import {
  AssignRoleDto,
  ChangeMessageDto,
  CreateChatDto,
  CreateMessageDto,
  CreateRoleDto,
  PaginatedMessageQueryDto,
} from '@repo/utils/request';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly messageRepository: MessageRepository,
    private readonly userRepository: UserRepository,
    private readonly messageMapper: MessageMapper,
    private readonly roleRepository: RoleRepository,
    private readonly chatMapper: ChatMapper,
    private readonly roleMapper: RoleMapper,
  ) {}

  async findById(chatId: number): Promise<ChatDto> {
    const chats = await this.chatRepository.findById(chatId);
    return plainToInstance(ChatDto, chats);
  }

  async findAll(): Promise<ChatDto[]> {
    const chats = await this.chatRepository.findAll();
    return plainToInstance(ChatDto, chats);
  }

  async createChat(userId: number, dto: CreateChatDto) {
    const { id: chatId } = await this.chatRepository.create(dto);
    await this.chatRepository.addUser(chatId, userId, null);
    const promises = Object.values(DEFAULT_ROLES).map((key) => {
      return this.roleRepository.createWithPermissions(
        chatId,
        DEFAULT_ROLES_PERMISSIONS[key],
        key,
      );
    });
    const roles = await Promise.all(promises);
    const { id: roleId } = roles.find(
      (el) => el.name === (DEFAULT_ROLES.OWNER as string),
    )!;
    await this.roleRepository.updateUserRole(chatId, userId, roleId);
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new Error('');
    return plainToInstance(ChatDto, chat, { excludeExtraneousValues: true });
  }

  async uploadAvatar(chatId: number, file: MultipartFile): Promise<ChatDto> {
    const { mimetype } = file;
    const buffer = await file.toBuffer();
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');
    const isValid = await validateAvatar(buffer);
    if (!isValid) throw new BadRequestException('Invalid media format');
    const hash = createHash('sha256').update(buffer).digest('hex');
    const url = await this.chatRepository.uploadAvatar(buffer, hash, mimetype);
    const updatedChat = await this.chatRepository.updateById(chatId, {
      avatarUrl: url,
    });
    return plainToInstance(ChatDto, updatedChat);
  }

  async createMediaMessage(
    userId: number,
    chatId: number,
    file: MultipartFile,
  ): Promise<MessageDto> {
    const [chatRecord, userRecord] = await Promise.all([
      this.chatRepository.findById(chatId),
      this.userRepository.findById(userId),
    ]);
    if (!chatRecord) throw new NotFoundException(`Chat not found`);
    if (!userRecord) throw new NotFoundException('User not found');
    const { file: imageStream } = file;
    const key = randomUUID();
    const sharpInstance = sharp({ animated: true });
    imageStream.pipe(sharpInstance);
    const metadataPromise = sharpInstance.clone().metadata();
    const webpStream = sharpInstance.clone().webp({ quality: 80 });
    const uploadPromise = this.messageRepository.uploadMedia(
      webpStream,
      key,
      'image/webp',
    );
    const [metadata] = await Promise.all([metadataPromise, uploadPromise]);
    await this.messageRepository.createMedia({
      id: key,
      width: metadata.width,
      height: metadata.height,
      mimetype: 'image/webp',
    });
    const message = await this.messageRepository.create({
      chatId: chatId,
      userId: userId,
      isText: false,
      mediaId: key,
    });
    return this.messageMapper.toMessage(message);
  }

  async getMessageFromChat(
    chatId: number,
    dto: PaginatedMessageQueryDto,
  ): Promise<MessageDto[]> {
    const { timestamp, pageSize } = dto;
    const limit = Math.min(pageSize ?? 50, 50);
    const messages = await this.messageRepository.getPaginatedMessages(
      chatId,
      limit,
      timestamp,
    );
    console.dir(messages, { depth: null });
    return this.messageMapper.toMessage(messages);
  }

  async createTextMessage(
    userId: number,
    chatId: number,
    dto: CreateMessageDto,
  ): Promise<MessageDto> {
    const [chatRecord, userRecord] = await Promise.all([
      this.chatRepository.findById(chatId),
      this.userRepository.findById(userId),
    ]);
    if (!chatRecord) throw new NotFoundException(`Chat not found`);
    if (!userRecord) throw new NotFoundException('User not found');
    const message = await this.messageRepository.create({
      chatId,
      userId,
      content: dto.content,
      isText: true,
    });
    return await this.messageMapper.toMessage(message);
  }

  async changeMessage(messageId: number, dto: ChangeMessageDto) {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found');
    if (!message.isText)
      throw new BadRequestException('Cant change media message');
    const updatedMessage = await this.messageRepository.updateById(messageId, {
      isEdited: true,
      content: dto.content,
    });
    return await this.messageMapper.toMessage(updatedMessage);
  }

  async deleteMessage(messageId: number) {
    const deletedMessage = await this.messageRepository.deleteById(messageId);
    return await this.messageMapper.toMessage(deletedMessage);
  }

  async getChatUsers(chatId: number): Promise<ChatUserDto[]> {
    const users = await this.chatRepository.findChatUsers(chatId);
    return users.map((user) => this.chatMapper.fromChatUserWithRole(user));
  }

  async createRole(chatId: number, dto: CreateRoleDto): Promise<RoleDto> {
    const { permissions, name } = dto;
    const existingRoles = await this.roleRepository.findByChatId(chatId);
    if (existingRoles.some((role) => role.name === name))
      throw new BadRequestException(`Role with name: ${name} already exists`);
    const role = await this.roleRepository.createWithPermissions(
      chatId,
      permissions,
      name,
    );

    return this.roleMapper.toRole(role);
  }

  async assignRole(
    chatId: number,
    userId: number,
    dto: AssignRoleDto,
  ): Promise<ChatUserDto> {
    const { roleId } = dto;
    const role = await this.roleRepository.updateUserRole(
      chatId,
      userId,
      roleId,
    );
    return plainToInstance(ChatUserDto, role);
  }

  async addUser(chatId: number, userId: number): Promise<ChatUserDto> {
    const role = await this.roleRepository.findByName(
      chatId,
      DEFAULT_ROLES.USER,
    );
    const { id: roleId } = role!;
    const user = await this.chatRepository.addUser(chatId, userId, roleId);
    const res = plainToInstance(ChatUserDto, user.user);
    return res;
  }

  async getRoles(chatId: number): Promise<RoleDto[]> {
    const roles = await this.roleRepository.findByChatId(chatId);
    return this.roleMapper.toRole(roles);
  }
}
