/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiDriveFile } from './DriveFile.js';

export const galaxyCategories = [
	'general', 'technology', 'gaming', 'music', 'art', 'sports',
	'food', 'travel', 'education', 'business', 'entertainment', 'other',
] as const;
export type GalaxyCategory = typeof galaxyCategories[number];

/**
 * Galaxy — decentralized community space inspired by Facebook Groups.
 * Each Galaxy is a federated community where members share content.
 */
@Entity('galaxy')
export class MiGalaxy {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone')
	public createdAt: Date;

	@Index()
	@Column({
		...id(),
		nullable: true,
		comment: 'Owner user ID.',
	})
	public ownerId: MiUser['id'] | null;

	@ManyToOne(() => MiUser, { onDelete: 'SET NULL' })
	@JoinColumn()
	public owner: MiUser | null;

	@Column('varchar', {
		length: 128,
		comment: 'Galaxy name.',
	})
	public name: string;

	@Column('varchar', {
		length: 2048, nullable: true,
		comment: 'Galaxy description.',
	})
	public description: string | null;

	@Column('varchar', {
		length: 32,
		default: 'general',
		comment: 'Galaxy category.',
	})
	public category: GalaxyCategory;

	@Column({
		...id(),
		nullable: true,
	})
	public bannerId: MiDriveFile['id'] | null;

	@ManyToOne(() => MiDriveFile, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn()
	public banner: MiDriveFile | null;

	@Column({
		...id(),
		nullable: true,
	})
	public iconId: MiDriveFile['id'] | null;

	@ManyToOne(() => MiDriveFile, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn()
	public icon: MiDriveFile | null;

	@Column('varchar', {
		length: 16,
		default: '#7c3aed',
		comment: 'Accent color for the Galaxy.',
	})
	public color: string;

	@Index()
	@Column('boolean', {
		default: false,
		comment: 'Whether new members need approval to join.',
	})
	public isPrivate: boolean;

	@Index()
	@Column('integer', {
		default: 0,
		comment: 'Total member count.',
	})
	public membersCount: number;

	@Index()
	@Column('integer', {
		default: 0,
		comment: 'Total notes/posts count.',
	})
	public notesCount: number;

	@Column('varchar', {
		array: true, length: 128, default: '{}',
		comment: 'Pinned note IDs.',
	})
	public pinnedNoteIds: string[];

	@Index()
	@Column('boolean', {
		default: false,
	})
	public isArchived: boolean;

	@Column('varchar', {
		array: true, length: 256, default: '{}',
		comment: 'Tags/keywords for this Galaxy.',
	})
	public tags: string[];
}
