<template>
  <div class="bg-transparent app-title-main w-fc">
    <svg
    class="app-title-main bg-transparent w-440 h-40"
    xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="muster" width="5" height="5" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="100" y2="100" stroke="#3333334f" stroke-width="0.3" />
        </pattern>
        <linearGradient
        id="grad1" x1="0%" y1="0%" x2="100%" y2="0%"
        gradientUnits="userSpaceOnUse"
        clip-path="url(#text-clip)"
        >
          <stop v-for="(stop, index) in stops"
          :key="index"
          :offset="stop.offset"
          :stop-color="stop.color"
          :stop-opacity="stop.opacity" />
        </linearGradient>
        <clipPath id="text-1">
          <text
          x="1"
          y="35"
          font-family="Roboto black"
          font-weight="bold"
          stoke="#3333334f"
          stroke-width="1px"
          :font-size="`${fontSize}px`"
          >{{title}}</text>
        </clipPath>

      </defs>
      <text
        x="0%"
        y="35"
        font-family="Roboto black"
        font-weight="bold"
        stroke-width="1px"
        :font-size="`${fontSize}px`"
        fill="#3333334f"
        stroke="#3333334f"
        >
        {{title}}
      </text>
      <g clip-path="url(#text-1)">
        <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#grad1)"
        ></rect>
        <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="url(#muster)"
        ></rect>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
defineProps<{
  title: string;
  fontSize: number;
}>();
const stops = ref([
  { offset: '0%', color: '#db711b', opacity: 1 },
  { offset: '30%', color: '#e849b7', opacity: 1 },
  { offset: '60%', color: '#8d46eb', opacity: 1 },
  { offset: '100%', color: '#3863e5', opacity: 1 }
]);

</script>
