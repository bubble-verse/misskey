/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiDriveFile } from './DriveFile.js';

export const storyTypes = ['image', 'video', 'text'] as const;
export type StoryType = typeof storyTypes[number];

/**
 * Bubble Story — ephemeral 24-hour content inspired by Instagram Stories.
 * Each story expires automatically after expiresAt.
 */
@Entity('bubble_story')
export class MiBubbleStory {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone')
	public createdAt: Date;

	@Index()
	@Column('timestamp with time zone')
	public expiresAt: Date;

	@Index()
	@Column(id())
	public userId: MiUser['id'];

	@ManyToOne(() => MiUser, { onDelete: 'CASCADE' })
	@JoinColumn()
	public user: MiUser | null;

	@Column('varchar', {
		length: 16,
		default: 'image',
	})
	public type: StoryType;

	@Column('text', { nullable: true })
	public text: string | null;

	@Column({
		...id(),
		nullable: true,
	})
	public fileId: MiDriveFile['id'] | null;

	@ManyToOne(() => MiDriveFile, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn()
	public file: MiDriveFile | null;

	@Column('varchar', {
		length: 512, nullable: true,
		comment: 'Optional background color or gradient for text stories.',
	})
	public background: string | null;

	@Column('varchar', {
		length: 64, nullable: true,
		comment: 'Font style for text stories.',
	})
	public fontStyle: string | null;

	@Column('integer', {
		default: 0,
		comment: 'Total view count.',
	})
	public viewsCount: number;

	@Index()
	@Column('varchar', {
		length: 64,
		default: 'public',
		comment: 'Visibility: public, followers, specified',
	})
	public visibility: string;
}
