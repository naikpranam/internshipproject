// ===== DOM Elements =====
const dragDropArea = document.getElementById('dragDropArea');
const leafImageInput = document.getElementById('leafImageInput');
const browseBtn = document.getElementById('browseBtn');
const previewContainer = document.getElementById('previewContainer');
const previewImage = document.getElementById('previewImage');
const removeImageBtn = document.getElementById('removeImageBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsSection = document.querySelector('.results-section');
const downloadReportBtn = document.getElementById('downloadReportBtn');
const printReportBtn = document.getElementById('printReportBtn');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

let selectedImage = null;
let analysisData = null;

// ===== Disease Database =====
const diseaseDatabase = {
    'healthy': {
        name: '✅ Healthy Leaf',
        description: 'Your plant leaf is completely healthy with no visible signs of disease. The leaf shows vibrant green coloration and normal texture.',
        treatment: 'No treatment required. Continue with regular plant care including appropriate watering, sunlight exposure, and nutrient management.',
        prevention: 'Maintain optimal growing conditions, proper spacing, adequate ventilation, and regular monitoring of plant health.',
        severity: 'Healthy',
        icon: '🟢'
    },
    'powdery_mildew': {
        name: '⚠️ Powdery Mildew',
        description: 'Fungal disease causing white, powdery coating on leaves. Common in warm, dry conditions with poor air circulation.',
        treatment: 'Apply fungicide spray (sulfur or neem oil). Remove affected leaves. Improve air circulation. Spray every 7-10 days until resolved.',
        prevention: 'Ensure proper plant spacing, maintain humidity levels, avoid overhead watering, keep leaves dry.',
        severity: 'Moderate',
        icon: '🟡'
    },
    'leaf_spot': {
        name: '⚠️ Leaf Spot Disease',
        description: 'Fungal or bacterial disease creating brown or black spots. Spreads through water droplets and direct contact.',
        treatment: 'Remove infected leaves immediately. Apply copper-based fungicide. Improve air circulation and avoid wetting foliage.',
        prevention: 'Avoid overhead watering, practice crop rotation, maintain proper spacing, ensure good air flow.',
        severity: 'Moderate',
        icon: '🟡'
    },
    'early_blight': {
        name: '🔴 Early Blight',
        description: 'Fungal disease showing concentric brown rings on lower leaves first. Progresses upward as disease advances.',
        treatment: 'Remove infected leaves immediately. Apply fungicide containing chlorothalonil. Improve ventilation and remove lower branches.',
        prevention: 'Remove lower leaves preventively, avoid overhead irrigation, maintain cleanliness, ensure air circulation.',
        severity: 'Serious',
        icon: '🔴'
    },
    'late_blight': {
        name: '🔴 Late Blight',
        description: 'Serious fungal disease with water-soaked lesions and rapid leaf decay. Can destroy plants within days.',
        treatment: 'Apply copper fungicide immediately. Remove infected parts. Isolate the plant. Disinfect all tools used.',
        prevention: 'Good air circulation, avoid overhead watering, destroy infected materials, use resistant varieties.',
        severity: 'Very Serious',
        icon: '🔴'
    },
    'bacterial_blight': {
        name: '🔴 Bacterial Blight',
        description: 'Bacterial disease causing yellowing and wilting of leaves and stems. Spreads through water and contaminated tools.',
        treatment: 'Remove infected parts immediately. Apply copper bactericide. Sterilize pruning tools. Isolate the plant from others.',
        prevention: 'Use disease-resistant varieties, avoid overhead watering, maintain hygiene, sterilize equipment.',
        severity: 'Serious',
        icon: '🔴'
    },
    'rust': {
        name: '⚠️ Rust Disease',
        description: 'Fungal disease with rust-colored pustules on leaf undersides. Thrives in cool, humid conditions.',
        treatment: 'Apply sulfur-based fungicide. Remove infected leaves. Improve air circulation and sunlight exposure.',
        prevention: 'Space plants properly, avoid overhead irrigation, ensure ventilation, remove fallen leaves regularly.',
        severity: 'Moderate',
        icon: '🟡'
    }
};

// ===== Browse Button Click =====
browseBtn.addEventListener('click', () => {
    leafImageInput.click();
});

// ===== File Input Change =====
leafImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageSelect(file);
    }
});

// ===== Drag & Drop Events =====
dragDropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropArea.classList.add('dragover');
});

dragDropArea.addEventListener('dragleave', () => {
    dragDropArea.classList.remove('dragover');
});

dragDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            handleImageSelect(file);
        } else {
            alert('Please upload an image file!');
        }
    }
});

// ===== Handle Image Selection =====
function handleImageSelect(file) {
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB!');
        return;
    }

    selectedImage = file;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.onload = () => {
            dragDropArea.style.display = 'none';
            previewContainer.style.display = 'block';
        };
    };
    
    reader.readAsDataURL(file);
}

// ===== Remove Image =====
removeImageBtn.addEventListener('click', () => {
    selectedImage = null;
    previewImage.src = '';
    leafImageInput.value = '';
    dragDropArea.style.display = 'block';
    previewContainer.style.display = 'none';
});

// ===== Analyze Leaf =====
analyzeBtn.addEventListener('click', () => {
    if (!selectedImage) {
        alert('Please select an image first!');
        return;
    }

    loadingSpinner.style.display = 'block';
    previewContainer.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            setTimeout(() => {
                const analysis = analyzeLeafImage(img);
                displayResults(analysis);
                loadingSpinner.style.display = 'none';
            }, 2000);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(selectedImage);
});

// ===== Analyze Leaf Image =====
function analyzeLeafImage(imageElement) {
    // Get image dimensions
    const imageWidth = imageElement.width;
    const imageHeight = imageElement.height;
    const aspectRatio = (imageWidth / imageHeight).toFixed(2);
    const area = imageWidth * imageHeight;

    // Analyze image colors
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Color analysis
    let colorAnalysis = {
        red: 0,
        green: 0,
        blue: 0,
        yellow: 0,
        brown: 0,
        white: 0
    };

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r > g && r > b) colorAnalysis.red++;
        if (g > r && g > b) colorAnalysis.green++;
        if (b > r && b > g) colorAnalysis.blue++;
        if (r > 150 && g > 100 && b < 50) colorAnalysis.yellow++;
        if (r > 139 && g < 100 && b < 100) colorAnalysis.brown++;
        if (r > 200 && g > 200 && b > 200) colorAnalysis.white++;
    }

    const totalPixels = data.length / 4;
    const colorPercentages = {
        red: ((colorAnalysis.red / totalPixels) * 100).toFixed(2),
        green: ((colorAnalysis.green / totalPixels) * 100).toFixed(2),
        blue: ((colorAnalysis.blue / totalPixels) * 100).toFixed(2),
        yellow: ((colorAnalysis.yellow / totalPixels) * 100).toFixed(2),
        brown: ((colorAnalysis.brown / totalPixels) * 100).toFixed(2),
        white: ((colorAnalysis.white / totalPixels) * 100).toFixed(2)
    };

    // Determine leaf health
    let healthScore = 100;
    let disease = 'healthy';
    let leafType = 'Unknown';
    let leafCondition = 'Good';
    let dominantColor = 'Green';
    let leafTexture = 'Normal';

    // Disease detection logic
    if (colorPercentages.white > 15) {
        disease = 'powdery_mildew';
        healthScore = 60;
        leafCondition = 'Infected';
        dominantColor = 'White-Green';
        leafTexture = 'Powdery';
    } else if (colorPercentages.brown > 20 || colorPercentages.yellow > 15) {
        disease = 'leaf_spot';
        healthScore = 55;
        leafCondition = 'Diseased';
        dominantColor = 'Brown-Green';
        leafTexture = 'Spotted';
    } else if (colorPercentages.brown > 25) {
        disease = 'early_blight';
        healthScore = 40;
        leafCondition = 'Severely Diseased';
        dominantColor = 'Brown';
        leafTexture = 'Necrotic';
    } else if (colorPercentages.red > 15) {
        disease = 'rust';
        healthScore = 65;
        leafCondition = 'Infected';
        dominantColor = 'Red-Orange';
        leafTexture = 'Pustular';
    } else {
        healthScore = 95;
        leafCondition = 'Healthy';
        dominantColor = 'Green';
        leafTexture = 'Normal';
    }

    // Detect leaf type from dimensions
    if (aspectRatio < 1) {
        leafType = 'Round/Oval';
    } else if (aspectRatio > 2) {
        leafType = 'Linear/Elongated';
    } else {
        leafType = 'Cordate/Heart-shaped';
    }

    // Image quality assessment
    let imageQuality = 'Excellent';
    if (imageWidth < 300 || imageHeight < 300) {
        imageQuality = 'Low Resolution';
    } else if (imageWidth < 600 || imageHeight < 600) {
        imageQuality = 'Fair';
    }

    return {
        imageWidth,
        imageHeight,
        aspectRatio,
        area,
        healthScore,
        disease,
        leafType,
        leafCondition,
        dominantColor,
        leafTexture,
        imageQuality,
        colorPercentages,
        imageElement
    };
}

// ===== Display Results =====
function displayResults(analysis) {
    analysisData = analysis;

    // Update image
    document.getElementById('resultImage').src = previewImage.src;

    // Update dimensions
    document.getElementById('leafWidth').textContent = analysis.imageWidth;
    document.getElementById('leafHeight').textContent = analysis.imageHeight;
    document.getElementById('leafAspectRatio').textContent = analysis.aspectRatio;
    document.getElementById('leafArea').textContent = analysis.area.toLocaleString();
    document.getElementById('imageQuality').textContent = analysis.imageQuality;

    // Update health status
    const healthBar = document.getElementById('healthBar');
    document.getElementById('healthPercentage').textContent = analysis.healthScore + '%';
    healthBar.style.width = analysis.healthScore + '%';

    // Set health text based on score
    let healthText = 'Excellent condition - No issues detected';
    if (analysis.healthScore < 50) {
        healthText = 'Critical condition - Requires immediate treatment';
    } else if (analysis.healthScore < 70) {
        healthText = 'Poor condition - Treatment recommended';
    } else if (analysis.healthScore < 85) {
        healthText = 'Fair condition - Monitoring advised';
    }
    document.getElementById('healthText').textContent = healthText;

    // Update disease info
    const diseaseInfo = diseaseDatabase[analysis.disease];
    document.getElementById('diseaseName').textContent = diseaseInfo.icon + ' ' + diseaseInfo.name;
    document.getElementById('diseaseDescription').textContent = diseaseInfo.description;
    document.getElementById('diseaseTreatment').textContent = diseaseInfo.treatment;
    document.getElementById('diseasePrevention').textContent = diseaseInfo.prevention;

    // Set confidence based on health score
    const confidence = Math.min(100, 70 + (analysis.healthScore > 80 ? 20 : 0));
    document.getElementById('confidenceBar').style.width = confidence + '%';
    document.getElementById('confidencePercent').textContent = confidence + '%';

    // Update leaf information
    document.getElementById('leafType').textContent = analysis.leafType;
    document.getElementById('leafCondition').textContent = analysis.leafCondition;
    document.getElementById('dominantColor').textContent = analysis.dominantColor;
    document.getElementById('leafTexture').textContent = analysis.leafTexture;

    // Update color analysis
    updateColorAnalysis(analysis.colorPercentages);

    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== Update Color Analysis =====
function updateColorAnalysis(colors) {
    const colorStats = document.getElementById('colorStats');
    colorStats.innerHTML = '';

    const colorList = [
        { name: 'Green', value: colors.green, color: '#27ae60' },
        { name: 'Red', value: colors.red, color: '#e74c3c' },
        { name: 'Yellow', value: colors.yellow, color: '#f39c12' },
        { name: 'Brown', value: colors.brown, color: '#8b4513' },
        { name: 'White', value: colors.white, color: '#ecf0f1' },
        { name: 'Blue', value: colors.blue, color: '#3498db' }
    ];

    colorList.forEach(color => {
        const item = document.createElement('div');
        item.className = 'color-stat-item';
        item.innerHTML = `
            <div class="color-bar" style="background-color: ${color.color};"></div>
            <label>${color.name}</label>
            <span>${color.value}%</span>
        `;
        colorStats.appendChild(item);
    });
}

// ===== Tab Switching =====
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Remove active class
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// ===== Download Report =====
downloadReportBtn.addEventListener('click', () => {
    if (!analysisData) return;

    const diseaseInfo = diseaseDatabase[analysisData.disease];
    const reportContent = `
================================================================================
                   LEAF DISEASE ANALYSIS REPORT
================================================================================

Generated Date & Time: ${new Date().toLocaleString()}

================================================================================
                        IMAGE PROPERTIES
================================================================================

Width: ${analysisData.imageWidth} pixels
Height: ${analysisData.imageHeight} pixels
Aspect Ratio: ${analysisData.aspectRatio}
Area: ${analysisData.area.toLocaleString()} square pixels
Image Quality: ${analysisData.imageQuality}

================================================================================
                        LEAF CHARACTERISTICS
================================================================================

Leaf Type: ${analysisData.leafType}
Condition: ${analysisData.leafCondition}
Dominant Color: ${analysisData.dominantColor}
Texture: ${analysisData.leafTexture}

================================================================================
                        HEALTH STATUS
================================================================================

Health Score: ${analysisData.healthScore}%
Status: ${analysisData.healthScore > 80 ? 'HEALTHY' : analysisData.healthScore > 60 ? 'FAIR' : 'CRITICAL'}

================================================================================
                        DISEASE DETECTION
================================================================================

Disease: ${diseaseInfo.name}
Severity: ${diseaseInfo.severity}

Description:
${diseaseInfo.description}

Treatment:
${diseaseInfo.treatment}

Prevention:
${diseaseInfo.prevention}

================================================================================
                        COLOR ANALYSIS
================================================================================

Red: ${analysisData.colorPercentages.red}%
Green: ${analysisData.colorPercentages.green}%
Blue: ${analysisData.colorPercentages.blue}%
Yellow: ${analysisData.colorPercentages.yellow}%
Brown: ${analysisData.colorPercentages.brown}%
White: ${analysisData.colorPercentages.white}%

================================================================================

Report Generated by LeafAnalyzer Pro
Advanced Leaf Disease Detection & Analysis System

================================================================================
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent));
    element.setAttribute('download', `LeafAnalysis_${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('✅ Report downloaded successfully!');
});

// ===== Print Report =====
printReportBtn.addEventListener('click', () => {
    if (!analysisData) return;

    const diseaseInfo = diseaseDatabase[analysisData.disease];
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Leaf Analysis Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2 { color: #2ecc71; }
                .section { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 10px; border: 1px solid #ddd; }
                .header { background-color: #2ecc71; color: white; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>Leaf Disease Analysis Report</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            
            <div class="section">
                <h2>Image Properties</h2>
                <table>
                    <tr><td class="header">Width</td><td>${analysisData.imageWidth}px</td></tr>
                    <tr><td class="header">Height</td><td>${analysisData.imageHeight}px</td></tr>
                    <tr><td class="header">Aspect Ratio</td><td>${analysisData.aspectRatio}</td></tr>
                    <tr><td class="header">Area</td><td>${analysisData.area.toLocaleString()}sq px</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>Leaf Characteristics</h2>
                <table>
                    <tr><td class="header">Type</td><td>${analysisData.leafType}</td></tr>
                    <tr><td class="header">Condition</td><td>${analysisData.leafCondition}</td></tr>
                    <tr><td class="header">Color</td><td>${analysisData.dominantColor}</td></tr>
                    <tr><td class="header">Texture</td><td>${analysisData.leafTexture}</td></tr>
                </table>
            </div>

            <div class="section">
                <h2>Health Status</h2>
                <p><strong>Health Score: ${analysisData.healthScore}%</strong></p>
            </div>

            <div class="section">
                <h2>Disease Information</h2>
                <p><strong>Disease:</strong> ${diseaseInfo.name}</p>
                <p><strong>Description:</strong> ${diseaseInfo.description}</p>
                <p><strong>Treatment:</strong> ${diseaseInfo.treatment}</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
});

// ===== New Analysis =====
newAnalysisBtn.addEventListener('click', () => {
    selectedImage = null;
    previewImage.src = '';
    leafImageInput.value = '';
    dragDropArea.style.display = 'block';
    previewContainer.style.display = 'none';
    resultsSection.style.display = 'none';
    analysisData = null;
    
    document.querySelector('[data-tab="disease-details"]').click();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

console.log('✅ LeafAnalyzer Pro Ready!');
