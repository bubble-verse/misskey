/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { DI } from '@/di-symbols.js';
import { IdService } from '@/core/IdService.js';
import type { MiGalaxy, GalaxyCategory } from '@/models/Galaxy.js';
import type { MiGalaxyMember } from '@/models/GalaxyMember.js';
import type { MiUser } from '@/models/User.js';

export type GalaxyPacked = {
	id: string;
	createdAt: string;
	ownerId: string | null;
	name: string;
	description: string | null;
	category: GalaxyCategory;
	bannerId: string | null;
	bannerUrl: string | null;
	iconId: string | null;
	iconUrl: string | null;
	color: string;
	isPrivate: boolean;
	membersCount: number;
	notesCount: number;
	isArchived: boolean;
	tags: string[];
	isMember: boolean;
	isOwner: boolean;
};

@Injectable()
export class GalaxyService {
	constructor(
		@Inject(DI.db) private db: any,
		private idService: IdService,
	) {}

	private repo(): Repository<MiGalaxy> {
		return this.db.getRepository('galaxy');
	}

	private memberRepo(): Repository<MiGalaxyMember> {
		return this.db.getRepository('galaxy_member');
	}

	public async create(params: {
		ownerId: string;
		name: string;
		description?: string | null;
		category?: GalaxyCategory;
		isPrivate?: boolean;
		color?: string;
		tags?: string[];
	}): Promise<MiGalaxy> {
		const galaxy = await this.repo().save({
			id: this.idService.gen(),
			createdAt: new Date(),
			ownerId: params.ownerId,
			name: params.name,
			description: params.description ?? null,
			category: params.category ?? 'general',
			isPrivate: params.isPrivate ?? false,
			color: params.color ?? '#7c3aed',
			membersCount: 1,
			notesCount: 0,
			pinnedNoteIds: [],
			isArchived: false,
			tags: params.tags ?? [],
		} as MiGalaxy);

		// auto-join as owner
		await this.memberRepo().save({
			id: this.idService.gen(),
			joinedAt: new Date(),
			galaxyId: galaxy.id,
			userId: params.ownerId,
			role: 'owner',
		} as MiGalaxyMember);

		return galaxy;
	}

	public async join(galaxyId: string, userId: string): Promise<void> {
		const existing = await this.memberRepo().findOneBy({ galaxyId, userId });
		if (existing) return;

		await this.memberRepo().save({
			id: this.idService.gen(),
			joinedAt: new Date(),
			galaxyId,
			userId,
			role: 'member',
		} as MiGalaxyMember);

		await this.repo().increment({ id: galaxyId }, 'membersCount', 1);
	}

	public async leave(galaxyId: string, userId: string): Promise<void> {
		const member = await this.memberRepo().findOneBy({ galaxyId, userId });
		if (!member) return;
		if (member.role === 'owner') return; // owner cannot leave

		await this.memberRepo().delete({ galaxyId, userId });
		await this.repo().decrement({ id: galaxyId }, 'membersCount', 1);
	}

	public async isMember(galaxyId: string, userId: string): Promise<boolean> {
		const m = await this.memberRepo().findOneBy({ galaxyId, userId });
		return m !== null;
	}

	public async getFeatured(limit = 20): Promise<MiGalaxy[]> {
		return this.repo().find({
			where: { isArchived: false, isPrivate: false },
			order: { membersCount: 'DESC' },
			take: limit,
		});
	}

	public async pack(galaxy: MiGalaxy, viewer: MiUser | null): Promise<GalaxyPacked> {
		const isMember = viewer ? await this.isMember(galaxy.id, viewer.id) : false;
		const isOwner = viewer ? galaxy.ownerId === viewer.id : false;
		return {
			id: galaxy.id,
			createdAt: galaxy.createdAt.toISOString(),
			ownerId: galaxy.ownerId,
			name: galaxy.name,
			description: galaxy.description,
			category: galaxy.category,
			bannerId: galaxy.bannerId,
			bannerUrl: null,
			iconId: galaxy.iconId,
			iconUrl: null,
			color: galaxy.color,
			isPrivate: galaxy.isPrivate,
			membersCount: galaxy.membersCount,
			notesCount: galaxy.notesCount,
			isArchived: galaxy.isArchived,
			tags: galaxy.tags,
			isMember,
			isOwner,
		};
	}
}
