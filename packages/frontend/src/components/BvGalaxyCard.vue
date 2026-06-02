<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  BvGalaxyCard — visual card for a Galaxy (community),
  showing banner, icon, name, stats, and join/leave button.
-->
<template>
<div :class="$style.card" @click="emit('open', galaxy)">
	<!-- Banner -->
	<div :class="$style.banner" :style="bannerStyle">
		<div :class="$style.bannerOverlay" />
		<div :class="$style.colorDot" :style="{ background: galaxy.color }" />
	</div>

	<!-- Body -->
	<div :class="$style.body">
		<div :class="$style.titleRow">
			<span :class="$style.name">{{ galaxy.name }}</span>
			<span :class="[$style.badge, `$style.cat_${galaxy.category}`]">{{ galaxy.category }}</span>
		</div>

		<p v-if="galaxy.description" :class="$style.desc">{{ galaxy.description }}</p>

		<div :class="$style.stats">
			<span><i class="ti ti-users"></i> {{ galaxy.membersCount.toLocaleString() }}</span>
			<span><i class="ti ti-notes"></i> {{ galaxy.notesCount.toLocaleString() }}</span>
			<span v-if="galaxy.isPrivate" :class="$style.privateBadge"><i class="ti ti-lock"></i> Private</span>
		</div>

		<div v-if="galaxy.tags.length" :class="$style.tags">
			<span v-for="tag in galaxy.tags.slice(0, 4)" :key="tag" :class="$style.tag">#{{ tag }}</span>
		</div>

		<button
			v-if="$i"
			:class="[$style.joinBtn, galaxy.isMember ? $style.leaveBtn : $style.joinBtnActive]"
			:style="galaxy.isMember ? {} : { background: galaxy.color }"
			@click.stop="onJoinLeave"
		>
			<span v-if="loading"><i class="ti ti-loader-2 ti-spin"></i></span>
			<span v-else-if="galaxy.isMember"><i class="ti ti-logout"></i> {{ i18n.ts.leaveGalaxy }}</span>
			<span v-else><i class="ti ti-rocket"></i> {{ i18n.ts.joinGalaxy }}</span>
		</button>
	</div>
</div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import * as os from '@/os.js';

type Galaxy = {
	id: string;
	name: string;
	description: string | null;
	category: string;
	bannerUrl: string | null;
	color: string;
	membersCount: number;
	notesCount: number;
	isPrivate: boolean;
	isMember: boolean;
	tags: string[];
};

const props = defineProps<{ galaxy: Galaxy }>();
const emit = defineEmits<{
	open: [galaxy: Galaxy];
	joined: [galaxyId: string];
	left: [galaxyId: string];
}>();

const loading = ref(false);

const bannerStyle = computed(() => {
	if (props.galaxy.bannerUrl) {
		return { backgroundImage: `url(${props.galaxy.bannerUrl})` };
	}
	return { background: `linear-gradient(135deg, ${props.galaxy.color}88, ${props.galaxy.color})` };
});

async function onJoinLeave() {
	if (!$i) return;
	loading.value = true;
	try {
		if (props.galaxy.isMember) {
			await os.api('galaxies/leave', { galaxyId: props.galaxy.id });
			emit('left', props.galaxy.id);
		} else {
			await os.api('galaxies/join', { galaxyId: props.galaxy.id });
			emit('joined', props.galaxy.id);
		}
	} finally {
		loading.value = false;
	}
}
</script>

<style module lang="scss">
.card {
	background: var(--panel);
	border-radius: var(--radius-lg, 16px);
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.2s, box-shadow 0.2s;
	box-shadow: 0 2px 12px rgba(0,0,0,0.08);

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0,0,0,0.14);
	}
}

.banner {
	height: 100px;
	background-size: cover;
	background-position: center;
	position: relative;
}

.bannerOverlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3));
}

.colorDot {
	position: absolute;
	bottom: -10px;
	left: 16px;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	border: 3px solid var(--panel);
}

.body {
	padding: 16px 16px 14px;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.titleRow {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

.name {
	font-size: 16px;
	font-weight: 700;
	color: var(--fg);
}

.badge {
	font-size: 11px;
	padding: 2px 8px;
	border-radius: 99px;
	background: var(--accent);
	color: #fff;
	text-transform: capitalize;
}

.desc {
	font-size: 13px;
	color: var(--fgTransparentWeak);
	margin: 0;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.stats {
	display: flex;
	gap: 12px;
	font-size: 12px;
	color: var(--fgTransparentWeak);
	align-items: center;

	i { margin-right: 3px; }
}

.privateBadge {
	background: var(--warningAlpha);
	color: var(--warn);
	padding: 1px 6px;
	border-radius: 4px;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.tag {
	font-size: 11px;
	color: var(--accent);
	background: var(--accentedBg);
	padding: 1px 6px;
	border-radius: 4px;
}

.joinBtn {
	width: 100%;
	padding: 8px;
	border-radius: 99px;
	border: none;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s;
	color: #fff;
	margin-top: 4px;

	&:hover { opacity: 0.85; }
}

.leaveBtn {
	background: var(--divider);
	color: var(--fgTransparent);
}

.joinBtnActive {
	background: var(--accent);
}
</style>
