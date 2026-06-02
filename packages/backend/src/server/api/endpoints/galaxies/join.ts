/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { GalaxyService } from '@/core/GalaxyService.js';

export const meta = {
	tags: ['galaxies'],
	requireCredential: true,
	kind: 'write:galaxies',
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		galaxyId: { type: 'string', format: 'misskey:id' },
	},
	required: ['galaxyId'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
		private galaxyService: GalaxyService,
	) {
		super(meta, paramDef, async (ps, me) => {
			await this.galaxyService.join(ps.galaxyId, me.id);
			return {};
		});
	}
}
