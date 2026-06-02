/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { BubbleStoryService } from '@/core/BubbleStoryService.js';

export const meta = {
	tags: ['bubble-stories'],
	requireCredential: true,
	kind: 'read:bubble-stories',
	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			optional: false, nullable: false,
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private bubbleStoryService: BubbleStoryService,
	) {
		super(meta, paramDef, async (_ps, me) => {
			// For now return the current user's own active stories.
			// A full implementation would query the following list from FollowingsRepository.
			const stories = await this.bubbleStoryService.getActiveStories(me.id);
			return Promise.all(stories.map(s => this.bubbleStoryService.packStory(s, me)));
		});
	}
}
