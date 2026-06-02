<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  Galaxy page — individual community view.
  Shows banner, community info, member list, and community posts/timeline.
-->
<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs">
	<MkSpacer :contentMax="800">
		<MkSwiper v-model:tab="tab" :tabs="headerTabs">
			<!-- Overview tab -->
			<div v-if="tab === 'overview'" class="_gaps">
				<MkLoading v-if="loading" />
				<template v-else-if="galaxy">
					<!-- Banner area -->
					<div :class="$style.bannerArea">
						<div
							:class="$style.banner"
							:style="galaxy.bannerUrl
								? { backgroundImage: `url(${galaxy.bannerUrl})` }
								: { background: `linear-gradient(135deg, ${galaxy.color}88, ${galaxy.color})` }"
						>
							<div :class="$style.bannerOverlay" />
						</div>

						<div :class="$style.galaxyHeader">
							<div :class="$style.colorOrb" :style="{ background: galaxy.color }" />
							<div :class="$style.headerInfo">
								<h1 :class="$style.galaxyName">{{ galaxy.name }}</h1>
								<div :class="$style.galaxyMeta">
									<span><i class="ti ti-tag"></i> {{ galaxy.category }}</span>
									<span><i class="ti ti-users"></i> {{ galaxy.membersCount.toLocaleString() }} {{ i18n.ts.members }}</span>
									<span><i class="ti ti-notes"></i> {{ galaxy.notesCount.toLocaleString() }} {{ i18n.ts.notes }}</span>
									<span v-if="galaxy.isPrivate"><i class="ti ti-lock"></i> {{ i18n.ts.private }}</span>
								</div>
							</div>

							<div :class="$style.headerActions">
								<MkButton
									v-if="$i && !galaxy.isOwner"
									:primary="!galaxy.isMember"
									rounded
									:style="!galaxy.isMember ? { background: galaxy.color } : {}"
									@click="toggleMembership"
								>
									<span v-if="memberLoading"><i class="ti ti-loader-2 ti-spin"></i></span>
									<span v-else-if="galaxy.isMember"><i class="ti ti-logout"></i> {{ i18n.ts.leave }}</span>
									<span v-else><i class="ti ti-rocket"></i> {{ i18n.ts.join }}</span>
								</MkButton>
								<MkButton v-if="galaxy.isOwner" rounded @click="openSettings">
									<i class="ti ti-settings"></i>
								</MkButton>
							</div>
						</div>
					</div>

					<!-- Description -->
					<div v-if="galaxy.description" :class="$style.descCard">
						<Mfm :text="galaxy.description" :isNote="false" />
					</div>

					<!-- Tags -->
					<div v-if="galaxy.tags?.length" :class="$style.tagsRow">
						<span v-for="tag in galaxy.tags" :key="tag" :class="$style.tag">#{{ tag }}</span>
					</div>

					<!-- Stats cards -->
					<div :class="$style.statsRow">
						<div :class="$style.statCard">
							<span :class="$style.statNum">{{ galaxy.membersCount.toLocaleString() }}</span>
							<span :class="$style.statLabel">{{ i18n.ts.members }}</span>
						</div>
						<div :class="$style.statCard">
							<span :class="$style.statNum">{{ galaxy.notesCount.toLocaleString() }}</span>
							<span :class="$style.statLabel">{{ i18n.ts.posts }}</span>
						</div>
						<div :class="$style.statCard">
							<span :class="$style.statNum" :style="{ color: galaxy.color }">{{ galaxy.category }}</span>
							<span :class="$style.statLabel">{{ i18n.ts.category }}</span>
						</div>
					</div>
				</template>
			</div>

			<!-- Posts tab -->
			<div v-if="tab === 'posts'">
				<MkInfo v-if="galaxy?.isArchived" warn>{{ i18n.ts.thisGalaxyArchived }}</MkInfo>
				<MkTimeline v-if="galaxy" :key="galaxyId" src="channel" :channel="galaxyId" />
			</div>
		</MkSwiper>
	</MkSpacer>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import MkButton from '@/components/MkButton.vue';
import MkLoading from '@/components/global/MkLoading.vue';
import MkTimeline from '@/components/MkTimeline.vue';
import MkSwiper from '@/components/MkSwiper.vue';
import MkInfo from '@/components/MkInfo.vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import * as os from '@/os.js';
import { useRouter } from '@/router.js';
import { definePage } from '@/page.js';

const props = defineProps<{ galaxyId: string }>();
const router = useRouter();

const tab = ref('overview');
const loading = ref(true);
const memberLoading = ref(false);
const galaxy = ref<any>(null);

const headerTabs = computed(() => [
	{ key: 'overview', title: i18n.ts.overview, icon: 'ti ti-info-circle' },
	{ key: 'posts', title: i18n.ts.posts, icon: 'ti ti-notes' },
]);

const headerActions = computed(() => {
	const acts: any[] = [];
	if ($i && galaxy.value?.isOwner) {
		acts.push({
			icon: 'ti ti-settings',
			text: i18n.ts.settings,
			handler: openSettings,
		});
	}
	return acts;
});

async function loadGalaxy() {
	loading.value = true;
	try {
		// Would call galaxies/show in full implementation
		const res = await os.api('galaxies/featured', { limit: 100 }) as any[];
		galaxy.value = res.find((g: any) => g.id === props.galaxyId) ?? null;
	} catch {
		galaxy.value = null;
	} finally {
		loading.value = false;
	}
}

async function toggleMembership() {
	if (!galaxy.value || !$i) return;
	memberLoading.value = true;
	try {
		if (galaxy.value.isMember) {
			await os.api('galaxies/leave', { galaxyId: galaxy.value.id });
			galaxy.value.isMember = false;
			galaxy.value.membersCount = Math.max(0, galaxy.value.membersCount - 1);
		} else {
			await os.api('galaxies/join', { galaxyId: galaxy.value.id });
			galaxy.value.isMember = true;
			galaxy.value.membersCount++;
		}
	} finally {
		memberLoading.value = false;
	}
}

function openSettings() {
	os.pageWindow(`/galaxy-editor/${props.galaxyId}`);
}

onMounted(loadGalaxy);

definePage(() => ({
	title: galaxy.value?.name ?? i18n.ts.galaxy,
	icon: 'ti ti-galaxy',
}));
</script>

<style module lang="scss">
.bannerArea {
	background: var(--panel);
	border-radius: var(--radius-lg, 16px);
	overflow: hidden;
}

.banner {
	height: 180px;
	background-size: cover;
	background-position: center;
	position: relative;
}

.bannerOverlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4));
}

.galaxyHeader {
	padding: 16px;
	display: flex;
	align-items: flex-start;
	gap: 14px;
}

.colorOrb {
	width: 48px;
	height: 48px;
	border-radius: 50%;
	flex-shrink: 0;
	border: 3px solid var(--panel);
	margin-top: -32px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.headerInfo {
	flex: 1;
	min-width: 0;
}

.galaxyName {
	font-size: 22px;
	font-weight: 800;
	color: var(--fg);
	margin: 0 0 6px;
}

.galaxyMeta {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	font-size: 12px;
	color: var(--fgTransparentWeak);

	span { display: flex; align-items: center; gap: 3px; }
	i { font-size: 13px; }
}

.headerActions {
	flex-shrink: 0;
}

.descCard {
	background: var(--panel);
	border-radius: var(--radius);
	padding: 16px;
	font-size: 14px;
	line-height: 1.7;
	color: var(--fg);
}

.tagsRow {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.tag {
	background: var(--accentedBg);
	color: var(--accent);
	padding: 3px 10px;
	border-radius: 99px;
	font-size: 12px;
	font-weight: 500;
}

.statsRow {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
}

.statCard {
	background: var(--panel);
	border-radius: var(--radius);
	padding: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
}

.statNum {
	font-size: 22px;
	font-weight: 800;
	color: var(--accent);
	text-transform: capitalize;
}

.statLabel {
	font-size: 12px;
	color: var(--fgTransparentWeak);
}
</style>
