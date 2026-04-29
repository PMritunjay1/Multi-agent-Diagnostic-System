# HealthInsight: A Multi-Agent Medical Diagnostic System

This repository contains the source code, evaluation framework, and dataset for **HealthInsight**, an advanced multi-agent medical diagnostic decision support system. The architecture is engineered to tackle the most dangerous failure modes of LLM-based medical AI: confident hallucinations, overconfidence, and opacity. 

By employing a deterministic consensus mechanism and parallel specialized agents, HealthInsight mimics a real-world medical consensus board to provide highly reliable, interpretable, and safe clinical assessments.

## 🔬 Core Architecture

The diagnostic pipeline follows strict parallelization and formal confidence calibration:
1. **RIE Module (Report Interpretation)**: Parses unstructured free-text symptom narratives into structured clinical entities.
2. **IPM Module (Intent Parsing)**: Categorizes the medical domain (Cardiology, Neurology, etc.) and urgency level to enable dynamic routing.
3. **Parallel Specialist Agents**: Dynamically invokes 3 domain-specialized agents (e.g., Cardiologist, Pulmonologist) to independently evaluate the case without shared context.
4. **RAC Module (Response Agreement & Calibration)**: The core safety mechanism. Calculates formal inter-agent agreement scores and mathematically penalizes the internal confidence of conflicting outputs.
5. **Final Consensus Agent**: Synthesizes the final diagnosis using a deterministic, domain-weighted argmax operation.

## 📊 Evaluation & Benchmarking

The system is rigorously evaluated against a 75-case adversarial medical benchmark specifically designed to test ambiguous and overlapping symptom presentations.

- **Accuracy**: The multi-agent ensemble achieved **88.0%** accuracy, outperforming the single-agent baseline (74.0%).
- **Calibration (ECE)**: Achieved an Expected Calibration Error below 0.10, proving the RAC module successfully mitigates dangerous LLM overconfidence.
- **Safety**: Reduced severe misclassification errors by nearly half.

All benchmark results and statistical evaluations are available in the `/results` directory.

## 🚀 Getting Started

The project is split into a Python backend (for the multi-agent pipeline and benchmarking) and a React frontend (for the UI demonstration).

### Prerequisites
- Python 3.10+
- Node.js (v18+)
- Active OpenAI API Key (configured for `gpt-4o-mini`)

### Backend Setup (Pipeline & Benchmarking)
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install requirements (ensure you have required packages like openai, matplotlib, numpy)
pip install -r requirements.txt

# Run the 75-case evaluation pipeline
python -m scripts.run_pipeline
```

### Frontend Setup (React UI)
```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

## 📄 Documentation

For full technical details, architectural flowcharts, and theoretical grounding, please see the final IEEE Project Report included in this repository: `ieee_project_report.md`.
