import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@ValidatorConstraint({ name: 'RoleExistsRule', async: true })
@Injectable()
export class RoleExistsRule implements ValidatorConstraintInterface {
  constructor(
    @Inject('ACCOUNT_SERVICE')
    private readonly accountService: ClientProxy,
  ) {}

  async validate(value: string, args: ValidationArguments) {
    //todo: cannot get organization id, because organization id get from token
    return true;
    /*console.log('value', value);
    // //todo: validate role
    // return true;
    if (!value) {
      return false;
    }

    return await this.accountService
      .send('existsRole', {
        id: value,
        organization_id: (args.object as any)['organization_id'],
      })
      .toPromise();*/
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
