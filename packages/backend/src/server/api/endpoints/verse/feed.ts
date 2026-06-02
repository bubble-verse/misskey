/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { VerseFeedService } from '@/core/VerseFeedService.js';

export const meta = {
	tags: ['verse'],
	requireCredential: false,
	res: {
		type: 'object',
		optional: false, nullable: false,
		properties: {
			notes: {
				type: 'array',
				items: { type: 'object' },
			},
			trendingTags: {
				type: 'array',
				items: { type: 'object' },
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 50, default: 20 },
		cursor: { type: 'string', format: 'misskey:id', nullable: true },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private verseFeedService: VerseFeedService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const [notes, trendingTags] = await Promise.all([
				this.verseFeedService.getFeed({
					viewerId: me?.id,
					limit: ps.limit ?? 20,
					cursor: ps.cursor ?? undefined,
				}),
				this.verseFeedService.getTrendingTags(10),
			]);

			return {
				notes: notes.map(n => ({
					id: n.id,
					createdAt: n.createdAt.toISOString(),
					userId: n.userId,
					text: n.text,
					reactionCount: n.reactionCount,
					repliesCount: n.repliesCount,
					renoteCount: n.renoteCount,
					fileIds: n.fileIds,
					tags: n.tags,
				})),
				trendingTags,
			};
		});
	}
}
