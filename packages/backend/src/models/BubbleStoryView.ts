/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PrimaryColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { id } from './util/id.js';
import { MiUser } from './User.js';
import { MiBubbleStory } from './BubbleStory.js';

/**
 * Tracks which users have viewed a given Bubble Story.
 */
@Index(['storyId', 'userId'], { unique: true })
@Entity('bubble_story_view')
export class MiBubbleStoryView {
	@PrimaryColumn(id())
	public id: string;

	@Index()
	@Column('timestamp with time zone')
	public viewedAt: Date;

	@Index()
	@Column(id())
	public storyId: MiBubbleStory['id'];

	@ManyToOne(() => MiBubbleStory, { onDelete: 'CASCADE' })
	@JoinColumn()
	public story: MiBubbleStory | null;

	@Index()
	@Column(id())
	public userId: MiUser['id'];

	@ManyToOne(() => MiUser, { onDelete: 'CASCADE' })
	@JoinColumn()
	public user: MiUser | null;
}
