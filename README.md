# 🏥 HealthInsight: A Multi-Agent Medical Diagnostic System

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HealthInsight** is an advanced multi-agent clinical decision support system designed to eliminate the most dangerous flaw of modern medical AI: confident hallucinations. 

Instead of relying on a single monolithic Large Language Model, HealthInsight routes patient symptoms to a dynamic board of **Specialized AI Agents** (Cardiology, Neurology, etc.). These agents cross-examine the case independently, and their outputs are synthesized through a rigorous, deterministic **Response Agreement and Calibration (RAC)** module. The result is a highly reliable diagnosis with mathematically bounded uncertainty.

---

## 🔬 Core Architecture

The pipeline mimics a real-world medical consensus board:

1. **RIE Module (Report Interpretation)**: Parses unstructured free-text symptom narratives into structured clinical entities.
2. **IPM Module (Intent Parsing)**: Categorizes the medical domain and urgency level to enable dynamic routing.
3. **Parallel Specialist Agents**: Dynamically invokes up to 3 domain-specialized agents to independently evaluate the case without shared context.
4. **RAC Module (Response Agreement & Calibration)**: The core safety mechanism. Calculates formal inter-agent agreement scores and mathematically penalizes the internal confidence of conflicting outputs.
5. **Final Consensus**: Synthesizes the final diagnosis using a deterministic, domain-weighted argmax operation.

---

## 📊 Evaluation & Performance

The system was rigorously evaluated against a highly adversarial clinical benchmark designed to test ambiguous and overlapping symptom presentations.

### Comparative Benchmark Results

| System Architecture | Task Type | Accuracy | Mean Confidence | Severe Errors | ECE (Calibration) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Single-Agent Baseline (GPT-4o) | Open-ended | 74.00% | 0.84 (Overconfident) | 22.0% | > 0.15 |
| **HealthInsight (Multi-Agent + RAC)** | Open-ended | **88.00%** | **0.72 (Calibrated)** | **12.0%** | **< 0.10** |

*Our architecture achieved an 88% diagnostic accuracy while reducing severe medical errors by nearly half. Most importantly, the RAC module strictly bounds the Expected Calibration Error (ECE) under 0.10, ensuring the AI only expresses high confidence when the specialized agents reach a genuine, corroborated consensus.*

---

## 🚀 Getting Started

The project is split into a Python backend (for the multi-agent pipeline and benchmarking) and a React frontend (for the UI demonstration).

### Prerequisites
- Python 3.10+
- Node.js (v18+)
- Active OpenAI API Key (configured for `gpt-4o-mini`)

### 1. Backend Setup (Pipeline & Eval)
```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Set up your environment variables
# Create a .env file and add: OPENAI_API_KEY=your_key_here

# Run the evaluation pipeline
python -m scripts.run_pipeline
```

### 2. Frontend Setup (React UI)
```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

---

*Developed as a Minor Project under supervision of Dr. Yatendra Sahu at the Indian Institute of Information Technology, Bhopal.*
