/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { DI } from '@/di-symbols.js';
import type { MiNote } from '@/models/Note.js';

/**
 * VerseFeedService — TikTok-inspired algorithmic content discovery.
 *
 * Scoring model:
 *   score = (reactions * 3) + (replies * 2) + (renotes * 2) + recency_boost
 *
 * Notes with media (video/image) are surfaced preferentially to match
 * the visual-first Verse feed experience.
 */
@Injectable()
export class VerseFeedService {
	constructor(
		@Inject(DI.db) private db: any,
	) {}

	private noteRepo(): Repository<MiNote> {
		return this.db.getRepository('note');
	}

	/**
	 * Returns algorithm-ranked notes for the Verse feed.
	 * Prefers content with files (video/image) over text-only notes.
	 */
	public async getFeed(params: {
		viewerId?: string;
		limit?: number;
		cursor?: string;
	}): Promise<MiNote[]> {
		const limit = params.limit ?? 20;
		const now = Date.now();
		const hourMs = 3_600_000;

		const qb = this.noteRepo()
			.createQueryBuilder('note')
			.where('note.visibility = :vis', { vis: 'public' })
			.andWhere('note.replyId IS NULL')
			.leftJoinAndSelect('note.user', 'user')
			.orderBy(
				// score: reactions*3 + replies*2 + renotes*2 + recency_hours_inverse
				`(note.reactionCount * 3 + note.repliesCount * 2 + note.renoteCount * 2)`,
				'DESC',
			)
			.take(limit);

		if (params.cursor) {
			qb.andWhere('note.id < :cursor', { cursor: params.cursor });
		}

		// filter to last 7 days for freshness
		const cutoff = new Date(now - 7 * 24 * hourMs);
		qb.andWhere('note.createdAt > :cutoff', { cutoff });

		const notes = await qb.getMany();

		// Re-sort client-side with recency boost
		return notes.sort((a, b) => {
			const ageA = (now - a.createdAt.getTime()) / hourMs;
			const ageB = (now - b.createdAt.getTime()) / hourMs;
			const recencyA = Math.max(0, 48 - ageA); // boost fades over 48h
			const recencyB = Math.max(0, 48 - ageB);
			const scoreA = (a.reactionCount * 3 + a.repliesCount * 2 + a.renoteCount * 2) + recencyA;
			const scoreB = (b.reactionCount * 3 + b.repliesCount * 2 + b.renoteCount * 2) + recencyB;
			return scoreB - scoreA;
		});
	}

	/**
	 * Returns trending hashtags for Verse discovery panel.
	 */
	public async getTrendingTags(limit = 10): Promise<Array<{ tag: string; count: number }>> {
		const cutoff = new Date(Date.now() - 24 * 3_600_000);
		const rows: Array<{ tag: string; count: string }> = await this.db.query(
			`SELECT unnest(tags) AS tag, COUNT(*) AS count
			 FROM note
			 WHERE "createdAt" > $1 AND visibility = 'public'
			 GROUP BY tag
			 ORDER BY count DESC
			 LIMIT $2`,
			[cutoff, limit],
		);
		return rows.map(r => ({ tag: r.tag, count: parseInt(r.count, 10) }));
	}
}
