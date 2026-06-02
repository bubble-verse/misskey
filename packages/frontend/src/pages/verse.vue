<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  Verse — TikTok-inspired algorithmic discovery feed.
  Shows a masonry/card grid of trending content ranked by engagement + recency.
  Right sidebar shows trending tags.
-->
<template>
<PageWithHeader :actions="headerActions">
	<MkSpacer :contentMax="1100">
		<div :class="$style.layout">
			<!-- Main feed -->
			<div :class="$style.feed">
				<!-- Trending bar -->
				<div v-if="trendingTags.length" :class="$style.trendingBar">
					<span :class="$style.trendingLabel"><i class="ti ti-trending-up"></i> {{ i18n.ts.trending }}</span>
					<div :class="$style.tagList">
						<button
							v-for="t in trendingTags"
							:key="t.tag"
							:class="[$style.trendTag, activeTag === t.tag ? $style.trendTagActive : '']"
							@click="toggleTag(t.tag)"
						>#{{ t.tag }} <span :class="$style.tagCount">{{ fmtCount(t.count) }}</span></button>
					</div>
				</div>

				<MkLoading v-if="loading" />

				<div v-else-if="notes.length === 0" :class="$style.empty">
					<i class="ti ti-universe" style="font-size:48px; color: var(--fgTransparentWeak);" />
					<p>{{ i18n.ts.noVerseContent }}</p>
				</div>

				<div v-else :class="$style.grid">
					<BvVerseCard
						v-for="note in filteredNotes"
						:key="note.id"
						:note="note"
						@open="openNote"
						@react="reactNote"
						@reply="replyNote"
						@renote="renoteNote"
						@share="shareNote"
						@tag="toggleTag"
					/>
				</div>

				<div v-if="!loading && notes.length > 0" :class="$style.loadMore">
					<MkButton :loading="loadingMore" rounded @click="loadMore">
						{{ i18n.ts.loadMore }}
					</MkButton>
				</div>
			</div>

			<!-- Sidebar -->
			<aside :class="$style.sidebar">
				<div :class="$style.sideCard">
					<h3 :class="$style.sideTitle"><i class="ti ti-flame"></i> {{ i18n.ts.trendingTags }}</h3>
					<ul :class="$style.sideTagList">
						<li
							v-for="(t, idx) in trendingTags"
							:key="t.tag"
							:class="$style.sideTagItem"
							@click="toggleTag(t.tag)"
						>
							<span :class="$style.sideTagRank">{{ idx + 1 }}</span>
							<div :class="$style.sideTagInfo">
								<span :class="$style.sideTagName">#{{ t.tag }}</span>
								<span :class="$style.sideTagCount">{{ fmtCount(t.count) }} posts</span>
							</div>
						</li>
					</ul>
				</div>

				<div :class="$style.sideCard">
					<h3 :class="$style.sideTitle"><i class="ti ti-info-circle"></i> {{ i18n.ts.aboutVerse }}</h3>
					<p :class="$style.sideDesc">{{ i18n.ts.verseDescription }}</p>
				</div>
			</aside>
		</div>
	</MkSpacer>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import BvVerseCard from '@/components/BvVerseCard.vue';
import MkButton from '@/components/MkButton.vue';
import MkLoading from '@/components/global/MkLoading.vue';
import { i18n } from '@/i18n.js';
import * as os from '@/os.js';
import { definePage } from '@/page.js';

type VerseNote = {
	id: string;
	createdAt: string;
	userId: string;
	text: string | null;
	reactionCount: number;
	repliesCount: number;
	renoteCount: number;
	fileIds: string[];
	tags: string[];
	user?: any;
};

type TrendTag = { tag: string; count: number };

const loading = ref(true);
const loadingMore = ref(false);
const notes = ref<VerseNote[]>([]);
const trendingTags = ref<TrendTag[]>([]);
const activeTag = ref<string | null>(null);
const cursor = ref<string | null>(null);

const headerActions = [{
	icon: 'ti ti-refresh',
	text: i18n.ts.refresh,
	handler: () => loadFeed(true),
}];

const filteredNotes = computed(() => {
	if (!activeTag.value) return notes.value;
	return notes.value.filter(n => n.tags?.includes(activeTag.value!));
});

async function loadFeed(reset = false) {
	loading.value = reset || notes.value.length === 0;
	try {
		const res = await os.api('verse/feed', {
			limit: 20,
			cursor: reset ? null : cursor.value,
		}) as { notes: VerseNote[]; trendingTags: TrendTag[] };

		if (reset) {
			notes.value = res.notes;
		} else {
			notes.value.push(...res.notes);
		}
		trendingTags.value = res.trendingTags;
		cursor.value = res.notes[res.notes.length - 1]?.id ?? null;
	} catch {
		// Graceful fallback
		notes.value = [];
		trendingTags.value = [];
	} finally {
		loading.value = false;
	}
}

async function loadMore() {
	loadingMore.value = true;
	await loadFeed();
	loadingMore.value = false;
}

function toggleTag(tag: string) {
	activeTag.value = activeTag.value === tag ? null : tag;
}

function openNote(note: VerseNote) {
	os.pageWindow(`/notes/${note.id}`);
}

function reactNote(note: VerseNote) {
	os.pageWindow(`/notes/${note.id}`);
}

function replyNote(note: VerseNote) {
	os.pageWindow(`/notes/${note.id}`);
}

function renoteNote(note: VerseNote) {
	os.pageWindow(`/notes/${note.id}`);
}

async function shareNote(note: VerseNote) {
	const url = `${location.origin}/notes/${note.id}`;
	if (navigator.share) {
		await navigator.share({ url });
	} else {
		await navigator.clipboard.writeText(url);
		os.toast(i18n.ts.copied);
	}
}

function fmtCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return String(n);
}

onMounted(() => loadFeed(true));

definePage(() => ({
	title: i18n.ts.verse,
	icon: 'ti ti-universe',
}));
</script>

<style module lang="scss">
.layout {
	display: grid;
	grid-template-columns: 1fr 280px;
	gap: 24px;
	align-items: start;

	@media (max-width: 768px) {
		grid-template-columns: 1fr;
	}
}

.feed {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.trendingBar {
	background: var(--panel);
	border-radius: var(--radius);
	padding: 12px 16px;
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.trendingLabel {
	font-size: 13px;
	font-weight: 600;
	color: var(--accent);
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.tagList {
	display: flex;
	gap: 6px;
	flex-wrap: wrap;
}

.trendTag {
	font-size: 12px;
	padding: 3px 10px;
	border-radius: 99px;
	border: 1px solid var(--divider);
	background: none;
	cursor: pointer;
	color: var(--fg);
	transition: all 0.15s;
	display: flex;
	align-items: center;
	gap: 4px;

	&:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
}

.trendTagActive {
	background: var(--accent) !important;
	color: #fff !important;
	border-color: var(--accent) !important;
}

.tagCount {
	font-size: 10px;
	opacity: 0.7;
}

.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 64px 24px;
	text-align: center;
	color: var(--fgTransparentWeak);
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 16px;
}

.loadMore {
	display: flex;
	justify-content: center;
	padding: 16px 0;
}

/* Sidebar */
.sidebar {
	display: flex;
	flex-direction: column;
	gap: 16px;
	position: sticky;
	top: 16px;

	@media (max-width: 768px) {
		display: none;
	}
}

.sideCard {
	background: var(--panel);
	border-radius: var(--radius);
	padding: 16px;
}

.sideTitle {
	font-size: 14px;
	font-weight: 700;
	color: var(--fg);
	margin: 0 0 12px;
	display: flex;
	align-items: center;
	gap: 6px;

	i { color: var(--accent); }
}

.sideTagList {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.sideTagItem {
	display: flex;
	align-items: center;
	gap: 10px;
	cursor: pointer;
	padding: 4px 0;
	border-radius: 6px;
	transition: background 0.15s;

	&:hover { background: var(--accentedBg); padding-left: 6px; }
}

.sideTagRank {
	font-size: 13px;
	font-weight: 700;
	color: var(--fgTransparentWeak);
	width: 20px;
	text-align: center;
}

.sideTagInfo {
	display: flex;
	flex-direction: column;
}

.sideTagName {
	font-size: 13px;
	font-weight: 600;
	color: var(--accent);
}

.sideTagCount {
	font-size: 11px;
	color: var(--fgTransparentWeak);
}

.sideDesc {
	font-size: 13px;
	color: var(--fgTransparentWeak);
	line-height: 1.6;
	margin: 0;
}
</style>
