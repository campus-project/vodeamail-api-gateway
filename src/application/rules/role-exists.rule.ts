import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'RoleExistsRule', async: true })
@Injectable()
export class RoleExistsRule implements ValidatorConstraintInterface {
  // constructor(
  //   @Inject('CLIENT_KAFKA')
  //   private readonly clientKafka: ClientKafka,
  // ) {}
  //
  // async onModuleInit() {
  //   const patterns = ['existsRole'];
  //
  //   for (const pattern of patterns) {
  //     this.clientKafka.subscribeToResponseOf(pattern);
  //   }
  //
  //   await this.clientKafka.connect();
  // }

  async validate(value: string, args: ValidationArguments) {
    //todo: validate role
    return true;
    /*if (!value) {
      return false;
    }

    const result = await this.clientKafka
      .send('existsRole', {
        id: value,
        organization_id: (args.object as any)['organization_id'],
      })
      .toPromise();

    //todo: https://github.com/nestjs/nest/issues/7185

    console.log(result);

    return result === 'true';*/
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is invalid.`;
  }
}
