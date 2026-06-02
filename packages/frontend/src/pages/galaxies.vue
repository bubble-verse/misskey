<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  Galaxies page — Facebook Groups-inspired community discovery page.
  Shows featured galaxies, search, and category filtering.
-->
<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs">
	<MkSpacer :contentMax="1100">
		<MkSwiper v-model:tab="tab" :tabs="headerTabs">
			<!-- Featured tab -->
			<div v-if="tab === 'featured'" class="_gaps">
				<!-- Hero banner -->
				<div :class="$style.hero">
					<div :class="$style.heroContent">
						<h1 :class="$style.heroTitle"><i class="ti ti-galaxy"></i> {{ i18n.ts.galaxies }}</h1>
						<p :class="$style.heroDesc">{{ i18n.ts.galaxiesDescription }}</p>
						<MkButton v-if="$i" primary rounded gradate @click="openCreateDialog">
							<i class="ti ti-rocket"></i> {{ i18n.ts.createGalaxy }}
						</MkButton>
					</div>
				</div>

				<!-- Category filter -->
				<div :class="$style.catBar">
					<button
						v-for="cat in ['all', ...galaxyCategories]"
						:key="cat"
						:class="[$style.catBtn, activeCategory === cat ? $style.catBtnActive : '']"
						@click="activeCategory = cat"
					>{{ cat === 'all' ? i18n.ts.all : cat }}</button>
				</div>

				<MkLoading v-if="loading" />
				<div v-else :class="$style.grid">
					<BvGalaxyCard
						v-for="galaxy in filteredGalaxies"
						:key="galaxy.id"
						:galaxy="galaxy"
						@open="openGalaxy"
						@joined="onJoined"
						@left="onLeft"
					/>
				</div>
			</div>

			<!-- Search tab -->
			<div v-if="tab === 'search'" class="_gaps">
				<div class="_gaps">
					<MkInput v-model="searchQuery" :large="true" :autofocus="true" type="search" @enter="search">
						<template #prefix><i class="ti ti-search"></i></template>
					</MkInput>
					<MkButton large primary rounded @click="search">{{ i18n.ts.search }}</MkButton>
				</div>
				<div v-if="searchResults.length" :class="$style.grid">
					<BvGalaxyCard
						v-for="galaxy in searchResults"
						:key="galaxy.id"
						:galaxy="galaxy"
						@open="openGalaxy"
						@joined="onJoined"
						@left="onLeft"
					/>
				</div>
				<div v-else-if="searched" :class="$style.noResults">{{ i18n.ts.noResults }}</div>
			</div>

			<!-- My galaxies tab (logged in only) -->
			<div v-if="tab === 'mine' && $i" class="_gaps">
				<div v-if="myGalaxies.length === 0" :class="$style.empty">
					<i class="ti ti-galaxy" style="font-size: 48px; color: var(--fgTransparentWeak);" />
					<p>{{ i18n.ts.notInAnyGalaxy }}</p>
					<MkButton primary rounded @click="tab = 'featured'">{{ i18n.ts.discoverGalaxies }}</MkButton>
				</div>
				<div v-else :class="$style.grid">
					<BvGalaxyCard
						v-for="galaxy in myGalaxies"
						:key="galaxy.id"
						:galaxy="galaxy"
						@open="openGalaxy"
						@joined="onJoined"
						@left="onLeft"
					/>
				</div>
			</div>
		</MkSwiper>
	</MkSpacer>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import BvGalaxyCard from '@/components/BvGalaxyCard.vue';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkLoading from '@/components/global/MkLoading.vue';
import MkSwiper from '@/components/MkSwiper.vue';
import { i18n } from '@/i18n.js';
import { $i } from '@/i.js';
import * as os from '@/os.js';
import { useRouter } from '@/router.js';
import { definePage } from '@/page.js';

const galaxyCategories = [
	'technology', 'gaming', 'music', 'art', 'sports',
	'food', 'travel', 'education', 'business', 'entertainment',
] as const;

const router = useRouter();
const tab = ref('featured');
const loading = ref(true);
const galaxies = ref<any[]>([]);
const activeCategory = ref<string>('all');
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const searched = ref(false);
const myGalaxies = ref<any[]>([]);

const headerTabs = computed(() => [
	{ key: 'featured', title: i18n.ts.featured, icon: 'ti ti-star' },
	{ key: 'search', title: i18n.ts.search, icon: 'ti ti-search' },
	...($i ? [{ key: 'mine', title: i18n.ts.myGalaxies, icon: 'ti ti-galaxy' }] : []),
]);

const headerActions = $i ? [{
	icon: 'ti ti-plus',
	text: i18n.ts.createGalaxy,
	handler: openCreateDialog,
}] : [];

const filteredGalaxies = computed(() => {
	if (activeCategory.value === 'all') return galaxies.value;
	return galaxies.value.filter(g => g.category === activeCategory.value);
});

async function loadFeatured() {
	loading.value = true;
	try {
		const res = await os.api('galaxies/featured', { limit: 50 }) as any[];
		galaxies.value = res;
		if ($i) myGalaxies.value = res.filter((g: any) => g.isMember);
	} catch {
		galaxies.value = [];
	} finally {
		loading.value = false;
	}
}

async function search() {
	if (!searchQuery.value.trim()) return;
	searched.value = true;
	// Real impl: call galaxies/search endpoint
	searchResults.value = galaxies.value.filter(g =>
		g.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
		g.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
	);
}

async function openCreateDialog() {
	if (!$i) return;
	const { result } = await os.form(i18n.ts.createGalaxy, {
		name: { type: 'string', label: i18n.ts.name, required: true },
		description: { type: 'string', label: i18n.ts.description, required: false },
		category: {
			type: 'enum',
			label: i18n.ts.category,
			enum: galaxyCategories.map(c => ({ label: c, value: c })),
			default: 'general',
		},
		isPrivate: { type: 'boolean', label: i18n.ts.privateGalaxy, default: false },
		color: { type: 'string', label: i18n.ts.color, default: '#7c3aed' },
	});
	if (!result) return;

	try {
		const galaxy = await os.api('galaxies/create', result);
		os.toast(i18n.ts.galaxyCreated);
		await loadFeatured();
		openGalaxy(galaxy as any);
	} catch (e: any) {
		os.alert({ type: 'error', text: e.message });
	}
}

function openGalaxy(galaxy: any) {
	router.push(`/galaxies/${galaxy.id}`);
}

function onJoined(galaxyId: string) {
	const g = galaxies.value.find(x => x.id === galaxyId);
	if (g) { g.isMember = true; g.membersCount++; }
}

function onLeft(galaxyId: string) {
	const g = galaxies.value.find(x => x.id === galaxyId);
	if (g) { g.isMember = false; g.membersCount = Math.max(0, g.membersCount - 1); }
}

onMounted(loadFeatured);

definePage(() => ({
	title: i18n.ts.galaxies,
	icon: 'ti ti-galaxy',
}));
</script>

<style module lang="scss">
.hero {
	background: linear-gradient(135deg, #7c3aed, #4f46e5, #0ea5e9);
	border-radius: var(--radius-lg, 20px);
	padding: 40px 32px;
	color: #fff;
}

.heroContent {
	display: flex;
	flex-direction: column;
	gap: 12px;
	max-width: 500px;
}

.heroTitle {
	font-size: 28px;
	font-weight: 800;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 10px;
}

.heroDesc {
	font-size: 15px;
	opacity: 0.9;
	margin: 0;
	line-height: 1.6;
}

.catBar {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	padding: 4px 0;
}

.catBtn {
	padding: 5px 14px;
	border-radius: 99px;
	border: 1px solid var(--divider);
	background: none;
	cursor: pointer;
	font-size: 13px;
	color: var(--fg);
	text-transform: capitalize;
	transition: all 0.15s;

	&:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
}

.catBtnActive {
	background: var(--accent) !important;
	color: #fff !important;
	border-color: var(--accent) !important;
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

.noResults, .empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	padding: 48px;
	text-align: center;
	color: var(--fgTransparentWeak);
}
</style>
