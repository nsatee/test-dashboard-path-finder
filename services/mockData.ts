import { Decision, PathFinderData, OutcomeType } from '../types';

const generateDecisions = (count: number): Decision[] => {
  const outcomes: OutcomeType[] = ['right_call', 'wrong_call', 'unclear'];
  const tagsList = ['Strategy', 'Hiring', 'Product', 'Engineering', 'Marketing', 'Finance', 'Personal'];
  const decisions: Decision[] = [];

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 90); // Last 90 days
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    const initialConf = Math.floor(Math.random() * 40) + 50; // 50-90
    
    // Correlate final confidence with outcome for realism
    let finalConf = initialConf;
    if (outcome === 'right_call') finalConf = Math.min(100, initialConf + Math.random() * 20);
    else if (outcome === 'wrong_call') finalConf = Math.max(0, initialConf - Math.random() * 30);

    const numTags = Math.floor(Math.random() * 3) + 1;
    const selectedTags: string[] = [];
    for(let j=0; j<numTags; j++) {
      const tag = tagsList[Math.floor(Math.random() * tagsList.length)];
      if(!selectedTags.includes(tag)) selectedTags.push(tag);
    }

    decisions.push({
      id: `dec-${i}`,
      title: `Decision #${i + 1}: ${selectedTags[0]} Initiative`,
      date: date.toISOString().split('T')[0],
      outcome,
      initialConfidence: initialConf,
      finalConfidence: finalConf,
      stressLevel: Math.floor(Math.random() * 10),
      tags: selectedTags,
      status: 'retrospected'
    });
  }
  return decisions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getPathFinderData = async (): Promise<PathFinderData> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const decisions = generateDecisions(40);

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
  // Frame -> Seal -> Retrospect -> Outcome
  const flowData = {
    nodes: [
      { name: 'Framed' },
      { name: 'Sealed' },
      { name: 'Retrospected' },
      { name: 'Right Call' },
      { name: 'Wrong Call' },
      { name: 'Unclear' }
    ],
    links: [
      { source: 0, target: 1, value: 40 }, // All framed go to sealed
      { source: 1, target: 2, value: 38 }, // Most sealed go to retrospect
      { source: 2, target: 3, value: 20 }, // Retrospect -> Right
      { source: 2, target: 4, value: 10 }, // Retrospect -> Wrong
      { source: 2, target: 5, value: 8 },  // Retrospect -> Unclear
    ]
  };

  return {
    decisions,
    networkData: { nodes, links },
    flowData
  };
};