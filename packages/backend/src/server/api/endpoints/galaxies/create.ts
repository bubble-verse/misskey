/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import ms from 'ms';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { GalaxyService } from '@/core/GalaxyService.js';
import { galaxyCategories } from '@/models/Galaxy.js';

export const meta = {
	tags: ['galaxies'],
	requireCredential: true,
	prohibitMoved: true,
	kind: 'write:galaxies',
	limit: {
		duration: ms('1hour'),
		max: 5,
	},
	res: {
		type: 'object',
		optional: false, nullable: false,
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		name: { type: 'string', minLength: 1, maxLength: 128 },
		description: { type: 'string', nullable: true, minLength: 1, maxLength: 2048 },
		category: { type: 'string', enum: galaxyCategories, default: 'general' },
		isPrivate: { type: 'boolean', default: false },
		color: { type: 'string', minLength: 4, maxLength: 16 },
		tags: { type: 'array', items: { type: 'string', maxLength: 64 }, maxItems: 10 },
	},
	required: ['name'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private galaxyService: GalaxyService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const galaxy = await this.galaxyService.create({
				ownerId: me.id,
				name: ps.name,
				description: ps.description ?? null,
				category: (ps.category as any) ?? 'general',
				isPrivate: ps.isPrivate ?? false,
				color: ps.color ?? '#7c3aed',
				tags: ps.tags ?? [],
			});

			return this.galaxyService.pack(galaxy, me);
		});
	}
}
