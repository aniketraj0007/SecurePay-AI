// js/csv-handler.js - Simulated CSV Processing & Batch Scoring

function initCSVHandler() {
    const csvInput = document.getElementById('csv-input');
    const dropZone = document.getElementById('drop-zone');
    const batchProgress = document.getElementById('batch-progress-container');
    const batchResults = document.getElementById('batch-results-panel');
    const progressBar = document.getElementById('batch-progress-bar');
    const progressPercent = document.getElementById('progress-percent');
    const batchStatus = document.getElementById('batch-status');
    const resultsTable = document.getElementById('batch-results-table').querySelector('tbody');

    if (csvInput && dropZone) {
        csvInput.addEventListener('change', handleFile);
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--brand-cyan)';
            dropZone.style.background = 'rgba(6, 182, 212, 0.05)';
        });
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--border-light)';
            dropZone.style.background = 'rgba(15, 23, 42, 0.45)';
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        });
    }

    function handleFile(e) {
        const file = e.target.files[0];
        if (file) processFile(file);
    }

    async function processFile(file) {
        if (!file.name.endsWith('.csv')) {
            alert("Please upload a valid CSV file.");
            return;
        }

        // Show progress UI
        dropZone.classList.add('hidden');
        batchProgress.classList.remove('hidden');
        
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("http://127.0.0.1:8000/upload-csv", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Backend offline");
            const data = await response.json();
            
            // Fast progress simulation
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                if (progress >= 100) {
                    clearInterval(interval);
                    renderResults(data);
                }
                progressBar.style.width = `${progress}%`;
                progressPercent.innerText = `${progress}%`;
            }, 100);

        } catch (error) {
            console.error("CSV Upload Error:", error);
            batchStatus.innerText = "Error: Backend server offline.";
            setTimeout(() => {
                dropZone.classList.remove('hidden');
                batchProgress.classList.add('hidden');
            }, 2000);
        }
    }

    function renderResults(data) {
        batchProgress.classList.add('hidden');
        batchResults.classList.remove('hidden');
        
        resultsTable.innerHTML = '';
        data.forEach(res => {
            const row = `
                <tr>
                    <td>${res.txn_id}</td>
                    <td><span class="badge ${res.status === 'Fraud' ? 'badge-danger' : (res.status === 'Suspicious' ? 'badge-warning' : 'badge-success')}">${res.score}%</span></td>
                    <td class="text-xs text-secondary">${res.reasons}</td>
                    <td class="font-bold ${res.status === 'Fraud' ? 'text-danger' : (res.status === 'Suspicious' ? 'text-warning' : 'text-success')}">${res.status === 'Fraud' ? 'BLOCK' : (res.status === 'Suspicious' ? 'REVIEW' : 'ALLOW')}</td>
                </tr>
            `;
            resultsTable.innerHTML += row;
        });
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

window.csvHandler = {
    initCSVHandler
};
