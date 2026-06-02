/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiGalaxy } from './Galaxy.js';

export const galaxyRoles = ['owner', 'moderator', 'member'] as const;
export type GalaxyRole = typeof galaxyRoles[number];

/**
 * Records a user's membership in a Galaxy.
 */
@Index(['galaxyId', 'userId'], { unique: true })
@Entity('galaxy_member')
export class MiGalaxyMember {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone')
	public joinedAt: Date;

	@Index()
	@Column(id())
	public galaxyId: MiGalaxy['id'];

	@ManyToOne(() => MiGalaxy, { onDelete: 'CASCADE' })
	@JoinColumn()
	public galaxy: MiGalaxy | null;

	@Index()
	@Column(id())
	public userId: MiUser['id'];

	@ManyToOne(() => MiUser, { onDelete: 'CASCADE' })
	@JoinColumn()
	public user: MiUser | null;

	@Column('varchar', {
		length: 16,
		default: 'member',
	})
	public role: GalaxyRole;
}
