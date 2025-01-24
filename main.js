import { renderBaseMapList } from "./map/BasemapList/basemapList.js";
import { renderActiveLayers, createLayerLegends } from "./map/ActiveLayers/activeLayers.js";
import { renderUnduhDataList } from "./map/UnduhData/unduhData.js";
import { initMap } from "./map/MapContainer/mapContainer.js";

// Variable global untuk menyimpan tools
let mapTools;

document.addEventListener("DOMContentLoaded", () => {
  console.log("yes, i am ready!");
  renderBaseMapList();
  renderActiveLayers();
  createLayerLegends();
  renderUnduhDataList();
  
  // Inisialisasi map dan simpan tools yang dikembalikan
  mapTools = initMap();

  // Set tools ke window object agar bisa diakses dari HTML
  window.tools = mapTools;

  // Event listeners untuk tombol measurement
  document.querySelector('[data-tool="measure-distance"]')?.addEventListener('click', () => {
    mapTools.measureTool.startMeasuring('distance');
  });

  document.querySelector('[data-tool="measure-area"]')?.addEventListener('click', () => {
    mapTools.measureTool.startMeasuring('area');
  });

  document.querySelector('[data-tool="measure-stop"]')?.addEventListener('click', () => {
    mapTools.measureTool.stopMeasuring();
  });

  // Event listeners untuk tombol buffer
  document.querySelector('[data-tool="buffer-start"]')?.addEventListener('click', () => {
    mapTools.bufferTool.startBuffer();
  });

  document.querySelector('[data-tool="buffer-stop"]')?.addEventListener('click', () => {
    mapTools.bufferTool.stopBuffer();
  });

  // Event listener untuk slider buffer radius
  document.querySelector('#buffer-radius')?.addEventListener('input', (e) => {
    const radius = parseInt(e.target.value);
    mapTools.bufferTool.setBufferRadius(radius);
    e.target.nextElementSibling.value = radius + ' m';
  });

  console.log("Map tools initialized:", mapTools);
});

// Export tools jika diperlukan di module lain
export { mapTools };