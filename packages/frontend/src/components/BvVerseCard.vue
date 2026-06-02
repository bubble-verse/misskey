<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  BvVerseCard — a single content card in the Verse (algorithmic) feed.
  Displays note with engagement stats, visual-first layout.
  Inspired by TikTok's For You Page card design.
-->
<template>
<div :class="$style.card">
	<!-- Media preview -->
	<div v-if="hasMedia" :class="$style.mediaWrap" @click="emit('open', note)">
		<img
			v-if="isImage"
			:class="$style.mediaImg"
			:src="note.fileIds[0]"
			alt=""
			loading="lazy"
		/>
		<div v-else-if="isVideo" :class="$style.videoThumb">
			<i class="ti ti-player-play-filled" :class="$style.playIcon" />
		</div>
		<div :class="$style.mediaOverlay" />
	</div>

	<!-- Content -->
	<div :class="$style.body">
		<!-- Author row -->
		<div :class="$style.authorRow">
			<img :class="$style.avatar" :src="note.user?.avatarUrl ?? '/static-assets/avatar.png'" alt="" />
			<div :class="$style.authorInfo">
				<span :class="$style.displayName">{{ note.user?.name ?? note.user?.username }}</span>
				<span :class="$style.username">@{{ note.user?.username }}</span>
			</div>
			<span :class="$style.timeAgo">{{ timeAgo }}</span>
		</div>

		<!-- Text -->
		<p v-if="note.text" :class="$style.text">{{ truncated }}</p>

		<!-- Tags -->
		<div v-if="note.tags?.length" :class="$style.tags">
			<span v-for="tag in note.tags.slice(0, 5)" :key="tag" :class="$style.tag" @click.stop="emit('tag', tag)">#{{ tag }}</span>
		</div>

		<!-- Engagement stats -->
		<div :class="$style.stats">
			<button :class="$style.statBtn" @click.stop="emit('react', note)">
				<i class="ti ti-mood-heart"></i>
				<span>{{ fmt(note.reactionCount) }}</span>
			</button>
			<button :class="$style.statBtn" @click.stop="emit('reply', note)">
				<i class="ti ti-message-circle"></i>
				<span>{{ fmt(note.repliesCount) }}</span>
			</button>
			<button :class="$style.statBtn" @click.stop="emit('renote', note)">
				<i class="ti ti-repeat"></i>
				<span>{{ fmt(note.renoteCount) }}</span>
			</button>
			<button :class="$style.statBtn" @click.stop="emit('share', note)">
				<i class="ti ti-share"></i>
			</button>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

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
	user?: {
		username: string;
		name: string | null;
		avatarUrl: string | null;
	};
};

const props = defineProps<{ note: VerseNote }>();
const emit = defineEmits<{
	open: [note: VerseNote];
	react: [note: VerseNote];
	reply: [note: VerseNote];
	renote: [note: VerseNote];
	share: [note: VerseNote];
	tag: [tag: string];
}>();

const hasMedia = computed(() => props.note.fileIds?.length > 0);
const isImage = computed(() => hasMedia.value); // simplified; real impl checks MIME
const isVideo = computed(() => false);

const truncated = computed(() => {
	const t = props.note.text ?? '';
	return t.length > 200 ? t.slice(0, 200) + '…' : t;
});

const timeAgo = computed(() => {
	const ms = Date.now() - new Date(props.note.createdAt).getTime();
	const h = Math.floor(ms / 3_600_000);
	const m = Math.floor((ms % 3_600_000) / 60_000);
	if (h >= 24) return `${Math.floor(h / 24)}d`;
	if (h > 0) return `${h}h`;
	return `${m}m`;
});

function fmt(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return String(n);
}
</script>

<style module lang="scss">
.card {
	background: var(--panel);
	border-radius: var(--radius-lg, 16px);
	overflow: hidden;
	transition: transform 0.2s;
	box-shadow: 0 2px 12px rgba(0,0,0,0.07);

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(0,0,0,0.12);
	}
}

.mediaWrap {
	position: relative;
	aspect-ratio: 16/9;
	background: var(--bg);
	cursor: pointer;
	overflow: hidden;
}

.mediaImg {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s;

	.mediaWrap:hover & {
		transform: scale(1.02);
	}
}

.videoThumb {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #1a1a2e, #16213e);
	display: flex;
	align-items: center;
	justify-content: center;
}

.playIcon {
	font-size: 48px;
	color: rgba(255,255,255,0.8);
}

.mediaOverlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3));
	pointer-events: none;
}

.body {
	padding: 14px 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.authorRow {
	display: flex;
	align-items: center;
	gap: 10px;
}

.avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	object-fit: cover;
	flex-shrink: 0;
}

.authorInfo {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.displayName {
	font-size: 14px;
	font-weight: 600;
	color: var(--fg);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.username {
	font-size: 12px;
	color: var(--fgTransparentWeak);
}

.timeAgo {
	font-size: 11px;
	color: var(--fgTransparentWeak);
	flex-shrink: 0;
}

.text {
	font-size: 14px;
	color: var(--fg);
	margin: 0;
	line-height: 1.6;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.tag {
	font-size: 12px;
	color: var(--accent);
	cursor: pointer;
	font-weight: 500;

	&:hover { text-decoration: underline; }
}

.stats {
	display: flex;
	gap: 4px;
	border-top: 1px solid var(--divider);
	padding-top: 10px;
}

.statBtn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 5px;
	padding: 6px;
	background: none;
	border: none;
	cursor: pointer;
	border-radius: 8px;
	font-size: 13px;
	color: var(--fgTransparent);
	transition: background 0.15s, color 0.15s;

	&:hover {
		background: var(--accentedBg);
		color: var(--accent);
	}

	i { font-size: 16px; }
}
</style>
