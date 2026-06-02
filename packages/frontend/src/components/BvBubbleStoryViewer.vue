<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  BvBubbleStoryViewer — full-screen story viewer modal.
  Supports image, video, and text stories with progress bar,
  tap-to-advance, and swipe gestures.
-->
<template>
<Teleport to="body">
<div v-if="visible" :class="$style.overlay" @click.self="close">
	<div :class="$style.container">
		<!-- Progress bars -->
		<div :class="$style.progressBars">
			<div
				v-for="(story, idx) in stories"
				:key="story.id"
				:class="$style.progressTrack"
			>
				<div
					:class="$style.progressFill"
					:style="progressStyle(idx)"
				/>
			</div>
		</div>

		<!-- Header -->
		<div :class="$style.header">
			<div :class="$style.userInfo">
				<img :class="$style.headerAvatar" :src="userAvatarUrl ?? '/static-assets/avatar.png'" alt="" />
				<span :class="$style.headerUsername">{{ username }}</span>
				<span :class="$style.headerTime">{{ timeAgo }}</span>
			</div>
			<button :class="$style.closeBtn" @click="close"><i class="ti ti-x"></i></button>
		</div>

		<!-- Story content -->
		<div :class="$style.content" @click="onContentClick">
			<!-- Image story -->
			<img
				v-if="currentStory?.type === 'image' && currentStory.fileUrl"
				:class="$style.storyImage"
				:src="currentStory.fileUrl"
				alt=""
			/>

			<!-- Video story -->
			<video
				v-else-if="currentStory?.type === 'video' && currentStory.fileUrl"
				:class="$style.storyVideo"
				:src="currentStory.fileUrl"
				autoplay
				muted
				playsinline
				loop
			/>

			<!-- Text story -->
			<div
				v-else-if="currentStory?.type === 'text'"
				:class="$style.storyText"
				:style="{
					background: currentStory.background ?? 'linear-gradient(135deg, #667eea, #764ba2)',
					fontFamily: currentStory.fontStyle ?? 'inherit',
				}"
			>
				<p :class="$style.storyTextContent">{{ currentStory.text }}</p>
			</div>
		</div>

		<!-- Left / right tap zones -->
		<div :class="$style.tapLeft" @click.stop="prev" />
		<div :class="$style.tapRight" @click.stop="next" />

		<!-- View count -->
		<div v-if="currentStory" :class="$style.footer">
			<span :class="$style.viewCount"><i class="ti ti-eye"></i> {{ currentStory.viewsCount }}</span>
		</div>
	</div>
</div>
</Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';

type Story = {
	id: string;
	type: 'image' | 'video' | 'text';
	fileUrl: string | null;
	text: string | null;
	background: string | null;
	fontStyle: string | null;
	viewsCount: number;
	createdAt: string;
	isViewed: boolean;
};

const props = defineProps<{
	visible: boolean;
	stories: Story[];
	username: string;
	userAvatarUrl: string | null;
}>();

const emit = defineEmits<{
	close: [];
	seen: [storyId: string];
}>();

const STORY_DURATION = 5000; // ms per story

const currentIndex = ref(0);
const progress = ref(0); // 0-100
let timer: ReturnType<typeof setInterval> | null = null;

const currentStory = computed(() => props.stories[currentIndex.value] ?? null);

const timeAgo = computed(() => {
	if (!currentStory.value) return '';
	const ms = Date.now() - new Date(currentStory.value.createdAt).getTime();
	const h = Math.floor(ms / 3_600_000);
	const m = Math.floor((ms % 3_600_000) / 60_000);
	return h > 0 ? `${h}h ago` : `${m}m ago`;
});

function progressStyle(idx: number) {
	if (idx < currentIndex.value) return { width: '100%' };
	if (idx === currentIndex.value) return { width: `${progress.value}%` };
	return { width: '0%' };
}

function startTimer() {
	stopTimer();
	progress.value = 0;
	const step = 100 / (STORY_DURATION / 100);
	timer = setInterval(() => {
		progress.value += step;
		if (progress.value >= 100) next();
	}, 100);

	if (currentStory.value && !currentStory.value.isViewed) {
		emit('seen', currentStory.value.id);
	}
}

function stopTimer() {
	if (timer) { clearInterval(timer); timer = null; }
}

function next() {
	if (currentIndex.value < props.stories.length - 1) {
		currentIndex.value++;
		startTimer();
	} else {
		close();
	}
}

function prev() {
	if (currentIndex.value > 0) {
		currentIndex.value--;
		startTimer();
	}
}

function close() {
	stopTimer();
	emit('close');
}

function onContentClick(e: MouseEvent) {
	const x = e.clientX;
	const half = window.innerWidth / 2;
	if (x < half) prev(); else next();
}

watch(() => props.visible, (v) => {
	if (v) { currentIndex.value = 0; startTimer(); } else stopTimer();
});

onUnmounted(stopTimer);
</script>

<style module lang="scss">
.overlay {
	position: fixed;
	inset: 0;
	background: rgba(0,0,0,0.9);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.container {
	position: relative;
	width: min(420px, 100vw);
	height: min(745px, 100vh);
	background: #000;
	border-radius: 12px;
	overflow: hidden;
}

.progressBars {
	position: absolute;
	top: 8px;
	left: 8px;
	right: 8px;
	display: flex;
	gap: 4px;
	z-index: 10;
}

.progressTrack {
	flex: 1;
	height: 3px;
	background: rgba(255,255,255,0.4);
	border-radius: 2px;
	overflow: hidden;
}

.progressFill {
	height: 100%;
	background: #fff;
	transition: width 0.1s linear;
}

.header {
	position: absolute;
	top: 20px;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 12px;
	z-index: 10;
}

.userInfo {
	display: flex;
	align-items: center;
	gap: 8px;
}

.headerAvatar {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	object-fit: cover;
	border: 2px solid #fff;
}

.headerUsername {
	color: #fff;
	font-weight: 600;
	font-size: 14px;
	text-shadow: 0 1px 4px rgba(0,0,0,0.6);
}

.headerTime {
	color: rgba(255,255,255,0.7);
	font-size: 12px;
}

.closeBtn {
	background: none;
	border: none;
	color: #fff;
	font-size: 20px;
	cursor: pointer;
	padding: 4px;
}

.content {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.storyImage {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.storyVideo {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.storyText {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32px;
}

.storyTextContent {
	color: #fff;
	font-size: 24px;
	font-weight: 600;
	text-align: center;
	text-shadow: 0 2px 8px rgba(0,0,0,0.4);
	line-height: 1.4;
}

.tapLeft {
	position: absolute;
	top: 0;
	left: 0;
	width: 33%;
	height: 100%;
	cursor: pointer;
	z-index: 5;
}

.tapRight {
	position: absolute;
	top: 0;
	right: 0;
	width: 33%;
	height: 100%;
	cursor: pointer;
	z-index: 5;
}

.footer {
	position: absolute;
	bottom: 16px;
	left: 0;
	right: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10;
}

.viewCount {
	color: rgba(255,255,255,0.8);
	font-size: 13px;
	display: flex;
	align-items: center;
	gap: 4px;
}
</style>
