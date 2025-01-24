import { setLayerReferences } from "../ActiveLayers/activeLayers.js";

import { setBaseMapLayers } from "../BasemapList/basemapList.js";

let map;
let basemapOSM;
let basemapImagery;
let risikoLayer;
let gelombangLayer;
let transportasiLayer;
let perairanLayer;
let kesehatanLayer;
let batasAdminLayer;
let plKonaweLayer;

// Fungsi untuk menambahkan fitur koordinat kursor
function addCursorCoordinates(map) {
  const coordinateDiv = document.createElement('div');
  coordinateDiv.className = 'ol-mouse-position';
  coordinateDiv.style.position = 'absolute';
  coordinateDiv.style.bottom = '6px';
  coordinateDiv.style.left = '38px';
  //coordinateDiv.style.backgroundColor = 'rgba(255,255,255,0.7)';
  coordinateDiv.style.padding = '2px 4px';
  coordinateDiv.style.border = '1px solid #ccc';
  coordinateDiv.style.borderRadius = '4px';
  coordinateDiv.style.fontSize = '12px';

  map.on('pointermove', (event) => {
    const coordinate = map.getEventCoordinate(event.originalEvent);
    const projectedCoordinate = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    const lon = projectedCoordinate[0].toFixed(6);
    const lat = projectedCoordinate[1].toFixed(6);
    coordinateDiv.textContent = `Lon: ${lon}°, Lat: ${lat}°`;
  });

  map.getViewport().appendChild(coordinateDiv);
}

function addMeasurementTool(map) {
  const source = new ol.source.Vector();
  const vectorLayer = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
      stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: '#ffcc33' })
      })
    })
  });
  map.addLayer(vectorLayer);

  let measureInteraction = null;
  let measureTooltip = null;
  let measureTooltipElement = null;

  function formatLength(line) {
    const length = ol.sphere.getLength(line);
    return length > 1000 ? 
      Math.round((length / 1000) * 100) / 100 + ' km' : 
      Math.round(length * 100) / 100 + ' m';
  }

  function formatArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    return area > 10000 ? 
      Math.round((area / 1000000) * 100) / 100 + ' km²' : 
      Math.round(area * 100) / 100 + ' m²';
  }

  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false
    });
    map.addOverlay(measureTooltip);
  }

  return {
    startMeasuring: function(type) {
      if (measureInteraction) {
        map.removeInteraction(measureInteraction);
      }
      source.clear();

      measureInteraction = new ol.interaction.Draw({
        source: source,
        type: type === 'area' ? 'Polygon' : 'LineString',
        style: new ol.style.Style({
          fill: new ol.style.Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
          stroke: new ol.style.Stroke({ color: '#ffcc33', width: 2 }),
          image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({ color: '#ffcc33' })
          })
        })
      });

      createMeasureTooltip();

      measureInteraction.on('drawstart', function(evt) {
        source.clear();
        let sketch = evt.feature;
        let tooltipCoord = evt.coordinate;

        let listener = sketch.getGeometry().on('change', function(evt) {
          const geom = evt.target;
          let output = type === 'area' ? formatArea(geom) : formatLength(geom);
          tooltipCoord = type === 'area' ? 
            geom.getInteriorPoint().getCoordinates() : 
            geom.getLastCoordinate();
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        });

        measureTooltipElement.innerHTML = type === 'area' ? '0 m²' : '0 m';
        measureTooltip.setPosition(tooltipCoord);
      });

      measureInteraction.on('drawend', function() {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        measureTooltipElement = null;
        createMeasureTooltip();
      });

      map.addInteraction(measureInteraction);
    },
    stopMeasuring: function() {
      if (measureInteraction) {
        map.removeInteraction(measureInteraction);
        measureInteraction = null;
      }
      
      // Remove all overlays with tooltip classes
      const overlaysToRemove = map.getOverlays().getArray().filter(overlay => {
        const element = overlay.getElement();
        return element && (
          element.classList.contains('ol-tooltip-measure') || 
          element.classList.contains('ol-tooltip-static')
        );
      });
    
      overlaysToRemove.forEach(overlay => map.removeOverlay(overlay));
    
      // Force clear source and reset variables
      source.clear();
      measureTooltip = null;
      measureTooltipElement = null;
    
      // Additional cleanup: manually remove any remaining tooltip elements
      const remainingTooltips = document.querySelectorAll('.ol-tooltip-measure, .ol-tooltip-static');
      remainingTooltips.forEach(el => el.remove());
    }
  };
}

function addEmergencyBuffer(map) {
  const source = new ol.source.Vector();
  const bufferLayer = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
      fill: new ol.style.Fill({ color: 'rgba(255, 0, 0, 0.2)' }),
      stroke: new ol.style.Stroke({ color: 'red', width: 2 })
    })
  });
  map.addLayer(bufferLayer);

  let bufferInteraction = null;
  let bufferRadius = 5000; // default 5000 meters

  return {
    startBuffer: function() {
      // Remove any existing interaction
      if (bufferInteraction) {
        map.removeInteraction(bufferInteraction);
      }

      bufferInteraction = new ol.interaction.Draw({
        source: source,
        type: 'Point'
      });

      bufferInteraction.on('drawend', function(evt) {
        source.clear(); // Remove previous buffers
        const point = evt.feature.getGeometry();
        const bufferGeometry = ol.geom.Polygon.fromCircle(
          new ol.geom.Circle(point.getCoordinates(), bufferRadius)
        );
        const bufferFeature = new ol.Feature(bufferGeometry);
        source.addFeature(bufferFeature);
      });

      map.addInteraction(bufferInteraction);
    },
    stopBuffer: function() {
      if (bufferInteraction) {
        map.removeInteraction(bufferInteraction);
        bufferInteraction = null;
      }
      source.clear();
    },
    setBufferRadius: function(radius) {
      bufferRadius = radius;
    }
  };
}

// 5. Location Search
async function addLocationSearch(map) {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'ol-search ol-unselectable ol-control';
  
  const searchWrapper = document.createElement('div');
  searchWrapper.style.position = 'relative';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Cari lokasi di Konawe Kepulauan...';

  const searchIcon = document.createElement('span');
  searchIcon.innerHTML = '🔍'; // You can replace with an SVG or icon font
  searchIcon.className = 'search-icon';

  const clearButton = document.createElement('span');
  clearButton.innerHTML = '✕';
  clearButton.className = 'clear-search';

  const resultsDiv = document.createElement('div');
  resultsDiv.className = 'search-results';

  searchWrapper.appendChild(input);
  searchWrapper.appendChild(searchIcon);
  searchWrapper.appendChild(clearButton);
  searchContainer.appendChild(searchWrapper);
  searchContainer.appendChild(resultsDiv);

  // Batas koordinat Konawe Kepulauan
  const KONAWE_BOUNDS = {
    minLon: 122.75,
    maxLon: 123.5,
    minLat: -4.5,
    maxLat: -3.5
  };

  async function searchLocation(query) {
    const fullQuery = `${query}, Konawe Kepulauan, Sulawesi Tenggara`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&viewbox=${KONAWE_BOUNDS.minLon},${KONAWE_BOUNDS.minLat},${KONAWE_BOUNDS.maxLon},${KONAWE_BOUNDS.maxLat}&bounded=1`
      );
      const data = await response.json();
      
      resultsDiv.innerHTML = '';
      if (data.length === 0) {
        const noResultDiv = document.createElement('div');
        noResultDiv.textContent = 'Tidak ada lokasi ditemukan';
        noResultDiv.style.color = '#888';
        noResultDiv.style.textAlign = 'center';
        resultsDiv.appendChild(noResultDiv);
      }

      data.forEach(result => {
        const lon = parseFloat(result.lon);
        const lat = parseFloat(result.lat);
        
        if (lon >= KONAWE_BOUNDS.minLon && lon <= KONAWE_BOUNDS.maxLon &&
            lat >= KONAWE_BOUNDS.minLat && lat <= KONAWE_BOUNDS.maxLat) {
          const div = document.createElement('div');
          div.textContent = result.display_name;
          div.addEventListener('click', () => {
            const coord = ol.proj.fromLonLat([lon, lat]);
            map.getView().animate({
              center: coord,
              zoom: 15,
              duration: 500
            });
            resultsDiv.innerHTML = '';
            input.value = result.display_name;
            clearButton.style.display = 'block';
          });
          resultsDiv.appendChild(div);
        }
      });
    } catch (error) {
      console.error('Pencarian lokasi gagal:', error);
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Gagal mencari lokasi. Periksa koneksi internet.';
      errorDiv.style.color = '#d9534f';
      errorDiv.style.textAlign = 'center';
      resultsDiv.appendChild(errorDiv);
    }
  }

  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    if (input.value.length >= 3) {
      timeout = setTimeout(() => {
        searchLocation(input.value);
        clearButton.style.display = input.value ? 'block' : 'none';
      }, 300);
    } else {
      resultsDiv.innerHTML = '';
      clearButton.style.display = 'none';
    }
  });

  clearButton.addEventListener('click', () => {
    input.value = '';
    resultsDiv.innerHTML = '';
    clearButton.style.display = 'none';
  });

  map.addControl(new ol.control.Control({
    element: searchContainer
  }));
}


export function initMap() {
  const url_risiko_banjir =
    "https://gis.bnpb.go.id/server/rest/services/" +
    "inarisk/layer_risiko_banjir/ImageServer";
    const url_gelombang_ekstrim =
    "https://gis.bnpb.go.id/server/rest/services/" +
    "inarisk/layer_risiko_gelombang_ekstrim_dan_abrasi/ImageServer";
  const url_imagery =
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

  basemapOSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: true, // Default base map
  });

  basemapImagery = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: url_imagery,
    }),
    visible: false, // Initially hidden
  });

  risikoLayer = new ol.layer.Image({
    source: new ol.source.ImageArcGISRest({
      ratio: 1,
      params: {},
      url: url_risiko_banjir,
    }),
    visible: false, // Initially visible
    opacity: 0.5
  });

  gelombangLayer = new ol.layer.Image({
    source: new ol.source.ImageArcGISRest({
      ratio: 1,
      params: {},
      url: url_gelombang_ekstrim,
    }),
    visible: false, // Initially visible
    opacity: 0.5
  });

  transportasiLayer = new ol.layer.Tile({
    visible: false, // harus diatas
    source: new ol.source.TileWMS({
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        'LAYERS': 'diklat_tommy:trasnportasi_LN',
        'TILED': true,
        'SRS': 'EPSG:32751'
      },
      serverType: 'geoserver',
      opacity: 0.7
    }),
  });

  perairanLayer = new ol.layer.Tile({
    visible: false,
    source: new ol.source.TileWMS({
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        'LAYERS': 'diklat_tommy:perairan_LN_tommy',
        'TILED': true,
        'SRS': 'EPSG:32751'
      },
      serverType: 'geoserver',
      opacity: 0.7
    })
  });
  
  kesehatanLayer = new ol.layer.Tile({
    visible: false,
    source: new ol.source.TileWMS({
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        'LAYERS': 'diklat_tommy:kesehatan_PT',
        'TILED': true,
        'SRS': 'EPSG:32751'
      },
      serverType: 'geoserver',
      opacity: 0.7
    })
  });
  
  batasAdminLayer = new ol.layer.Tile({
    visible: false,
    source: new ol.source.TileWMS({
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        'LAYERS': 'diklat_tommy:Batas_admin_konkep',
        'TILED': true,
        'SRS': 'EPSG:32751'
      },
      serverType: 'geoserver',
      opacity: 0.7
    })
  });
  
  plKonaweLayer = new ol.layer.Tile({
    visible: false,
    source: new ol.source.TileWMS({
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        'LAYERS': 'diklat_tommy:PL_KonaweKEP',
        'TILED': true,
        'SRS': 'EPSG:32751'
      },
      serverType: 'geoserver',
      opacity: 0.8,
      zIndex: -1
    })
  });

    // Create popup elements
    const container = document.createElement('div');
    container.className = 'ol-popup';
    const content = document.createElement('div');
    content.id = 'popup-content';
    const closer = document.createElement('a');
    closer.className = 'ol-popup-closer';
    container.appendChild(closer);
    container.appendChild(content);
  
    // Create overlay for popup
    const overlay = new ol.Overlay({
      element: container,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });
  
    // Add popup closer functionality
    closer.onclick = function() {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };
  
    // Initialize map
    map = new ol.Map({
      target: "map-container",
      //urutan penutup lahan diatas agar posisi paling bawah layer
      layers: [basemapOSM, basemapImagery, plKonaweLayer, risikoLayer, gelombangLayer, transportasiLayer, 
               perairanLayer, kesehatanLayer, batasAdminLayer],
      overlays: [overlay],
      view: new ol.View({
        center: ol.proj.fromLonLat([123.08974139956345, -4.113873458353]),
        zoom: 11.4,
        minZoom: 11,
        maxZoom: 18,
        extent: ol.proj.transformExtent(
          [122.75, -4.5, 123.5, -3.5],
          "EPSG:4326",
          "EPSG:3857"
        ),
      }),
      controls: [
        new ol.control.FullScreen(),
        new ol.control.ScaleLine(),
        new ol.control.Zoom(),
        new ol.control.ZoomSlider(),
      ],
    });
  
    // Prevent default context menu
    map.getViewport().addEventListener('contextmenu', function (evt) {
      evt.preventDefault();
    });
  
    // Add right-click event handler for popup
    map.on('contextmenu', async function(evt) {
      const coordinate = evt.coordinate;
      const lonLat = ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
      
      // Format coordinates
      const lon = lonLat[0].toFixed(6);
      const lat = lonLat[1].toFixed(6);
  
      let featuresInfo = '';
      const visibleLayers = [
        { layer: transportasiLayer, name: 'Transportasi' },
        { layer: perairanLayer, name: 'Perairan' },
        { layer: kesehatanLayer, name: 'Kesehatan' },
        { layer: batasAdminLayer, name: 'Batas Administrasi' },
        { layer: plKonaweLayer, name: 'PL Konawe' }
      ];
  
      // Get features info from visible WMS layers
      for (const { layer, name } of visibleLayers) {
        if (layer.getVisible()) {
          const source = layer.getSource();
          const viewResolution = map.getView().getResolution();
          const url = source.getFeatureInfoUrl(
            coordinate,
            viewResolution,
            'EPSG:3857',
            {
              'INFO_FORMAT': 'application/json',
              'FEATURE_COUNT': 10
            }
          );
  
          if (url) {
            try {
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                  featuresInfo += `<h4>${name}:</h4>`;
                  data.features.forEach(feature => {
                    const properties = feature.properties;
                    Object.keys(properties).forEach(key => {
                      if (properties[key] != null) {
                        featuresInfo += `<strong>${key}:</strong> ${properties[key]}<br>`;
                      }
                    });
                  });
                }
              }
            } catch (error) {
              console.error(`Error fetching ${name} info:`, error);
            }
          }
        }
      }
  
      // Get INARISK layer information if visible
      const inariskLayers = [
        { layer: risikoLayer, name: 'Risiko Banjir' },
        { layer: gelombangLayer, name: 'Risiko Gelombang Ekstrim' }
      ];
  
      for (const { layer, name } of inariskLayers) {
        if (layer.getVisible()) {
          try {
            const source = layer.getSource();
            const url = source.getFeatureInfoUrl(
              coordinate,
              map.getView().getResolution(),
              'EPSG:3857',
              {
                'INFO_FORMAT': 'application/json',
                'FEATURE_COUNT': 1
              }
            );
            
            if (url) {
              const response = await fetch(url);
              if (response.ok) {
                const data = await response.json();
                if (data.value !== undefined) {
                  featuresInfo += `<h4>${name}:</h4>`;
                  featuresInfo += `<strong>Nilai Risiko:</strong> ${data.value}<br>`;
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching ${name} info:`, error);
          }
        }
      }
  
      // Create popup content
      const popupContent = `
        <h3>Informasi Lokasi</h3>
        <p>
          <strong>Longitude:</strong> ${lon}°<br>
          <strong>Latitude:</strong> ${lat}°
        </p>
        ${featuresInfo || '<p>Tidak ada informasi layer yang tersedia di lokasi ini</p>'}
      `;
  
      content.innerHTML = popupContent;
      overlay.setPosition(coordinate);
    });

  // Pass layer references to other modules
  setBaseMapLayers({ basemapOSM, basemapImagery });
  setLayerReferences({ 
    risikoLayer, 
    gelombangLayer, 
    transportasiLayer, 
    perairanLayer, 
    kesehatanLayer, 
    batasAdminLayer, 
    plKonaweLayer 
  });

   // Add measurement tool
   const measureTool = addMeasurementTool(map);
  
   // Add emergency buffer tool
   const bufferTool = addEmergencyBuffer(map);
   
   // Add location search specific to Konawe Kepulauan
   addLocationSearch(map);

   // Tambahkan fitur koordinat kursor
  addCursorCoordinates(map);

 
   // Return tools for external control
   return {
     measureTool,
     bufferTool
   };
}
