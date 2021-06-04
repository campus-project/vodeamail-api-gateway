import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { PermissionService } from '../../domain/services/permission.service';

@ValidatorConstraint({ name: 'PermissionExistsRule', async: true })
@Injectable()
export class PermissionExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject('PERMISSION_SERVICE')
    private permissionService: PermissionService,
  ) {}

  async validate(value: string) {
    return await this.permissionService.idExists({
      id: value,
    });
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
