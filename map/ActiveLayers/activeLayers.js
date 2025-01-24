let risikoLayer;
let gelombangLayer;
let transportasiLayer;
let perairanLayer;
let kesehatanLayer;
let batasAdminLayer;
let plKonaweLayer;

export function setLayerReferences(layers) {
  risikoLayer = layers.risikoLayer;
  gelombangLayer = layers.gelombangLayer;
  transportasiLayer = layers.transportasiLayer;
  perairanLayer = layers.perairanLayer;
  kesehatanLayer = layers.kesehatanLayer;
  batasAdminLayer = layers.batasAdminLayer;
  plKonaweLayer = layers.plKonaweLayer;
}

export function createLayerLegends() {
  const legendContainer = document.getElementById('legend-container');
  legendContainer.innerHTML = ''; // Clear previous legends

  // Layer legend configurations with fallback options
  const layerLegendConfigs = {
    risikoLayer: {
      title: 'Risiko Banjir (BNPB)',
      legendUrls: [
        {
          url: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_risiko_banjir/ImageServer/legend',
          type: 'arcgis'
        }
      ],
      fallbackLegend: [
        { label: 'Risiko Banjir', color: '#FF0000', description: 'Zona Risiko Banjir' },
        { label: 'Rendah', color: '#FFFF00', description: 'Risiko Rendah' },
        { label: 'Sedang', color: '#FFA500', description: 'Risiko Sedang' },
        { label: 'Tinggi', color: '#FF0000', description: 'Risiko Tinggi' }
      ]
    },
    gelombangLayer: {
      title: 'Gelombang Ekstrim (BNPB)',
      legendUrls: [
        {
          url: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_risiko_gelombang_ekstrim_dan_abrasi/ImageServer/legend',
          type: 'arcgis'
        }
      ],
      fallbackLegend: [
        { label: 'Gelombang Ekstrim', color: '#0000FF', description: 'Zona Risiko Gelombang' },
        { label: 'Rendah', color: '#87CEEB', description: 'Risiko Rendah' },
        { label: 'Sedang', color: '#4169E1', description: 'Risiko Sedang' },
        { label: 'Tinggi', color: '#00008B', description: 'Risiko Tinggi' }
      ]
    },
    transportasiLayer: {
      title: 'Transportasi (BIG)',
      legendUrls: [
        {
          url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=diklat_tommy:trasnportasi_LN',
          type: 'wms'
        }
      ],
      fallbackLegend: [
        { label: 'Jalan Utama', color: '#FF0000', description: 'Jalan Utama' },
        { label: 'Jalan Sekunder', color: '#0000FF', description: 'Jalan Sekunder' }
      ]
    },
    perairanLayer: {
      title: 'Perairan (BIG)',
      legendUrls: [
        {
          url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=diklat_tommy:perairan_LN_tommy',
          type: 'wms'
        }
      ],
      fallbackLegend: [
        { label: 'Sungai', color: '#4169E1', description: 'Sungai' },
        { label: 'Danau', color: '#87CEEB', description: 'Danau' }
      ]
    },
    kesehatanLayer: {
      title: 'Kesehatan (BIG)',
      legendUrls: [
        {
          url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=diklat_tommy:kesehatan_PT',
          type: 'wms'
        }
      ],
      fallbackLegend: [
        { label: 'Rumah Sakit', color: '#FF0000', description: 'Rumah Sakit' },
        { label: 'Puskesmas', color: '#FFA500', description: 'Puskesmas' }
      ]
    },
    batasAdminLayer: {
      title: 'Batas Admin (BIG)',
      legendUrls: [
        {
          url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=diklat_tommy:Batas_admin_konkep',
          type: 'wms'
        }
      ],
      fallbackLegend: [
        { label: 'Batas Kabupaten', color: '#000000', description: 'Batas Kabupaten' },
        { label: 'Batas Kecamatan', color: '#808080', description: 'Batas Kecamatan' }
      ]
    },
    plKonaweLayer: {
      title: 'PL (BIG)',
      legendUrls: [
        {
          url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=diklat_tommy:PL_KonaweKEP',
          type: 'wms'
        }
      ],
      fallbackLegend: [
        { label: 'Penggunaan Lahan', color: '#228B22', description: 'Lahan Hijau' },
        { label: 'Pemukiman', color: '#A52A2A', description: 'Area Pemukiman' }
      ]
    }
  };

  // Layer references from the main map module
  const layerRefs = {
    risikoLayer,
    gelombangLayer,
    transportasiLayer,
    perairanLayer,
    kesehatanLayer,
    batasAdminLayer,
    plKonaweLayer
  };

  // Mapping of checkbox IDs to layer keys
  const checkboxMapping = {
    'layer1': 'risikoLayer',
    'layer2': 'gelombangLayer',
    'layer3': 'transportasiLayer',
    'layer4': 'perairanLayer',
    'layer5': 'kesehatanLayer',
    'layer6': 'batasAdminLayer',
    'layer7': 'plKonaweLayer'
  };

  // Function to create a legend using fallback method
  function createFallbackLegend(config) {
    const legendItem = document.createElement('div');
    legendItem.classList.add('legend-item');

    // Title for the legend
    const titleEl = document.createElement('h4');
    titleEl.textContent = config.title;
    legendItem.appendChild(titleEl);

    // Create fallback legend entries
    const fallbackLegendContainer = document.createElement('div');
    fallbackLegendContainer.classList.add('fallback-legend');

    config.fallbackLegend.forEach(entry => {
      const entryEl = document.createElement('div');
      entryEl.classList.add('legend-entry');

      const colorBox = document.createElement('div');
      colorBox.classList.add('legend-color-box');
      colorBox.style.backgroundColor = entry.color;

      const labelEl = document.createElement('span');
      labelEl.textContent = entry.label;

      entryEl.appendChild(colorBox);
      entryEl.appendChild(labelEl);
      fallbackLegendContainer.appendChild(entryEl);
    });

    legendItem.appendChild(fallbackLegendContainer);
    return legendItem;
  }

  // Function to fetch and create legend
  async function fetchLegend(layerKey) {
    const config = layerLegendConfigs[layerKey];
    const layerRef = layerRefs[layerKey];
    const checkboxId = Object.keys(checkboxMapping).find(
      key => checkboxMapping[key] === layerKey
    );
    const checkbox = document.getElementById(checkboxId);

    // Only create legend if layer is visible and checkbox is checked
    if (layerRef && layerRef.getVisible() && checkbox && checkbox.checked) {
      try {
        // Try each legend URL
        for (const legendSource of config.legendUrls) {
          try {
            const legendItem = document.createElement('div');
            legendItem.classList.add('legend-item');

            // Title for the legend
            const titleEl = document.createElement('h4');
            titleEl.textContent = config.title;
            legendItem.appendChild(titleEl);

            // Try to fetch legend image
            const legendImg = document.createElement('img');
            legendImg.src = legendSource.url;
            legendImg.alt = `${config.title} Legend`;
            legendImg.classList.add('legend-image');

            // Add error handling for image loading
            await new Promise((resolve, reject) => {
              legendImg.onload = resolve;
              legendImg.onerror = reject;
            });

            legendItem.appendChild(legendImg);
            legendContainer.appendChild(legendItem);
            return; // Success, exit the function
          } catch (imageError) {
            console.warn(`Failed to load legend image for ${layerKey}:`, imageError);
            // Continue to next URL or fallback
          }
        }

        // If all image URLs fail, use fallback legend
        const fallbackLegendItem = createFallbackLegend(config);
        legendContainer.appendChild(fallbackLegendItem);
      } catch (error) {
        console.error(`Error processing legend for ${layerKey}:`, error);
        
        // Always use fallback if all else fails
        const fallbackLegendItem = createFallbackLegend(config);
        legendContainer.appendChild(fallbackLegendItem);
      }
    }
  }

  // Fetch legends for active layers
  Object.keys(layerLegendConfigs).forEach(layerKey => {
    fetchLegend(layerKey);
  });
}

export function renderActiveLayers() {
  const activeLayersContainer = document.getElementById("active-layers");
  activeLayersContainer.innerHTML = `
      <div class="list-group">
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer1">
              Risiko Banjir (BNPB)
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer2">
              Gelombang Ekstrim (BNPB)
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer3">
              Transportasi (BIG)
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer4">
              Perairan (BIG)
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer5">
              Kesehatan (BIG)
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer6">
              Batas Admin (BIG)
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="checkbox" id="layer7">
              Penutup Lahan (BIG)
          </label>
      </div>
  `;

  // Add event listeners for checkboxes
  const layerCheckbox1 = document.getElementById("layer1");
  layerCheckbox1.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (risikoLayer) {
          risikoLayer.setVisible(isChecked);
      }
  });

  const layerCheckbox2 = document.getElementById("layer2");
  layerCheckbox2.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (gelombangLayer) {
          gelombangLayer.setVisible(isChecked);
      }
  });

  const layerCheckbox3 = document.getElementById("layer3");
  layerCheckbox3.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (transportasiLayer) {
          transportasiLayer.setVisible(isChecked);
      }
  });

  const layerCheckbox4 = document.getElementById("layer4");
  layerCheckbox4.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (perairanLayer) {
          perairanLayer.setVisible(isChecked);
      }
  });

  const layerCheckbox5 = document.getElementById("layer5");
  layerCheckbox5.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (kesehatanLayer) {
          kesehatanLayer.setVisible(isChecked);
      }
  });

  const layerCheckbox6 = document.getElementById("layer6");
  layerCheckbox6.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (batasAdminLayer) {
          batasAdminLayer.setVisible(isChecked);
      }
  });

  const layerCheckbox7 = document.getElementById("layer7");
  layerCheckbox7.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      if (plKonaweLayer) {
          plKonaweLayer.setVisible(isChecked);
      }
  });

  // Add event listeners to trigger legend update when checkboxes change
  const checkboxIds = ['layer1', 'layer2', 'layer3', 'layer4', 'layer5', 'layer6', 'layer7'];
  checkboxIds.forEach(id => {
    const checkbox = document.getElementById(id);
    checkbox.addEventListener('change', createLayerLegends);
  });
}
