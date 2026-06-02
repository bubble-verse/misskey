/*
 * SPDX-FileCopyrightText: bubble-verse contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Migration: Create Bubble Verse tables
 *   - bubble_story       : ephemeral 24-hour stories
 *   - bubble_story_view  : per-user story view tracking
 *   - galaxy             : federated community spaces
 *   - galaxy_member      : galaxy membership records
 */
export class BubbleVerse1748870400000 {
	name = 'BubbleVerse1748870400000';

	async up(queryRunner) {
		// ── bubble_story ──────────────────────────────────────────────────────
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "bubble_story" (
				"id"          character varying(32)  NOT NULL,
				"createdAt"   TIMESTAMP WITH TIME ZONE NOT NULL,
				"expiresAt"   TIMESTAMP WITH TIME ZONE NOT NULL,
				"userId"      character varying(32)  NOT NULL,
				"type"        character varying(16)  NOT NULL DEFAULT 'image',
				"text"        text,
				"fileId"      character varying(32),
				"background"  character varying(512),
				"fontStyle"   character varying(64),
				"viewsCount"  integer                NOT NULL DEFAULT 0,
				"visibility"  character varying(64)  NOT NULL DEFAULT 'public',
				CONSTRAINT "PK_bubble_story" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bubble_story_userId"    ON "bubble_story" ("userId")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bubble_story_expiresAt" ON "bubble_story" ("expiresAt")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bubble_story_createdAt" ON "bubble_story" ("createdAt")`);

		// ── bubble_story_view ─────────────────────────────────────────────────
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "bubble_story_view" (
				"id"       character varying(32)       NOT NULL,
				"viewedAt" TIMESTAMP WITH TIME ZONE    NOT NULL,
				"storyId"  character varying(32)       NOT NULL,
				"userId"   character varying(32)       NOT NULL,
				CONSTRAINT "PK_bubble_story_view" PRIMARY KEY ("id"),
				CONSTRAINT "UQ_bubble_story_view_story_user" UNIQUE ("storyId", "userId")
			)
		`);

		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bubble_story_view_storyId" ON "bubble_story_view" ("storyId")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_bubble_story_view_userId"  ON "bubble_story_view" ("userId")`);

		// ── galaxy ────────────────────────────────────────────────────────────
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "galaxy" (
				"id"            character varying(32)   NOT NULL,
				"createdAt"     TIMESTAMP WITH TIME ZONE NOT NULL,
				"ownerId"       character varying(32),
				"name"          character varying(128)  NOT NULL,
				"description"   character varying(2048),
				"category"      character varying(32)   NOT NULL DEFAULT 'general',
				"bannerId"      character varying(32),
				"iconId"        character varying(32),
				"color"         character varying(16)   NOT NULL DEFAULT '#7c3aed',
				"isPrivate"     boolean                 NOT NULL DEFAULT false,
				"membersCount"  integer                 NOT NULL DEFAULT 0,
				"notesCount"    integer                 NOT NULL DEFAULT 0,
				"pinnedNoteIds" character varying(128)[] NOT NULL DEFAULT '{}',
				"isArchived"    boolean                 NOT NULL DEFAULT false,
				"tags"          character varying(256)[] NOT NULL DEFAULT '{}',
				CONSTRAINT "PK_galaxy" PRIMARY KEY ("id")
			)
		`);

		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_galaxy_ownerId"      ON "galaxy" ("ownerId")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_galaxy_isPrivate"    ON "galaxy" ("isPrivate")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_galaxy_membersCount" ON "galaxy" ("membersCount")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_galaxy_isArchived"   ON "galaxy" ("isArchived")`);

		// ── galaxy_member ─────────────────────────────────────────────────────
		await queryRunner.query(`
			CREATE TABLE IF NOT EXISTS "galaxy_member" (
				"id"        character varying(32)       NOT NULL,
				"joinedAt"  TIMESTAMP WITH TIME ZONE    NOT NULL,
				"galaxyId"  character varying(32)       NOT NULL,
				"userId"    character varying(32)       NOT NULL,
				"role"      character varying(16)       NOT NULL DEFAULT 'member',
				CONSTRAINT "PK_galaxy_member"              PRIMARY KEY ("id"),
				CONSTRAINT "UQ_galaxy_member_galaxy_user"  UNIQUE ("galaxyId", "userId")
			)
		`);

		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_galaxy_member_galaxyId" ON "galaxy_member" ("galaxyId")`);
		await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_galaxy_member_userId"   ON "galaxy_member" ("userId")`);
	}

	async down(queryRunner) {
		await queryRunner.query(`DROP TABLE IF EXISTS "galaxy_member"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "galaxy"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "bubble_story_view"`);
		await queryRunner.query(`DROP TABLE IF EXISTS "bubble_story"`);
	}
}
