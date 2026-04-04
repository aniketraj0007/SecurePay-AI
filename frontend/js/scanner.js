// js/scanner.js - XAI Inference Scanner & Quick Scan Logic

function initScanner() {
    const btnRunInference = document.getElementById('btn-run-inference');
    if (btnRunInference) {
        btnRunInference.addEventListener('click', () => {
            document.getElementById('inference-empty').classList.add('hidden');
            document.getElementById('inference-result').classList.add('hidden');
            document.getElementById('inference-loading').classList.remove('hidden');

            setTimeout(async () => {
                document.getElementById('inference-loading').classList.add('hidden');
                document.getElementById('inference-result').classList.remove('hidden');

                const rScoreEl = document.getElementById('r-score');
                const rActionEl = document.getElementById('r-action');
                const rJsonEl = document.getElementById('r-json');

        // --- REAL FASTAPI BACKEND CALL ---
        try {
            const amountVal = 45000; // Simulated for demo, could be from UI
            const response = await fetch("http://127.0.0.1:8000/check-fraud", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: amountVal, 
                    location: "Mumbai, IN", 
                    device: "New" 
                })
            });

            if (!response.ok) throw new Error("Backend offline");
            const data = await response.json();

            rScoreEl.innerText = data.score;
            rActionEl.innerText = data.recommendation;
            rActionEl.className = `badge badge-${data.status === 'Fraud' ? 'danger' : (data.status === 'Suspicious' ? 'warning' : 'success')} text-lg px-4 py-1`;
            
            const responsePayload = {
                inference_id: "rf_model_" + Math.random().toString(36).substr(2, 6),
                probability: (data.score / 100).toFixed(4),
                model_type: "Random Forest Classifier (XAI-Enabled)",
                classification: data.status,
                reasons: data.reasons,
                recommendation: data.recommendation
            };

            rJsonEl.innerText = JSON.stringify(responsePayload, null, 2);
        } catch (error) {
            console.error("Backend Error:", error);
            rScoreEl.innerText = "ERR";
            rActionEl.innerText = "OFFLINE";
            rJsonEl.innerText = JSON.stringify({ error: "FastAPI server not reachable. Run 'uvicorn main:app' in backend folder." }, null, 2);
        }
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 1800);
        });
    }
    
    // Quick Scan Modal Logic
    const btnQuickScan = document.getElementById('btn-quick-scan');
    const scanModal = document.getElementById('quick-scan-modal');
    const btnCloseScan = document.getElementById('btn-close-scan');
    const btnRunCheck = document.getElementById('btn-run-check');
    
    const scanFormView = document.getElementById('scan-form-view');
    const scanResultView = document.getElementById('scan-result-view');
    const scanSpinner = document.getElementById('scan-spinner');
    const scanDone = document.getElementById('scan-done');
    const scanAmt = document.getElementById('scan-amt');
    const appScreen = document.getElementById('app-screen');

    if(btnQuickScan) {
        btnQuickScan.addEventListener('click', () => {
            if(scanModal) scanModal.classList.remove('hidden');
            if(appScreen) appScreen.classList.add('blurred');
            
            // Reset state
            scanFormView.classList.remove('hidden');
            scanResultView.classList.add('hidden');
            scanDone.classList.add('hidden');
            scanSpinner.classList.add('hidden');
        });
    }

    if(btnCloseScan) {
        btnCloseScan.addEventListener('click', () => {
            if(scanModal) scanModal.classList.add('hidden');
            if(appScreen) appScreen.classList.remove('blurred');
        });
    }

    if(btnRunCheck) {
        btnRunCheck.addEventListener('click', () => {
            if(!scanAmt.value) return;
            scanFormView.classList.add('hidden');
            scanResultView.classList.remove('hidden');
            scanSpinner.classList.remove('hidden');

            setTimeout(() => {
                scanSpinner.classList.add('hidden');
                scanDone.classList.remove('hidden');
                
                const amt = parseInt(scanAmt.value);
                const isHighRisk = amt > 20000;
                const riskVal = isHighRisk ? Math.floor(Math.random() * 15) + 85 : Math.floor(Math.random() * 20) + 5;
                
                const riskText = document.getElementById('scan-output-risk');
                const reasonBadge = document.getElementById('scan-reason-badge');
                const reasonText = document.getElementById('scan-reason-text');
                const reasonBox = document.getElementById('scan-reason-box');

                riskText.innerText = riskVal + "%";
                riskText.style.color = isHighRisk ? 'var(--brand-danger)' : 'var(--brand-success)';
                
                if (isHighRisk) {
                    reasonBadge.innerText = "HIGH RISK";
                    reasonBadge.style.color = "#ef4444";
                    reasonBadge.style.background = "rgba(239, 68, 68, 0.15)";
                    reasonBox.style.background = "rgba(239, 68, 68, 0.1)";
                    reasonBox.style.borderColor = "rgba(239, 68, 68, 0.3)";
                    reasonText.innerText = "Reason: Unusually high transaction amount detected compared to account historical ticket size.";
                } else {
                    reasonBadge.innerText = "SAFE";
                    reasonBadge.style.color = "#10b981";
                    reasonBadge.style.background = "rgba(16, 185, 129, 0.15)";
                    reasonBox.style.background = "rgba(16, 185, 129, 0.1)";
                    reasonBox.style.borderColor = "rgba(16, 185, 129, 0.3)";
                    reasonText.innerText = "Reason: Activity matches normal purchasing patterns with reliable device fingerprint data.";
                }
            }, 1200);
        });
    }
}

window.scanner = {
    initScanner
};
