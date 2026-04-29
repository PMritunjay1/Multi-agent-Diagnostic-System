
import React, { useState, useEffect } from 'react';
import SpecialtyIcon, { ChevronDownIcon, ChevronUpIcon } from './icons';
import { Agent, SpecialistReport } from '../types';

interface AgentCardProps {
  agent: Agent;
  report: SpecialistReport;
}

const renderAnalysis = (analysis: SpecialistReport['analysis']) => {
  if (typeof analysis === 'string') {
    return <p className="text-sm text-[var(--c-error)] bg-red-50 p-3 rounded-md border border-red-100">{analysis}</p>;
  }

  if (analysis && typeof analysis === 'object') {
    const { summary, keyFindings, potentialConditions, recommendations } = analysis;
    const hasContent = (arr: string[] | undefined) => arr && arr.length > 0;
    
    return (
      <div className="space-y-4 text-sm">
        {/* Summary Section */}
        {summary && (
             <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50">
                <p className="text-slate-700 italic leading-relaxed font-medium">"{summary}"</p>
            </div>
        )}

        {hasContent(keyFindings) && (
            <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span> Key Findings
            </h4>
            <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1 marker:text-blue-300">
                {keyFindings?.map((item, index) => <li key={`kf-${index}`}>{item}</li>)}
            </ul>
            </div>
        )}
        {hasContent(potentialConditions) && (
            <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> Potential Conditions
            </h4>
            <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1 marker:text-amber-300">
                {potentialConditions?.map((item, index) => <li key={`pc-${index}`}>{item}</li>)}
            </ul>
            </div>
        )}
        {hasContent(recommendations) && (
            <div>
            <h4 className="font-bold text-slate-900 mb-1.5 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Recommendations
            </h4>
            <ul className="list-disc list-outside ml-4 text-slate-600 space-y-1 marker:text-emerald-300">
                {recommendations?.map((item, index) => <li key={`r-${index}`}>{item}</li>)}
            </ul>
            </div>
        )}
      </div>
    );
  }

  return null;
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, report }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Expand the card by default if it is complete
    if (report.status === 'complete') {
      setIsExpanded(true);
    }
  }, [report.status]);

  const getStatusColor = () => {
      switch(report.status) {
          case 'complete': return 'bg-emerald-500';
          case 'loading': return 'bg-blue-500';
          case 'error': return 'bg-red-500';
          default: return 'bg-slate-300';
      }
  };

  return (
    <div className={`bg-white rounded-xl transition-all duration-300 flex flex-col h-full ${report.status === 'loading' ? 'shadow-lg ring-2 ring-blue-100 border-transparent' : 'shadow-sm border border-slate-200 hover:shadow-md'}`}>
      
      {/* Card Header */}
      <div 
        className="p-5 flex items-start justify-between cursor-pointer select-none" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 flex-shrink-0 ${report.status === 'complete' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                <SpecialtyIcon specialty={agent.name} className={`w-6 h-6 ${report.status === 'loading' ? 'animate-pulse text-blue-500' : ''}`} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">{agent.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`block w-1.5 h-1.5 rounded-full ${getStatusColor()} ${report.status === 'loading' ? 'animate-pulse' : ''}`}></span>
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {report.status === 'loading' ? 'Analyzing...' : report.status === 'complete' ? 'Analysis Ready' : report.status}
                    </span>
                    {report.status === 'complete' && report.analysis && report.analysis.confidenceScore !== undefined && (
                        <>
                           <span className="w-1 h-1 bg-slate-300 rounded-full mx-1"></span>
                           <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase ${report.analysis.confidenceScore >= 80 ? 'text-green-700 bg-green-100' : report.analysis.confidenceScore >= 40 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'}`}>
                             {report.analysis.confidenceScore}% Conf
                           </span>
                        </>
                    )}
                </div>
            </div>
        </div>
        {report.status === 'complete' && (
             <div className="text-slate-400 hover:text-slate-600 transition-colors">
                {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </div>
        )}
      </div>

      {/* Content */}
      {report.status === 'complete' && isExpanded && (
          <div className="px-5 pb-6 pt-0 flex-grow border-t border-slate-50 animate-slideInBottom">
             <div className="mt-4">
               {renderAnalysis(report.analysis)}
             </div>
          </div>
      )}

      {/* Loading Skeleton */}
      {report.status === 'loading' && (
          <div className="px-5 pb-6 pt-2 space-y-3 opacity-50">
              <div className="h-2 bg-slate-100 rounded w-3/4 animate-pulse"></div>
              <div className="h-2 bg-slate-100 rounded w-1/2 animate-pulse"></div>
              <div className="h-2 bg-slate-100 rounded w-5/6 animate-pulse"></div>
          </div>
      )}
      
      {report.status === 'pending' && (
          <div className="px-5 pb-6 pt-0">
               <p className="text-xs text-slate-400 italic">Waiting for data stream...</p>
          </div>
      )}

    </div>
  );
};

export default AgentCard;
