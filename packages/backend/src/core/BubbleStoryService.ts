/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { DI } from '@/di-symbols.js';
import { IdService } from '@/core/IdService.js';
import type { MiBubbleStory, StoryType } from '@/models/BubbleStory.js';
import type { MiBubbleStoryView } from '@/models/BubbleStoryView.js';
import type { MiUser } from '@/models/User.js';

export type BubbleStoryPacked = {
	id: string;
	createdAt: string;
	expiresAt: string;
	userId: string;
	type: StoryType;
	text: string | null;
	fileId: string | null;
	fileUrl: string | null;
	background: string | null;
	fontStyle: string | null;
	viewsCount: number;
	visibility: string;
	isViewed: boolean;
};

@Injectable()
export class BubbleStoryService {
	constructor(
		@Inject(DI.db) private db: any,
		private idService: IdService,
	) {}

	public async getActiveStories(userId: string): Promise<MiBubbleStory[]> {
		const repo: Repository<MiBubbleStory> = this.db.getRepository('bubble_story');
		return repo.find({
			where: {
				userId,
			},
			order: { createdAt: 'ASC' },
		}).then(stories => stories.filter(s => new Date(s.expiresAt) > new Date()));
	}

	public async getFollowingStories(viewerId: string, followingIds: string[]): Promise<MiBubbleStory[]> {
		if (followingIds.length === 0) return [];
		const repo: Repository<MiBubbleStory> = this.db.getRepository('bubble_story');
		const now = new Date();
		return repo
			.createQueryBuilder('story')
			.where('story.userId IN (:...ids)', { ids: followingIds })
			.andWhere('story.expiresAt > :now', { now })
			.andWhere('story.visibility = :vis', { vis: 'public' })
			.orderBy('story.createdAt', 'DESC')
			.getMany();
	}

	public async createStory(params: {
		userId: string;
		type: StoryType;
		text?: string | null;
		fileId?: string | null;
		background?: string | null;
		fontStyle?: string | null;
		visibility?: string;
	}): Promise<MiBubbleStory> {
		const repo: Repository<MiBubbleStory> = this.db.getRepository('bubble_story');
		const now = new Date();
		const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

		return repo.save({
			id: this.idService.gen(),
			createdAt: now,
			expiresAt,
			userId: params.userId,
			type: params.type,
			text: params.text ?? null,
			fileId: params.fileId ?? null,
			background: params.background ?? null,
			fontStyle: params.fontStyle ?? null,
			visibility: params.visibility ?? 'public',
			viewsCount: 0,
		} as MiBubbleStory);
	}

	public async markSeen(storyId: string, viewerId: string): Promise<void> {
		const storyRepo: Repository<MiBubbleStory> = this.db.getRepository('bubble_story');
		const viewRepo: Repository<MiBubbleStoryView> = this.db.getRepository('bubble_story_view');

		const existing = await viewRepo.findOneBy({ storyId, userId: viewerId });
		if (existing) return;

		await viewRepo.save({
			id: this.idService.gen(),
			viewedAt: new Date(),
			storyId,
			userId: viewerId,
		} as MiBubbleStoryView);

		await storyRepo.increment({ id: storyId }, 'viewsCount', 1);
	}

	public async hasViewed(storyId: string, viewerId: string): Promise<boolean> {
		const viewRepo: Repository<MiBubbleStoryView> = this.db.getRepository('bubble_story_view');
		const v = await viewRepo.findOneBy({ storyId, userId: viewerId });
		return v !== null;
	}

	public async packStory(story: MiBubbleStory, viewer: MiUser | null): Promise<BubbleStoryPacked> {
		const isViewed = viewer ? await this.hasViewed(story.id, viewer.id) : false;
		return {
			id: story.id,
			createdAt: story.createdAt.toISOString(),
			expiresAt: story.expiresAt.toISOString(),
			userId: story.userId,
			type: story.type,
			text: story.text,
			fileId: story.fileId,
			fileUrl: null, // resolved by entity service in practice
			background: story.background,
			fontStyle: story.fontStyle,
			viewsCount: story.viewsCount,
			visibility: story.visibility,
			isViewed,
		};
	}
}
