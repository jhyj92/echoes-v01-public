// data/worlds.js
/* A minimal starter catalogue.
   weightKeywords: words -> +3 score, softKeywords -> +1 score
*/
export const WORLDS = [
  {
    id: 'dreamSea',
    name: 'Dream-Sea Realm',
    theme: 'theme-dream',
    weightKeywords: ['creativity', 'imagination', 'dream', 'fantasy'],
    softKeywords: ['intuition', 'emotion']
  },
  {
    id: 'labyrinth',
    name: 'Crystalline Labyrinth',
    theme: 'theme-crystal',
    weightKeywords: ['strategy', 'analysis', 'logic', 'tactics'],
    softKeywords: ['precision', 'pattern']
  },
  {
    id: 'verdant',
    name: 'Verdant Veil',
    theme: 'theme-verdant',
    weightKeywords: ['empathy', 'compassion', 'growth', 'nurture'],
    softKeywords: ['healing', 'unity']
  },
  {
    id: 'emberwake',
    name: 'Emberwake Highlands',
    theme: 'theme-ember',
    weightKeywords: ['courage', 'grit', 'resilience', 'fire'],
    softKeywords: ['passion', 'drive']
  },
  {
    id: 'echoField',
    name: 'Shifting Echo Fields',
    theme: 'theme-echo',
    weightKeywords: [],
    softKeywords: []
  }
];
