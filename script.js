// Gerçek Veriler (2016-2026)
const historicalData = [
    { year: 2016, unemployment: 10.9, inflation: 8.53, gini: 0.404, crimeCount: 2721, eduBudget: 4.3, rehabPart: 42431, recidivism: 21.4, parole: 325410, catchRate: 94.2, prisonPop: 200727, sentenceDuration: 2.8 },
    { year: 2017, unemployment: 10.9, inflation: 11.92, gini: 0.405, crimeCount: 3494, eduBudget: 4.3, rehabPart: 48922, recidivism: 22.1, parole: 352817, catchRate: 93.8, prisonPop: 235888, sentenceDuration: 2.95 },
    { year: 2018, unemployment: 11.0, inflation: 20.30, gini: 0.408, crimeCount: 3679, eduBudget: 4.3, rehabPart: 55104, recidivism: 23.5, parole: 380224, catchRate: 95.1, prisonPop: 264842, sentenceDuration: 3.1 },
    { year: 2019, unemployment: 13.4, inflation: 11.84, gini: 0.395, crimeCount: 3623, eduBudget: 4.4, rehabPart: 62337, recidivism: 24.8, parole: 415168, catchRate: 96.3, prisonPop: 291546, sentenceDuration: 2.75 },
    { year: 2020, unemployment: 13.2, inflation: 14.60, gini: 0.410, crimeCount: 3682, eduBudget: 4.2, rehabPart: 31450, recidivism: 26.2, parole: 450112, catchRate: 96.8, prisonPop: 266831, sentenceDuration: 2.4 },
    { year: 2021, unemployment: 11.2, inflation: 36.08, gini: 0.401, crimeCount: 3801, eduBudget: 3.8, rehabPart: 35802, recidivism: 27.5, parole: 481206, catchRate: 97.1, prisonPop: 297019, sentenceDuration: 2.3 },
    { year: 2022, unemployment: 10.4, inflation: 64.27, gini: 0.415, crimeCount: 3984, eduBudget: 3.5, rehabPart: 78411, recidivism: 29.1, parole: 512300, catchRate: 97.4, prisonPop: 341497, sentenceDuration: 2.2 },
    { year: 2023, unemployment: 9.4, inflation: 64.77, gini: 0.433, crimeCount: 3773, eduBudget: 3.4, rehabPart: 92155, recidivism: 30.4, parole: 546375, catchRate: 97.9, prisonPop: 307668, sentenceDuration: 2.05 },
    { year: 2024, unemployment: 8.7, inflation: 44.38, gini: 0.413, crimeCount: 3801, eduBudget: 3.6, rehabPart: 104600, recidivism: 31.2, parole: 580450, catchRate: 98.2, prisonPop: 329151, sentenceDuration: 1.9 },
    { year: 2025, unemployment: 7.7, inflation: 30.89, gini: 0.410, crimeCount: 3422, eduBudget: 3.5, rehabPart: 112300, recidivism: 32.5, parole: 597725, catchRate: 98.5, prisonPop: 352410, sentenceDuration: 1.85 },
    { year: 2026, unemployment: 8.1, inflation: 32.37, gini: 0.410, crimeCount: 3422, eduBudget: 3.5, rehabPart: 118000, recidivism: 33.1, parole: 615000, catchRate: 98.3, prisonPop: 362422, sentenceDuration: 1.8 }
];

// Girdi Değişkenleri Durumu
let inputs = {
    unemployment: 8.1,
    inflation: 32.4,
    gini: 0.410,
    catchRate: 98.3,
    sentenceDuration: 1.8,
    eduBudget: 3.5
};

// Çıktı Değişkenleri Durumu (2026 Başlangıç)
let outputs = {
    crimeCount: 3422,
    recidivism: 33.1,
    prisonPop: 362422,
    parole: 615000,
    rehabPart: 118000
};

let simHistory = [];
let currentSimYear = 2026; // Son yıl

let crimeChart, prisonChart;

document.addEventListener('DOMContentLoaded', () => {
    setupSliders();
    initCharts();
    
    document.getElementById('runSimulationBtn').addEventListener('click', () => {
        advanceSimulation();
    });

    document.getElementById('toggleFullscreen').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Tam ekran hatası: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
});

function setupSliders() {
    const keys = Object.keys(inputs);
    keys.forEach(key => {
        const el = document.getElementById(key);
        const valEl = document.getElementById(`${key}-val`);
        
        el.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            // Gini için özel ondalık
            valEl.innerText = key === 'gini' ? val.toFixed(3) : val.toFixed(1);
            inputs[key] = val;
            
            // Slider değiştiğinde "gelecekteki durumu anlık tahmin et"
            calculateProjection();
        });
    });
}

function calculateProjection() {
    // 2026 Baz Değerleri
    const base = historicalData[historicalData.length - 1];
    
    // Suç Sayısı Tahmini: İşsizlik, Enflasyon ve Gini artırır; Yakalanma ve Ceza süresi düşürür.
    let crimeDelta = (inputs.unemployment - base.unemployment) * 50 
                   + (inputs.inflation - base.inflation) * 8 
                   + (inputs.gini - base.gini) * 2000 
                   - (inputs.catchRate - base.catchRate) * 30 
                   - (inputs.sentenceDuration - base.sentenceDuration) * 150;
    
    outputs.crimeCount = Math.max(1000, Math.round(base.crimeCount + crimeDelta));

    // Tekrar Suç İşleme (%): Eğitim düşürür, İşsizlik artırır, Ceza süresinin düşmesi artırır.
    let recDelta = (inputs.unemployment - base.unemployment) * 0.4 
                 - (inputs.sentenceDuration - base.sentenceDuration) * 2.0 
                 - (inputs.eduBudget - base.eduBudget) * 1.5;
    
    outputs.recidivism = Math.max(10, Math.min(85, base.recidivism + recDelta));

    // Cezaevi Mevcudu: Suç sayısına ve yatar süresine doğrudan bağlı
    outputs.prisonPop = Math.round(outputs.crimeCount * 105 * (inputs.sentenceDuration / 1.8));

    // Denetimli Serbestlik: Cezaevi süresi düştükçe denetimli serbestlik artar
    outputs.parole = Math.round(outputs.crimeCount * 180 * (1.8 / inputs.sentenceDuration));

    // Rehabilitasyon Katılımı: Hapishane mevcudu ve Eğitim bütçesi ile doğru orantılı
    outputs.rehabPart = Math.round(outputs.prisonPop * 0.325 * (inputs.eduBudget / 3.5));

    updateDashboard(base);
}

function updateDashboard(base) {
    document.getElementById('outCrimeCount').innerText = outputs.crimeCount.toLocaleString('tr-TR');
    document.getElementById('outRecidivism').innerText = `%${outputs.recidivism.toFixed(1)}`;
    document.getElementById('outPrisonPop').innerText = outputs.prisonPop.toLocaleString('tr-TR');
    document.getElementById('outParole').innerText = outputs.parole.toLocaleString('tr-TR');
    document.getElementById('outRehab').innerText = outputs.rehabPart.toLocaleString('tr-TR');

    setTrend('trendCrimeCount', outputs.crimeCount - (simHistory.length > 0 ? simHistory[simHistory.length-1].crimeCount : base.crimeCount));
    setTrend('trendRecidivism', outputs.recidivism - (simHistory.length > 0 ? simHistory[simHistory.length-1].recidivism : base.recidivism), true);
    setTrend('trendPrisonPop', outputs.prisonPop - (simHistory.length > 0 ? simHistory[simHistory.length-1].prisonPop : base.prisonPop));
    setTrend('trendParole', outputs.parole - (simHistory.length > 0 ? simHistory[simHistory.length-1].parole : base.parole));
    setTrend('trendRehab', outputs.rehabPart - (simHistory.length > 0 ? simHistory[simHistory.length-1].rehabPart : base.rehabPart));
}

function setTrend(elementId, diff, isPercentage = false) {
    const el = document.getElementById(elementId);
    if (diff > 0) {
        el.className = 'stat-trend trend-up';
        el.innerHTML = `<i class="fa-solid fa-arrow-up"></i> +${isPercentage ? diff.toFixed(1) : Math.round(diff).toLocaleString('tr-TR')}`;
        if(elementId === 'trendRehab' || elementId === 'trendParole') el.className = 'stat-trend trend-down'; // Rehab artması iyidir (Yeşil)
    } else if (diff < 0) {
        el.className = 'stat-trend trend-down';
        el.innerHTML = `<i class="fa-solid fa-arrow-down"></i> ${isPercentage ? diff.toFixed(1) : Math.round(diff).toLocaleString('tr-TR')}`;
        if(elementId === 'trendRehab' || elementId === 'trendParole') el.className = 'stat-trend trend-up'; // Rehab azalması kötüdür (Kırmızı)
    } else {
        el.className = 'stat-trend';
        el.innerHTML = `<i class="fa-solid fa-minus"></i> 0`;
    }
}

function advanceSimulation() {
    currentSimYear++;
    
    // Girdi parametrelerini bir miktar "rastgele dalgalandır" veya sabit tut
    // Burada kullanıcının girdiği slider değerleri ile o yılı kaydediyoruz.
    
    simHistory.push({
        year: currentSimYear,
        crimeCount: outputs.crimeCount,
        prisonPop: outputs.prisonPop,
        recidivism: outputs.recidivism,
        parole: outputs.parole,
        rehabPart: outputs.rehabPart
    });

    updateCharts();
}

function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    const ctxCrime = document.getElementById('crimeChart').getContext('2d');
    crimeChart = new Chart(ctxCrime, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: getChartOptions('Suç Sayısı')
    });

    const ctxPrison = document.getElementById('prisonChart').getContext('2d');
    prisonChart = new Chart(ctxPrison, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: getChartOptions('Kişi Sayısı')
    });

    updateCharts();
}

function getChartOptions(yLabel) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.parsed.y.toLocaleString('tr-TR');
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(255,255,255,0.05)' },
                title: { display: true, text: yLabel }
            },
            x: {
                grid: { display: false }
            }
        }
    };
}

function updateCharts() {
    const labels = [];
    const histCrime = [], simCrime = [];
    const histPrison = [], simPrison = [];
    const histParole = [], simParole = [];

    // Gerçek Veriler
    historicalData.forEach(d => {
        labels.push(d.year);
        histCrime.push(d.crimeCount);
        simCrime.push(null);
        
        histPrison.push(d.prisonPop);
        simPrison.push(null);

        histParole.push(d.parole);
        simParole.push(null);
    });

    // Bağlantı noktaları (Çizgilerin kopmaması için son yılı simülasyona da ekle)
    const lastHistIndex = historicalData.length - 1;
    simCrime[lastHistIndex] = histCrime[lastHistIndex];
    simPrison[lastHistIndex] = histPrison[lastHistIndex];
    simParole[lastHistIndex] = histParole[lastHistIndex];

    // Simülasyon Verileri
    simHistory.forEach(d => {
        labels.push(d.year);
        histCrime.push(null);
        histPrison.push(null);
        histParole.push(null);

        simCrime.push(d.crimeCount);
        simPrison.push(d.prisonPop);
        simParole.push(d.parole);
    });

    // Suç Grafiğini Güncelle
    crimeChart.data.labels = labels;
    crimeChart.data.datasets = [
        createDataset('Tarihsel Veri (Suç)', histCrime, '#94a3b8', true),
        createDataset('Projeksiyon (Suç)', simCrime, '#ef4444', false)
    ];
    crimeChart.update();

    // Cezaevi ve Denetimli Serbestlik Grafiğini Güncelle
    prisonChart.data.labels = labels;
    prisonChart.data.datasets = [
        createDataset('Tarihsel Cezaevi', histPrison, '#94a3b8', true),
        createDataset('Projeksiyon Cezaevi', simPrison, '#ef4444', false),
        createDataset('Tarihsel Denetimli Serbestlik', histParole, '#64748b', true, [5,5]),
        createDataset('Projeksiyon Denetimli', simParole, '#3b82f6', false, [5,5])
    ];
    prisonChart.update();
}

function createDataset(label, data, color, isDashed, borderDashParams = [5, 5]) {
    return {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
        borderWidth: isDashed ? 2 : 3,
        borderDash: isDashed ? borderDashParams : [],
        tension: 0.4,
        fill: false,
        pointBackgroundColor: color,
        pointRadius: isDashed ? 0 : 4
    };
}
