<template>
  <div aria-hidden="true" class="marsupi-waves">
    <svg
      class="waves-svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1536 1024"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="
          M 1025 -80
          C 930 65 900 145 930 255
          C 950 335 1005 420 980 505
          C 960 585 875 640 840 745
          C 815 830 770 900 650 970
          L 500 1100 L 1650 1100 L 1650 -80 Z
        "
        fill="#356B5B"
      />

      <path
        d="
          M 1600 470
          C 1410 480 1380 560 1320 625
          C 1250 705 1200 735 1100 785
          C 1010 830 920 815 845 890
          C 790 950 755 1010 700 1100
          L 1650 1100 Z
        "
        fill="#A9C7B4"
      />

      <path
        d="
          M 1600 585
          C 1435 600 1400 665 1350 730
          C 1280 815 1180 825 1115 915
          C 1080 965 1045 1010 1000 1100
          L 1650 1100 Z
        "
        fill="#263D35"
      />

      <path
        d="
          M 1600 715
          C 1460 725 1415 805 1350 845
          C 1270 900 1215 920 1120 910
          C 1020 900 970 960 925 1100
          L 1650 1100 Z
        "
        fill="#E3B477"
      />

      <path
        d="
          M 935 860
          C 955 760 1020 710 1125 706
          C 1200 704 1200 690 1230 635
          C 1290 525 1420 525 1490 410
          C 1520 365 1540 335 1560 305
        "
        fill="none"
        stroke="#E3B477"
        stroke-linecap="round"
        stroke-width="3"
      />
    </svg>

  </div>
</template>

<style scoped>
.marsupi-waves {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.waves-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.quote-detail {
  display: block;
  width: 56px;
  height: 3px;
  margin-top: 24px;
  border-radius: 999px;
  background: #e3b477;
}

@media (max-width: 1023px) {
  .marsupi-waves {
    display: none;
  }
}
</style>
