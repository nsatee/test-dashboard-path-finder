
import { Decision, PathFinderData, OutcomeType, SummaryStats } from '../types';

const generateDecisions = (count: number): Decision[] => {
  const outcomes: OutcomeType[] = ['right_call', 'wrong_call', 'unclear'];
  const tagsList = ['Strategy', 'Hiring', 'Product', 'Engineering', 'Marketing', 'Finance', 'Personal'];
  const decisions: Decision[] = [];

  const now = new Date();

  for (let i = 0; i < count; i++) {
    // Random date in last 90 days
    const frameDateObj = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 90);
    const frameDate = frameDateObj.toISOString().split('T')[0];

    const isSealed = Math.random() > 0.2; // 80% sealed
    let sealedDateObj: Date | null = null;
    let sealedDate: string | null = null;

    if (isSealed) {
        sealedDateObj = new Date(frameDateObj.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 7); // 0-7 days later
        sealedDate = sealedDateObj.toISOString().split('T')[0];
    }

    const isRetrospected = isSealed && Math.random() > 0.3; // 70% of sealed are retrospected
    let retrospectiveDateObj: Date | null = null;
    let retrospectiveDate: string | null = null;
    let outcome: OutcomeType = 'unclear';

    if (isRetrospected && sealedDateObj) {
        retrospectiveDateObj = new Date(sealedDateObj.getTime() + Math.random() * 1000 * 60 * 60 * 24 * 30); // 0-30 days later
        retrospectiveDate = retrospectiveDateObj.toISOString().split('T')[0];
        outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    }

    const initialConf = Math.floor(Math.random() * 40) + 50; // 50-90
    
    // Correlate final confidence with outcome for realism
    let finalConf = initialConf;
    if (outcome === 'right_call') finalConf = Math.min(100, initialConf + Math.random() * 20);
    else if (outcome === 'wrong_call') finalConf = Math.max(0, initialConf - Math.random() * 30);

    const numTags = Math.floor(Math.random() * 2) + 1;
    const selectedTags: string[] = [];
    for(let j=0; j<numTags; j++) {
      const tag = tagsList[Math.floor(Math.random() * tagsList.length)];
      if(!selectedTags.includes(tag)) selectedTags.push(tag);
    }

    let status: 'framed' | 'sealed' | 'retrospected' = 'framed';
    if (isRetrospected) status = 'retrospected';
    else if (isSealed) status = 'sealed';

    decisions.push({
      id: `dec-${i}`,
      title: `Decision #${i + 1}: ${selectedTags[0]} Initiative`,
      date: frameDate,
      sealedDate: sealedDate,
      retrospectiveDate: retrospectiveDate,
      outcome,
      initialConfidence: initialConf,
      finalConfidence: finalConf,
      stressLevel: Math.floor(Math.random() * 10),
      gutFeeling: Math.floor(Math.random() * 10), // New field
      tags: selectedTags,
      status
    });
  }
  return decisions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const calculateStats = (decisions: Decision[]): SummaryStats => {
    const totalDecisions = decisions.length;
    const sealed = decisions.filter(d => d.sealedDate);
    const retrospected = decisions.filter(d => d.retrospectiveDate);
    
    const sealedCount = sealed.length;
    const retrospectCount = retrospected.length;

    let totalSealTime = 0;
    sealed.forEach(d => {
        const start = new Date(d.date).getTime();
        const end = new Date(d.sealedDate!).getTime();
        totalSealTime += (end - start);
    });

    let totalRetroTime = 0;
    retrospected.forEach(d => {
        const start = new Date(d.sealedDate!).getTime();
        const end = new Date(d.retrospectiveDate!).getTime();
        totalRetroTime += (end - start);
    });

    // Tag analysis
    const tagCounts: Record<string, { total: number, success: number }> = {};
    decisions.forEach(d => {
        d.tags.forEach(t => {
            if (!tagCounts[t]) tagCounts[t] = { total: 0, success: 0 };
            tagCounts[t].total++;
            if (d.outcome === 'right_call') tagCounts[t].success++;
        });
    });

    let mostCommonPath = '-';
    let maxCount = 0;
    let mostSuccessfulPath = { name: '-', rate: 0 };
    let maxSuccessRate = -1;
    let pathWithMostDecisions = { name: '-', count: 0 };

    Object.entries(tagCounts).forEach(([tag, stats]) => {
        if (stats.total > maxCount) {
            maxCount = stats.total;
            mostCommonPath = tag;
            pathWithMostDecisions = { name: tag, count: stats.total };
        }
        const rate = stats.total > 0 ? (stats.success / stats.total) : 0;
        if (rate > maxSuccessRate && stats.total > 2) { // Minimum threshold
            maxSuccessRate = rate;
            mostSuccessfulPath = { name: tag, rate: Math.round(rate * 100) };
        }
    });

    return {
        totalDecisions,
        sealedCount,
        sealRate: Math.round((sealedCount / totalDecisions) * 100) || 0,
        retrospectCount,
        completionRate: Math.round((retrospectCount / totalDecisions) * 100) || 0,
        avgDaysToSeal: parseFloat((totalSealTime / sealedCount / (1000 * 60 * 60 * 24)).toFixed(1)) || 0,
        avgDaysToRetrospect: parseFloat((totalRetroTime / retrospectCount / (1000 * 60 * 60 * 24)).toFixed(1)) || 0,
        mostCommonPath,
        mostSuccessfulPath,
        pathWithMostDecisions
    };
};

export const getPathFinderData = async (): Promise<PathFinderData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const decisions = generateDecisions(50);
  const stats = calculateStats(decisions);

  // Generate Network Data (Nodes = Decisions, Links = Shared Tags)
  const nodes = decisions.map(d => ({
    id: d.id,
    group: 1,
    val: d.initialConfidence / 10,
    label: d.title,
    outcome: d.outcome
  }));

  const links = [];
  for (let i = 0; i < decisions.length; i++) {
    for (let j = i + 1; j < decisions.length; j++) {
      const d1 = decisions[i];
      const d2 = decisions[j];
      
      // Link by tags
      const sharedTags = d1.tags.filter(t => d2.tags.includes(t));
      if (sharedTags.length > 0) {
        links.push({
          source: d1.id,
          target: d2.id,
          value: sharedTags.length
        });
      }
    }
  }

  // Generate Sankey Data
  const framedCount = decisions.length;
  const sealedCount = decisions.filter(d => d.status !== 'framed').length;
  const retrospectedCount = decisions.filter(d => d.status === 'retrospected').length;
  
  const rightCalls = decisions.filter(d => d.outcome === 'right_call').length;
  const wrongCalls = decisions.filter(d => d.outcome === 'wrong_call').length;
  const unclearCalls = decisions.filter(d => d.outcome === 'unclear' && d.status === 'retrospected').length;

  const flowData = {
    nodes: [
      { name: 'Framed' },
      { name: 'Sealed' },
      { name: 'Dropped (Frame)' },
      { name: 'Retrospected' },
      { name: 'Dropped (Seal)' },
      { name: 'Right Call' },
      { name: 'Wrong Call' },
      { name: 'Unclear' }
    ],
    links: [
      { source: 0, target: 1, value: sealedCount },
      { source: 0, target: 2, value: framedCount - sealedCount },
      
      { source: 1, target: 3, value: retrospectedCount },
      { source: 1, target: 4, value: sealedCount - retrospectedCount },

      { source: 3, target: 5, value: rightCalls },
      { source: 3, target: 6, value: wrongCalls },
      { source: 3, target: 7, value: unclearCalls },
    ]
  };

  return {
    decisions,
    networkData: { nodes, links },
    flowData,
    stats
  };
};
