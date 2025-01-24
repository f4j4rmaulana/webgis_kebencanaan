let basemapOSM, basemapImagery;

export function setBaseMapLayers(layers) {
  console.log(layers);
  basemapOSM = layers.basemapOSM;
  basemapImagery = layers.basemapImagery;
}

export function renderBaseMapList() {
  const baseMapListContainer = document.getElementById("basemap-list");
  baseMapListContainer.innerHTML = `
      <div class="list-group">
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="radio" name="basemap" id="osm" value="osm" checked>
              OpenStreetMap
          </label>
          <label class="list-group-item list-group-item-action">
              <input class="form-check-input me-1" type="radio" name="basemap" id="esri" value="esri">
              Esri Imagery
          </label>
      </div>
  `;

  // Add event listeners for radio buttons
  const radioButtons = document.querySelectorAll('input[name="basemap"]');
  radioButtons.forEach((radioButton) => {
      radioButton.addEventListener("change", (event) => {
          switch (event.target.value) {
              case "osm":
                  basemapOSM.setVisible(true);
                  basemapImagery.setVisible(false);
                  break;
              case "esri":
                  basemapOSM.setVisible(false);
                  basemapImagery.setVisible(true);
                  break;
          }
      });
  });
}
