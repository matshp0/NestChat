import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatRepository } from 'src/data/repositories/chat.repository';
import { validateAvatar } from 'src/common/helpers/files/validateAvatar';
import { createHash } from 'crypto';
import { MessageRepository } from 'src/data/repositories/message.repository';
import { UserRepository } from 'src/data/repositories/user.repository';
import { MessageMapper } from 'src/data/mappers/message.mapper';
import { MulterS3File } from 'src/common/types/multerS3File.type';
import { CreateMessageDto } from './dto/createMessage.dto';
import { CreateChatDto } from './dto/createChat.dto';
import { ChangeMessageDto } from './dto/changeMessage.dto';
import { PaginatedMessageQueryDto } from './dto/paginatedMessagesQuery.dto';
import { CreateRoleDto } from './dto/createRole.dto';
import { RoleRepository } from 'src/data/repositories/role.repository';
import { AssignRoleDto } from './dto/assignRole.dto';
import {
  DEFAULT_ROLES,
  DEFAULT_ROLES_PERMISSIONS,
} from 'src/common/enums/defaultRoles';
import { ChatMapper } from 'src/data/mappers/chat.mapper';
import { RoleMapper } from 'src/data/mappers/role.mapper';
import { plainToInstance } from 'class-transformer';
import { ChatUserDto } from './dto/ChatUser.dto';
import { ChatDto } from './dto/chat.dto';
import { RoleDto } from './dto/role.dto';
import { MessageDto } from './dto/message.dto';

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

  async uploadAvatar(
    chatId: number,
    avatar?: Express.Multer.File,
  ): Promise<ChatDto> {
    if (!avatar) throw new BadRequestException('No file uploaded');
    const { buffer, mimetype } = avatar;
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
    media?: MulterS3File,
  ): Promise<MessageDto> {
    if (!media) throw new BadRequestException('File expected');
    const [chatRecord, userRecord] = await Promise.all([
      this.chatRepository.findById(chatId),
      this.userRepository.findById(userId),
    ]);
    if (!chatRecord) throw new NotFoundException(`Chat not found`);
    if (!userRecord) throw new NotFoundException('User not found');
    const message = await this.messageRepository.create({
      chatId,
      userId,
      isText: false,
      s3Id: media.key,
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
