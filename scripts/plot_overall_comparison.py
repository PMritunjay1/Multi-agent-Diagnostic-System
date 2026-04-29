import matplotlib.pyplot as plt
import numpy as np
import json
import os

def generate_overall_chart():
    # Load baseline stats
    baseline_file = os.path.join("results", "baseline_statistics.json")
    with open(baseline_file, "r") as f:
        baseline_data = json.load(f)
    
    # Extract Benchmark metrics for Single-Agent
    bench_baseline = baseline_data["baseline_results"]["benchmark"]
    single_acc = bench_baseline["mean_accuracy"]
    single_conf = bench_baseline["mean_confidence"]
    single_agr = bench_baseline["mean_agreement"] # 0.0
    single_severe = bench_baseline["error_distribution_pct"]["severe"] / 100.0 # Convert % to 0-1 scale
    
    # Multi-Agent Benchmark metrics
    multi_acc = 0.88
    multi_conf = 0.722
    multi_agr = 0.6033
    multi_severe = 0.12
    
    labels = ['Accuracy', 'Confidence', 'Agreement Score', 'Severe Error Rate']
    single_scores = [single_acc, single_conf, single_agr, single_severe]
    multi_scores = [multi_acc, multi_conf, multi_agr, multi_severe]
    
    x = np.arange(len(labels))
    width = 0.35
    
    fig, ax = plt.subplots(figsize=(10, 6))
    rects1 = ax.bar(x - width/2, single_scores, width, label='Single-Agent Baseline (gpt-4o-mini)', color='#f28e2b')
    rects2 = ax.bar(x + width/2, multi_scores, width, label='Multi-Agent System (HealthInsight)', color='#4e79a7')
    
    ax.set_ylabel('Score / Rate (0.0 - 1.0)')
    ax.set_title('Overall Performance Comparison on Benchmark Set')
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylim(0, 1.1)
    ax.legend(loc='upper right')
    
    def autolabel(rects):
        for rect in rects:
            height = rect.get_height()
            ax.annotate(f'{height:.2f}',
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3),  
                        textcoords="offset points",
                        ha='center', va='bottom')
                        
    autolabel(rects1)
    autolabel(rects2)
    
    fig.tight_layout()
    plot_path = os.path.join("results", "overall_comparison_bar_chart.png")
    plt.savefig(plot_path, dpi=300)
    print(f"Saved plot to {plot_path}")

if __name__ == "__main__":
    generate_overall_chart()
