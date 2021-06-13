import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GateSettingPermission } from './gate-setting-permission.entity';

@Entity('gate_settings')
export class GateSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  organization_id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'timestamp' })
  valid_from: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @CreateDateColumn()
  created_at: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @UpdateDateColumn()
  updated_at: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at?: string;

  @Column({ type: 'uuid', nullable: true })
  deleted_by?: string;

  @OneToMany(() => GateSettingPermission, (object) => object.gate_setting, {
    onUpdate: 'CASCADE',
  })
  gate_setting_permissions: GateSettingPermission[];
}
