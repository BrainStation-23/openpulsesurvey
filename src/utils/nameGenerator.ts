
const adjectives = [
  "Happy", "Quick", "Clever", "Bright", "Swift", "Kind", "Calm", "Wise", 
  "Brave", "Noble", "Lucky", "Cool", "Smart", "Super", "Epic", "Agile"
];

const nouns = [
  "Eagle", "Tiger", "Panda", "Dolphin", "Wolf", "Lion", "Fox", "Bear",
  "Hawk", "Owl", "Phoenix", "Dragon", "Falcon", "Raven", "Lynx", "Seal"
];

export const generateRandomName = (): string => {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective}${noun}`;
};
