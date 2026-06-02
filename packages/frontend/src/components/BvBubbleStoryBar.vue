<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  BvBubbleStoryBar — horizontal scrollable row of story avatars,
  Instagram-style. Each circle shows the user's avatar with a
  gradient ring (unseen) or grey ring (seen).
-->
<template>
<div :class="$style.root">
	<div :class="$style.track">
		<!-- Own story / add story button -->
		<button v-if="$i" :class="[$style.item, $style.addStory]" @click="emit('addStory')">
			<div :class="$style.avatarWrap">
				<img :class="$style.avatar" :src="$i.avatarUrl ?? '/static-assets/avatar.png'" alt="" />
				<span :class="$style.addIcon"><i class="ti ti-plus"></i></span>
			</div>
			<span :class="$style.name">{{ i18n.ts.addStory }}</span>
		</button>

		<!-- Following users' stories -->
		<button
			v-for="group in storyGroups"
			:key="group.userId"
			:class="[$style.item, group.hasUnseen ? $style.unseen : $style.seen]"
			@click="emit('viewStories', group)"
		>
			<div :class="$style.avatarWrap">
				<div :class="group.hasUnseen ? $style.ringUnseen : $style.ringSeen">
					<img :class="$style.avatar" :src="group.userAvatarUrl ?? '/static-assets/avatar.png'" :alt="group.username" />
				</div>
			</div>
			<span :class="$style.name">{{ group.username }}</span>
		</button>
	</div>
</div>
</template>

<script lang="ts" setup>
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';

export type StoryGroup = {
	userId: string;
	username: string;
	userAvatarUrl: string | null;
	stories: any[];
	hasUnseen: boolean;
};

const props = defineProps<{
	storyGroups: StoryGroup[];
}>();

const emit = defineEmits<{
	addStory: [];
	viewStories: [group: StoryGroup];
}>();
</script>

<style module lang="scss">
.root {
	width: 100%;
	overflow: hidden;
	padding: 12px 0;
	background: var(--panel);
	border-radius: var(--radius);
}

.track {
	display: flex;
	gap: 16px;
	padding: 0 16px;
	overflow-x: auto;
	scrollbar-width: none;
	&::-webkit-scrollbar { display: none; }
}

.item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	flex-shrink: 0;
}

.avatarWrap {
	position: relative;
	width: 60px;
	height: 60px;
}

.ringUnseen {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	padding: 2px;
	background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
	display: flex;
	align-items: center;
	justify-content: center;
}

.ringSeen {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	padding: 2px;
	background: var(--divider);
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar {
	width: 52px;
	height: 52px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid var(--panel);
}

.addStory .avatar {
	border: 2px solid var(--accent);
}

.addIcon {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background: var(--accent);
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	border: 2px solid var(--panel);
}

.name {
	font-size: 11px;
	color: var(--fg);
	max-width: 60px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: center;
}
</style>
