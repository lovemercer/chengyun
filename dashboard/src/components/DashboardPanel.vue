<template>
    <section class="dashboard-panel">

        <!-- 四角装饰 -->
        <span class="corner corner-tl"></span>
        <span class="corner corner-tr"></span>
        <span class="corner corner-bl"></span>
        <span class="corner corner-br"></span>

        <!-- 顶部标题 -->
        <div class="panel-header">

            <div class="title-wrap">
                <svg class="panel-arrow" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M4 2l8 6-8 6V2z" />
                </svg>
                <span class="panel-title">
                    {{ title }}
                </span>
            </div>

            <slot name="extra" />

        </div>

        <!-- 内容 -->
        <div class="panel-body">
            <slot />
        </div>

    </section>
</template>

<script setup lang="ts">
defineProps<{
    title: string
}>()
</script>

<style scoped>
.dashboard-panel {
    position: relative;

    width: 100%;
    height: 100%;

    padding: 14px;

    box-sizing: border-box;

    overflow: hidden;

    /* 背景以后你自己控制 */
    background:
        linear-gradient(180deg,
            rgba(5, 18, 45, .58),
            rgba(5, 18, 45, .25));

    backdrop-filter: blur(8px);

    border: 1px solid rgba(0, 229, 255, .35);
}

/* =======================
   外层发光
======================= */

.dashboard-panel::before {
    content: '';

    position: absolute;
    inset: 0;

    border: 1px solid rgba(0, 229, 255, .8);

    pointer-events: none;

    box-shadow:
        inset 0 0 14px rgba(0, 229, 255, .08),
        0 0 12px rgba(0, 229, 255, .15);
}

/* =======================
   标题区域
======================= */

.panel-header {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: space-between;

    height: 32px;

    margin-bottom: 10px;

    z-index: 2;
}

.title-wrap {
    display: flex;
    align-items: center;
}

.panel-arrow {
    width: 14px;
    height: 14px;

    color: #00e5ff;

    margin-right: 6px;

    flex-shrink: 0;

    filter: drop-shadow(0 0 4px #00e5ff);
}

.panel-title {
    color: #F8FAFC;

    font-family: 'Orbitron', sans-serif;
    font-size: 15px;
    font-weight: 700;

    letter-spacing: 2px;

    text-shadow:
        0 0 8px rgba(0, 229, 255, .5);
}

/* =======================
   内容区域
======================= */

.panel-body {
    position: relative;

    height: calc(100% - 42px);

    z-index: 2;
}

/* =======================
   四角科技角标
======================= */

.corner {
    position: absolute;

    width: 18px;
    height: 18px;

    border-color: #00e5ff;

    opacity: .9;

    pointer-events: none;
}

/* 左上 */
.corner-tl {
    top: 0;
    left: 0;

    border-top: 2px solid;
    border-left: 2px solid;
}

/* 右上 */
.corner-tr {
    top: 0;
    right: 0;

    border-top: 2px solid;
    border-right: 2px solid;
}

/* 左下 */
.corner-bl {
    left: 0;
    bottom: 0;

    border-left: 2px solid;
    border-bottom: 2px solid;
}

/* 右下 */
.corner-br {
    right: 0;
    bottom: 0;

    border-right: 2px solid;
    border-bottom: 2px solid;
}
</style>