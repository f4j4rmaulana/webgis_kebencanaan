export function renderUnduhDataList() {
  const unduhDataListContainer = document.getElementById("unduhdata-list");
  
  // Configuration for downloadable data sources
  const downloadSources = [
    {
      id: 'download-risiko-banjir',
      name: 'Download Risiko Banjir (BNPB)',
      type: 'arcgis',
      url: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_risiko_banjir/ImageServer/exportImage',
      params: {
        f: 'image',
        format: 'kmz'
      }
    },
    {
      id: 'download-gelombang-ekstrim',
      name: 'Download Gelombang Ekstrim (BNPB)',
      type: 'arcgis',
      url: 'https://gis.bnpb.go.id/server/rest/services/inarisk/layer_risiko_gelombang_ekstrim_dan_abrasi/ImageServer/exportImage',
      params: {
        f: 'image',
        format: 'kmz'
      }
    },
    {
      id: 'download-transportasi',
      name: 'Download Transportasi (BIG)',
      type: 'wms',
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'diklat_tommy:trasnportasi_LN',
        outputFormat: 'shape-zip'
      }
    },
    {
      id: 'download-perairan',
      name: 'Download Perairan (BIG)',
      type: 'wms',
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'diklat_tommy:perairan_LN_tommy',
        outputFormat: 'shape-zip'
      }
    },
    {
      id: 'download-kesehatan',
      name: 'Download Kesehatan (BIG)',
      type: 'wms',
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'diklat_tommy:kesehatan_PT',
        outputFormat: 'shape-zip'
      }
    },
    {
      id: 'download-batas-admin',
      name: 'Download Batas Admin (BIG)',
      type: 'wms',
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'diklat_tommy:Batas_admin_konkep',
        outputFormat: 'shape-zip'
      }
    },
    {
      id: 'download-pl-konawe',
      name: 'Download PL Konawe (BIG)',
      type: 'wms',
      url: 'http://geoserver.big.go.id/geoserver/diklat_tommy/wms',
      params: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'diklat_tommy:PL_KonaweKEP',
        outputFormat: 'shape-zip'
      }
    }
  ];

  // Generate list group HTML
  const listGroupHtml = downloadSources.map(source => `
    <a href="#" id="${source.id}" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
      ${source.name}
      <span class="badge bg-primary rounded-pill">
        <i class="bi bi-download"></i>
      </span>
    </a>
  `).join('');

  unduhDataListContainer.innerHTML = `
    <div class="list-group">
      ${listGroupHtml}
    </div>
  `;

  // Add event listeners for download buttons
  downloadSources.forEach(source => {
    const downloadLink = document.getElementById(source.id);
    downloadLink.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await downloadData(source);
      } catch (error) {
        console.error(`Download error for ${source.name}:`, error);
        alert(`Failed to download ${source.name}. Please try again later.`);
      }
    });
  });
}

async function downloadData(source) {
  // Function to generate a filename based on the source
  const generateFilename = (source) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = source.name.toLowerCase()
      .replace(/download\s+/i, '')
      .replace(/\s+\(.*\)/i, '')
      .replace(/\s+/g, '_');
    
    // Determine file extension based on output format
    let extension = 'zip';
    if (source.params.format) {
      extension = source.params.format;
    } else if (source.params.outputFormat) {
      extension = source.params.outputFormat.split('-').pop();
    }

    return `${baseFilename}_${timestamp}.${extension}`;
  };

  // Construct full URL with parameters
  const url = new URL(source.url);
  Object.entries(source.params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  try {
    // Fetch the file
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the file blob
    const blob = await response.blob();

    // Create a link element to trigger download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    // Generate filename
    const filename = generateFilename(source);
    link.download = filename;

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error('Download failed:', error);
    throw error; // Re-throw to be caught by caller
  }
}