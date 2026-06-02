/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { GalaxyService } from '@/core/GalaxyService.js';

export const meta = {
	tags: ['galaxies'],
	requireCredential: false,
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
	properties: {
		limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private galaxyService: GalaxyService,
	) {
		super(meta, paramDef, async (ps, me) => {
			const galaxies = await this.galaxyService.getFeatured(ps.limit ?? 20);
			return Promise.all(galaxies.map(g => this.galaxyService.pack(g, me)));
		});
	}
}
