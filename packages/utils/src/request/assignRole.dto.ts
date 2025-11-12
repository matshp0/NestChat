import { IsNumber } from 'class-validator';

export class AssignRoleDto {
  @IsNumber()
  roleId: number;
}
