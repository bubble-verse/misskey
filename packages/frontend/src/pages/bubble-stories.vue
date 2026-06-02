<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  Bubble Stories page — Instagram Stories-inspired ephemeral 24h content.
  Shows a scrollable bar of story circles at the top and a grid of
  active stories below.
-->
<template>
<PageWithHeader :actions="headerActions">
	<MkSpacer :contentMax="800">
		<div class="_gaps">
			<!-- Story bar -->
			<BvBubbleStoryBar
				:storyGroups="storyGroups"
				@addStory="openAddStoryDialog"
				@viewStories="openViewer"
			/>

			<!-- Active stories grid -->
			<div v-if="storyGroups.length === 0 && !loading" :class="$style.empty">
				<i class="ti ti-bubble" style="font-size: 48px; color: var(--fgTransparentWeak);" />
				<p>{{ i18n.ts.noStoriesYet }}</p>
				<MkButton primary rounded @click="openAddStoryDialog">
					<i class="ti ti-plus"></i> {{ i18n.ts.createFirstStory }}
				</MkButton>
			</div>

			<MkLoading v-if="loading" />

			<div v-else :class="$style.grid">
				<div
					v-for="group in storyGroups"
					:key="group.userId"
					:class="[$style.gridItem, group.hasUnseen ? $style.gridItemUnseen : '']"
					@click="openViewer(group)"
				>
					<div :class="$style.gridThumb">
						<img
							v-if="group.stories[0]?.fileUrl"
							:src="group.stories[0].fileUrl"
							:class="$style.gridImg"
							alt=""
						/>
						<div v-else :class="$style.gridTextThumb">
							<span>{{ group.stories[0]?.text?.slice(0, 60) }}</span>
						</div>
						<div v-if="group.hasUnseen" :class="$style.unseenDot" />
					</div>
					<div :class="$style.gridMeta">
						<img :class="$style.gridAvatar" :src="group.userAvatarUrl ?? '/static-assets/avatar.png'" alt="" />
						<span :class="$style.gridName">{{ group.username }}</span>
						<span :class="$style.gridCount">{{ group.stories.length }}</span>
					</div>
				</div>
			</div>
		</div>
	</MkSpacer>

	<!-- Story Viewer -->
	<BvBubbleStoryViewer
		:visible="viewerVisible"
		:stories="viewerStories"
		:username="viewerUsername"
		:userAvatarUrl="viewerAvatarUrl"
		@close="viewerVisible = false"
		@seen="onStorySeen"
	/>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import BvBubbleStoryBar, { type StoryGroup } from '@/components/BvBubbleStoryBar.vue';
import BvBubbleStoryViewer from '@/components/BvBubbleStoryViewer.vue';
import MkButton from '@/components/MkButton.vue';
import MkLoading from '@/components/global/MkLoading.vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import * as os from '@/os.js';
import { definePage } from '@/page.js';

const loading = ref(true);
const storyGroups = ref<StoryGroup[]>([]);
const viewerVisible = ref(false);
const viewerStories = ref<any[]>([]);
const viewerUsername = ref('');
const viewerAvatarUrl = ref<string | null>(null);

const headerActions = $i ? [{
	icon: 'ti ti-plus',
	text: i18n.ts.addStory,
	handler: openAddStoryDialog,
}] : [];

async function loadStories() {
	loading.value = true;
	try {
		const raw = await os.api('bubble-stories/timeline', {});
		// Group stories by userId
		const map = new Map<string, StoryGroup>();
		for (const story of (raw as any[])) {
			if (!map.has(story.userId)) {
				map.set(story.userId, {
					userId: story.userId,
					username: story.username ?? story.userId,
					userAvatarUrl: story.userAvatarUrl ?? null,
					stories: [],
					hasUnseen: false,
				});
			}
			const g = map.get(story.userId)!;
			g.stories.push(story);
			if (!story.isViewed) g.hasUnseen = true;
		}
		storyGroups.value = Array.from(map.values());
	} catch {
		// API not yet wired — show empty state gracefully
		storyGroups.value = [];
	} finally {
		loading.value = false;
	}
}

function openViewer(group: StoryGroup) {
	viewerStories.value = group.stories;
	viewerUsername.value = group.username;
	viewerAvatarUrl.value = group.userAvatarUrl;
	viewerVisible.value = true;
}

async function openAddStoryDialog() {
	if (!$i) return;
	const { result } = await os.form(i18n.ts.addStory, {
		type: {
			type: 'enum',
			label: i18n.ts.storyType,
			enum: [
				{ label: 'Image', value: 'image' },
				{ label: 'Video', value: 'video' },
				{ label: 'Text', value: 'text' },
			],
			default: 'text',
		},
		text: {
			type: 'string',
			label: i18n.ts.text,
			required: false,
		},
		background: {
			type: 'string',
			label: i18n.ts.storyBackground,
			default: 'linear-gradient(135deg, #667eea, #764ba2)',
			required: false,
		},
	});
	if (!result) return;

	try {
		await os.api('bubble-stories/create', {
			type: result.type,
			text: result.text || null,
			background: result.background || null,
		});
		os.toast(i18n.ts.storyCreated);
		await loadStories();
	} catch (e: any) {
		os.alert({ type: 'error', text: e.message });
	}
}

async function onStorySeen(storyId: string) {
	if (!$i) return;
	await os.api('bubble-stories/seen', { storyId }).catch(() => {});
}

onMounted(loadStories);

definePage(() => ({
	title: i18n.ts.bubbles,
	icon: 'ti ti-bubble',
}));
</script>

<style module lang="scss">
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 48px 24px;
	text-align: center;
	color: var(--fgTransparentWeak);
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 12px;
}

.gridItem {
	cursor: pointer;
	border-radius: 12px;
	overflow: hidden;
	background: var(--panel);
	transition: transform 0.2s;

	&:hover { transform: scale(1.02); }
}

.gridItemUnseen {
	outline: 3px solid transparent;
	outline-color: var(--accent);
}

.gridThumb {
	position: relative;
	aspect-ratio: 9/16;
	background: var(--bg);
}

.gridImg {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.gridTextThumb {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, var(--accent), #7c3aed);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12px;

	span {
		color: #fff;
		font-size: 13px;
		text-align: center;
		line-height: 1.4;
	}
}

.unseenDot {
	position: absolute;
	top: 8px;
	right: 8px;
	width: 10px;
	height: 10px;
	border-radius: 50%;
	background: var(--accent);
	border: 2px solid var(--panel);
}

.gridMeta {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 8px 10px;
}

.gridAvatar {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	object-fit: cover;
}

.gridName {
	font-size: 12px;
	font-weight: 600;
	color: var(--fg);
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.gridCount {
	font-size: 11px;
	color: var(--fgTransparentWeak);
	background: var(--bg);
	border-radius: 99px;
	padding: 1px 6px;
}
</style>
