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
	kind: 'write:bubble-stories',
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		storyId: { type: 'string', format: 'misskey:id' },
	},
	required: ['storyId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private bubbleStoryService: BubbleStoryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			await this.bubbleStoryService.markSeen(ps.storyId, me.id);
			return {};
		});
	}
}
