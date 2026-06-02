/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { BubbleStoryService } from '@/core/BubbleStoryService.js';
import { storyTypes } from '@/models/BubbleStory.js';

export const meta = {
	tags: ['bubble-stories'],
	requireCredential: true,
	prohibitMoved: true,
	kind: 'write:bubble-stories',
	limit: {
		duration: ms('1hour'),
		max: 20,
	},
	res: {
		type: 'object',
		optional: false, nullable: false,
	},
	errors: {
		invalidType: {
			message: 'Invalid story type.',
			code: 'INVALID_TYPE',
			id: 'a1b2c3d4-0001-0001-0001-000000000001',
		},
		missingContent: {
			message: 'Either text or fileId is required.',
			code: 'MISSING_CONTENT',
			id: 'a1b2c3d4-0001-0001-0001-000000000002',
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		type: { type: 'string', enum: storyTypes },
		text: { type: 'string', nullable: true, maxLength: 500 },
		fileId: { type: 'string', format: 'misskey:id', nullable: true },
		background: { type: 'string', nullable: true, maxLength: 512 },
		fontStyle: { type: 'string', nullable: true, maxLength: 64 },
		visibility: { type: 'string', enum: ['public', 'followers'], default: 'public' },
	},
	required: ['type'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private bubbleStoryService: BubbleStoryService,
	) {
		super(meta, paramDef, async (ps, me) => {
			if (ps.type === 'text' && !ps.text) {
				throw this.error(meta.errors.missingContent);
			}
			if ((ps.type === 'image' || ps.type === 'video') && !ps.fileId) {
				throw this.error(meta.errors.missingContent);
			}

			const story = await this.bubbleStoryService.createStory({
				userId: me.id,
				type: ps.type,
				text: ps.text ?? null,
				fileId: ps.fileId ?? null,
				background: ps.background ?? null,
				fontStyle: ps.fontStyle ?? null,
				visibility: ps.visibility ?? 'public',
			});

			return this.bubbleStoryService.packStory(story, me);
		});
	}

	private error(err: { message: string; code: string; id: string }) {
		const e = new Error(err.message) as any;
		e.code = err.code;
		e.id = err.id;
		return e;
	}
}
