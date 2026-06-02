<!--
SPDX-FileCopyrightText: bubble-verse contributors
SPDX-License-Identifier: AGPL-3.0-only
-->

<!--
  BvFeatureShowcase — landing-page component that presents the three
  pillars of Bubble Verse: Bubbles (Stories), Verse (feed), Galaxies (groups).
  Shown to visitors before login.
-->
<template>
<section :class="$style.root">
	<!-- Hero -->
	<div :class="$style.hero">
		<div :class="$style.heroLogo">
			<div :class="$style.logoOrbs">
				<span :class="[$style.orb, $style.orb1]" />
				<span :class="[$style.orb, $style.orb2]" />
				<span :class="[$style.orb, $style.orb3]" />
			</div>
			<h1 :class="$style.logoText">Bubble Verse</h1>
		</div>
		<p :class="$style.heroTagline">{{ i18n.ts.bubbleVerseTagline }}</p>
		<div :class="$style.heroActions">
			<MkButton primary large rounded gradate @click="emit('signup')">
				<i class="ti ti-rocket"></i> {{ i18n.ts.joinBubbleVerse }}
			</MkButton>
			<MkButton large rounded @click="emit('login')">
				<i class="ti ti-login"></i> {{ i18n.ts.login }}
			</MkButton>
		</div>

		<!-- Feature pills -->
		<div :class="$style.pills">
			<span :class="$style.pill"><i class="ti ti-lock-open"></i> {{ i18n.ts.decentralized }}</span>
			<span :class="$style.pill"><i class="ti ti-world"></i> {{ i18n.ts.federated }}</span>
			<span :class="$style.pill"><i class="ti ti-code"></i> {{ i18n.ts.openSource }}</span>
		</div>
	</div>

	<!-- Feature cards -->
	<div :class="$style.features">
		<!-- Bubbles (Instagram Stories) -->
		<div :class="[$style.featureCard, $style.bubblesCard]">
			<div :class="$style.featureIcon">
				<i class="ti ti-bubble"></i>
			</div>
			<h2 :class="$style.featureTitle">Bubbles</h2>
			<p :class="$style.featureDesc">{{ i18n.ts.bubblesFeatureDesc }}</p>
			<ul :class="$style.featureList">
				<li><i class="ti ti-check"></i> {{ i18n.ts.bubblesFeature1 }}</li>
				<li><i class="ti ti-check"></i> {{ i18n.ts.bubblesFeature2 }}</li>
				<li><i class="ti ti-check"></i> {{ i18n.ts.bubblesFeature3 }}</li>
			</ul>
			<div :class="$style.featureInspirationBadge">
				<i class="ti ti-camera"></i> Instagram Stories
			</div>
		</div>

		<!-- Verse (TikTok For You) -->
		<div :class="[$style.featureCard, $style.verseCard]">
			<div :class="$style.featureIcon">
				<i class="ti ti-universe"></i>
			</div>
			<h2 :class="$style.featureTitle">Verse</h2>
			<p :class="$style.featureDesc">{{ i18n.ts.verseFeatureDesc }}</p>
			<ul :class="$style.featureList">
				<li><i class="ti ti-check"></i> {{ i18n.ts.verseFeature1 }}</li>
				<li><i class="ti ti-check"></i> {{ i18n.ts.verseFeature2 }}</li>
				<li><i class="ti ti-check"></i> {{ i18n.ts.verseFeature3 }}</li>
			</ul>
			<div :class="$style.featureInspirationBadge">
				<i class="ti ti-music"></i> TikTok For You
			</div>
		</div>

		<!-- Galaxies (Facebook Groups) -->
		<div :class="[$style.featureCard, $style.galaxiesCard]">
			<div :class="$style.featureIcon">
				<i class="ti ti-galaxy"></i>
			</div>
			<h2 :class="$style.featureTitle">Galaxies</h2>
			<p :class="$style.featureDesc">{{ i18n.ts.galaxiesFeatureDesc }}</p>
			<ul :class="$style.featureList">
				<li><i class="ti ti-check"></i> {{ i18n.ts.galaxiesFeature1 }}</li>
				<li><i class="ti ti-check"></i> {{ i18n.ts.galaxiesFeature2 }}</li>
				<li><i class="ti ti-check"></i> {{ i18n.ts.galaxiesFeature3 }}</li>
			</ul>
			<div :class="$style.featureInspirationBadge">
				<i class="ti ti-users-group"></i> Facebook Groups
			</div>
		</div>
	</div>

	<!-- Decentralization highlight -->
	<div :class="$style.decentral">
		<div :class="$style.decentralContent">
			<h2 :class="$style.decentralTitle">{{ i18n.ts.whyDecentralized }}</h2>
			<p :class="$style.decentralDesc">{{ i18n.ts.decentralizedDescription }}</p>
			<div :class="$style.decentralPoints">
				<div :class="$style.decentralPoint">
					<i class="ti ti-shield-check"></i>
					<div>
						<strong>{{ i18n.ts.ownYourData }}</strong>
						<span>{{ i18n.ts.ownYourDataDesc }}</span>
					</div>
				</div>
				<div :class="$style.decentralPoint">
					<i class="ti ti-network"></i>
					<div>
						<strong>{{ i18n.ts.noSinglePoint }}</strong>
						<span>{{ i18n.ts.noSinglePointDesc }}</span>
					</div>
				</div>
				<div :class="$style.decentralPoint">
					<i class="ti ti-plug-connected"></i>
					<div>
						<strong>{{ i18n.ts.interoperable }}</strong>
						<span>{{ i18n.ts.interoperableDesc }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
</template>

<script lang="ts" setup>
import MkButton from '@/components/MkButton.vue';
import { i18n } from '@/i18n.js';

const emit = defineEmits<{
	signup: [];
	login: [];
}>();
</script>

<style module lang="scss">
.root {
	display: flex;
	flex-direction: column;
	gap: 48px;
	padding: 32px 16px 64px;
	max-width: 1100px;
	margin: 0 auto;
}

/* Hero */
.hero {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 20px;
	text-align: center;
	padding: 48px 16px;
}

.heroLogo {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.logoOrbs {
	display: flex;
	gap: 8px;
	align-items: center;
}

.orb {
	display: block;
	border-radius: 50%;
	animation: float 3s ease-in-out infinite;
}

.orb1 {
	width: 20px; height: 20px;
	background: #f09433;
	animation-delay: 0s;
}
.orb2 {
	width: 28px; height: 28px;
	background: #7c3aed;
	animation-delay: 0.5s;
}
.orb3 {
	width: 18px; height: 18px;
	background: #0ea5e9;
	animation-delay: 1s;
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-8px); }
}

.logoText {
	font-size: clamp(36px, 8vw, 64px);
	font-weight: 900;
	background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #7c3aed, #0ea5e9);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
	margin: 0;
	letter-spacing: -1px;
}

.heroTagline {
	font-size: clamp(16px, 3vw, 20px);
	color: var(--fgTransparentWeak);
	max-width: 560px;
	line-height: 1.6;
	margin: 0;
}

.heroActions {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
	justify-content: center;
}

.pills {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: center;
}

.pill {
	font-size: 12px;
	padding: 4px 12px;
	border-radius: 99px;
	background: var(--accentedBg);
	color: var(--accent);
	display: flex;
	align-items: center;
	gap: 5px;
}

/* Feature cards */
.features {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 20px;
}

.featureCard {
	border-radius: 20px;
	padding: 28px 24px;
	display: flex;
	flex-direction: column;
	gap: 14px;
	position: relative;
	overflow: hidden;
}

.bubblesCard {
	background: linear-gradient(135deg, #ff9a56 0%, #ff6b6b 50%, #c44dff 100%);
	color: #fff;
}

.verseCard {
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
	color: #fff;
}

.galaxiesCard {
	background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #06b6d4 100%);
	color: #fff;
}

.featureIcon {
	width: 48px;
	height: 48px;
	border-radius: 14px;
	background: rgba(255,255,255,0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
}

.featureTitle {
	font-size: 24px;
	font-weight: 800;
	margin: 0;
}

.featureDesc {
	font-size: 14px;
	opacity: 0.9;
	margin: 0;
	line-height: 1.6;
}

.featureList {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;

	li {
		font-size: 13px;
		opacity: 0.9;
		display: flex;
		align-items: center;
		gap: 8px;

		i { font-size: 14px; opacity: 0.8; }
	}
}

.featureInspirationBadge {
	margin-top: auto;
	font-size: 11px;
	background: rgba(255,255,255,0.15);
	padding: 4px 10px;
	border-radius: 99px;
	align-self: flex-start;
	display: flex;
	align-items: center;
	gap: 5px;
}

/* Decentralized section */
.decentral {
	background: var(--panel);
	border-radius: 20px;
	padding: 40px 32px;
}

.decentralContent {
	max-width: 800px;
	margin: 0 auto;
}

.decentralTitle {
	font-size: 24px;
	font-weight: 800;
	color: var(--fg);
	margin: 0 0 12px;
	text-align: center;
}

.decentralDesc {
	font-size: 15px;
	color: var(--fgTransparentWeak);
	text-align: center;
	line-height: 1.7;
	margin: 0 0 28px;
}

.decentralPoints {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
}

.decentralPoint {
	display: flex;
	gap: 14px;
	align-items: flex-start;

	> i {
		font-size: 24px;
		color: var(--accent);
		flex-shrink: 0;
		margin-top: 2px;
	}

	div {
		display: flex;
		flex-direction: column;
		gap: 4px;

		strong {
			font-size: 14px;
			font-weight: 700;
			color: var(--fg);
		}

		span {
			font-size: 12px;
			color: var(--fgTransparentWeak);
			line-height: 1.5;
		}
	}
}
</style>
