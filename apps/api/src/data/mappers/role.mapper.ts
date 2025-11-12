import { Injectable } from '@nestjs/common';
import { RolesWithPermissions } from '../repositories/role.repository';
import { plainToInstance } from 'class-transformer';
import { RoleDto } from '@repo/utils/response';
import { CHAT_PERMISSIONS } from '@repo/utils/db';

@Injectable()
export class RoleMapper {
  constructor() {}

  async toRole(obj: RolesWithPermissions): Promise<RoleDto>;
  async toRole(obj: RolesWithPermissions[]): Promise<RoleDto[]>;

  async toRole(
    obj: RolesWithPermissions | RolesWithPermissions[],
  ): Promise<RoleDto | RoleDto[]> {
    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item) => this.mapOne(item)));
    }
    return this.mapOne(obj);
  }

  private mapOne(role: RolesWithPermissions): RoleDto {
    const dto = plainToInstance(RoleDto, role, {
      excludeExtraneousValues: true,
    });

    dto.permisions = role.permissions.map(
      (p) => p.permission.name as CHAT_PERMISSIONS,
    );

    return dto;
  }
}
