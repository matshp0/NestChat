import { Injectable } from '@nestjs/common';
import { RolesWithPermissions } from '../repositories/role.repository';
import { plainToInstance } from 'class-transformer';
import { RoleDto } from '@repo/utils/response';
import { CHAT_PERMISSIONS } from '@repo/utils/db';

@Injectable()
export class RoleMapper {
  constructor() {}

  toRole(obj: RolesWithPermissions): RoleDto;
  toRole(obj: RolesWithPermissions[]): RoleDto[];

  toRole(
    obj: RolesWithPermissions | RolesWithPermissions[],
  ): RoleDto | RoleDto[] {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.mapOne(item));
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
