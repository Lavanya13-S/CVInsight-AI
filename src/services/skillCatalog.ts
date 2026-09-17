import type { ResumeSkill } from '@/types';

interface SkillDefinition {
  normalizedName: string;
  displayName: string;
  category: string;
  aliases: string[];
}

const SKILL_DEFINITIONS: SkillDefinition[] = [
  { normalizedName: 'javascript', displayName: 'JavaScript', category: 'Programming Languages', aliases: ['javascript', 'js', 'ecmascript', 'es6', 'es2015'] },
  { normalizedName: 'typescript', displayName: 'TypeScript', category: 'Programming Languages', aliases: ['typescript', 'ts'] },
  { normalizedName: 'java', displayName: 'Java', category: 'Programming Languages', aliases: ['java'] },
  { normalizedName: 'python', displayName: 'Python', category: 'Programming Languages', aliases: ['python', 'python3', 'python 3'] },
  { normalizedName: 'c++', displayName: 'C++', category: 'Programming Languages', aliases: ['c++', 'cpp', 'c plus plus'] },
  { normalizedName: 'c#', displayName: 'C#', category: 'Programming Languages', aliases: ['c#', 'csharp', 'c sharp'] },
  { normalizedName: 'go', displayName: 'Go', category: 'Programming Languages', aliases: ['go', 'golang'] },
  { normalizedName: 'rust', displayName: 'Rust', category: 'Programming Languages', aliases: ['rust'] },
  { normalizedName: 'sql', displayName: 'SQL', category: 'Programming Languages', aliases: ['sql'] },
  { normalizedName: 'html', displayName: 'HTML', category: 'Web Development', aliases: ['html', 'html5'] },
  { normalizedName: 'css', displayName: 'CSS', category: 'Web Development', aliases: ['css', 'css3'] },
  { normalizedName: 'react', displayName: 'React', category: 'Web Development', aliases: ['react', 'reactjs', 'react js', 'react.js'] },
  { normalizedName: 'fastapi', displayName: 'FastAPI', category: 'Frameworks', aliases: ['fastapi', 'fast api', 'fast-api'] },
  { normalizedName: 'django', displayName: 'Django', category: 'Frameworks', aliases: ['django'] },
  { normalizedName: 'flask', displayName: 'Flask', category: 'Frameworks', aliases: ['flask'] },
  { normalizedName: 'spring boot', displayName: 'Spring Boot', category: 'Frameworks', aliases: ['spring boot', 'springboot', 'spring-boot'] },
  { normalizedName: 'node.js', displayName: 'Node.js', category: 'Frameworks', aliases: ['node', 'node.js', 'nodejs', 'node js'] },
  { normalizedName: 'express', displayName: 'Express', category: 'Frameworks', aliases: ['express', 'express.js', 'expressjs', 'express js'] },
  { normalizedName: 'aws', displayName: 'AWS', category: 'Cloud & Tools', aliases: ['aws', 'amazon web services', 'amazon aws'] },
  { normalizedName: 'azure', displayName: 'Azure', category: 'Cloud & Tools', aliases: ['azure', 'microsoft azure'] },
  { normalizedName: 'gcp', displayName: 'GCP', category: 'Cloud & Tools', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { normalizedName: 'docker', displayName: 'Docker', category: 'Cloud & Tools', aliases: ['docker'] },
  { normalizedName: 'kubernetes', displayName: 'Kubernetes', category: 'Cloud & Tools', aliases: ['kubernetes', 'k8s'] },
  { normalizedName: 'git', displayName: 'Git/GitHub', category: 'Cloud & Tools', aliases: ['git', 'github', 'git hub', 'git/github'] },
  { normalizedName: 'power bi', displayName: 'Power BI', category: 'Data Analytics', aliases: ['power bi', 'powerbi'] },
  { normalizedName: 'tableau', displayName: 'Tableau', category: 'Data Analytics', aliases: ['tableau'] },
  { normalizedName: 'excel', displayName: 'Excel', category: 'Data Analytics', aliases: ['excel', 'ms excel', 'microsoft excel'] },
  { normalizedName: 'mysql', displayName: 'MySQL', category: 'Databases', aliases: ['mysql'] },
  { normalizedName: 'postgresql', displayName: 'PostgreSQL', category: 'Databases', aliases: ['postgresql', 'postgres', 'postgres sql'] },
  { normalizedName: 'mongodb', displayName: 'MongoDB', category: 'Databases', aliases: ['mongodb', 'mongo db', 'mongo'] },
  { normalizedName: 'redis', displayName: 'Redis', category: 'Databases', aliases: ['redis'] },
  { normalizedName: 'rest api', displayName: 'REST API', category: 'Cloud & Tools', aliases: ['rest api', 'rest apis', 'restful api', 'api'] },
  { normalizedName: 'testing', displayName: 'Testing', category: 'Cloud & Tools', aliases: ['testing', 'unit testing', 'automation testing'] },
  { normalizedName: 'machine learning', displayName: 'Machine Learning', category: 'Data Analytics', aliases: ['machine learning', 'ml'] },
  { normalizedName: 'deep learning', displayName: 'Deep Learning', category: 'Data Analytics', aliases: ['deep learning', 'dl'] },
  { normalizedName: 'data structures', displayName: 'Data Structures', category: 'Programming Languages', aliases: ['data structures', 'data structure'] },
  { normalizedName: 'computer networks', displayName: 'Computer Networks', category: 'Programming Languages', aliases: ['computer networks', 'computer network'] },
  { normalizedName: 'natural language processing', displayName: 'Natural Language Processing', category: 'Data Analytics', aliases: ['natural language processing', 'nlp'] },
  { normalizedName: 'object-oriented programming', displayName: 'Object-Oriented Programming', category: 'Programming Languages', aliases: ['object-oriented programming', 'object oriented programming', 'oop'] },
  { normalizedName: 'amazon web services', displayName: 'Amazon Web Services', category: 'Cloud & Tools', aliases: ['amazon web services', 'aws'] },
  { normalizedName: 'fastapi', displayName: 'FastAPI', category: 'Frameworks', aliases: ['fastapi'] },
  { normalizedName: 'go', displayName: 'Go', category: 'Programming Languages', aliases: ['go', 'golang'] },
  { normalizedName: 'react', displayName: 'React', category: 'Web Development', aliases: ['react'] },
];

const ALIAS_INDEX = SKILL_DEFINITIONS.flatMap((skill) =>
  skill.aliases.map((alias) => ({
    alias,
    compactAlias: compact(alias),
    skill,
  }))
).sort((a, b) => b.compactAlias.length - a.compactAlias.length);

function compact(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^a-z0-9+#.]+/g, '');
}

function tokensFromText(text: string): string[] {
  return text
    .split(/[,;|\n\t•·▪\u2022\u25CF\u25CB\u25AA\u25B8]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function createSkill(skill: SkillDefinition): ResumeSkill {
  return {
    displayName: skill.displayName,
    normalizedName: skill.normalizedName,
    category: skill.category,
  };
}

function matchToken(token: string): ResumeSkill[] {
  const compactToken = compact(token);
  if (!compactToken) return [];

  const matches: ResumeSkill[] = [];
  let cursor = 0;
  while (cursor < compactToken.length) {
    let matched = false;
    for (const entry of ALIAS_INDEX) {
      if (compactToken.startsWith(entry.compactAlias, cursor)) {
        matches.push(createSkill(entry.skill));
        cursor += entry.compactAlias.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      cursor += 1;
    }
  }
  return matches;
}

function dedupeSkills(skills: ResumeSkill[]): ResumeSkill[] {
  const seen = new Set<string>();
  const result: ResumeSkill[] = [];
  for (const skill of skills) {
    if (seen.has(skill.normalizedName)) continue;
    seen.add(skill.normalizedName);
    result.push(skill);
  }
  return result;
}

export function normalizeSkillName(raw: string): string {
  const compactRaw = compact(raw);
  const match = ALIAS_INDEX.find((entry) => entry.compactAlias === compactRaw);
  return match?.skill.normalizedName ?? raw.trim().toLowerCase();
}

export function getSkillDisplayName(normalizedName: string): string {
  const match = SKILL_DEFINITIONS.find((skill) => skill.normalizedName === normalizedName);
  return match?.displayName ?? normalizedName
    .split(/\s+/)
    .map((part) => part ? part[0].toUpperCase() + part.slice(1) : part)
    .join(' ');
}

export function getSkillCategory(normalizedName: string): string {
  const match = SKILL_DEFINITIONS.find((skill) => skill.normalizedName === normalizedName);
  return match?.category ?? 'Other';
}

export function extractStructuredSkills(text: string): ResumeSkill[] {
  if (!text.trim()) return [];
  const rawSkills = new Set<string>();

  for (const token of tokensFromText(text)) {
    for (const skill of matchToken(token)) {
      rawSkills.add(skill.normalizedName);
    }
  }

  if (rawSkills.size === 0) {
    const compactText = compact(text);
    for (const entry of ALIAS_INDEX) {
      if (compactText.includes(entry.compactAlias)) {
        rawSkills.add(entry.skill.normalizedName);
      }
    }
  }

  const ordered = [...rawSkills].map((normalizedName) => {
    const displayName = getSkillDisplayName(normalizedName);
    return {
      displayName,
      normalizedName,
      category: getSkillCategory(normalizedName),
    } satisfies ResumeSkill;
  });

  return dedupeSkills(ordered).sort((a, b) => {
    if (a.category === b.category) return a.displayName.localeCompare(b.displayName);
    return a.category.localeCompare(b.category);
  });
}

export function parseSkillsForDisplay(raw: string): string[] {
  return extractStructuredSkills(raw).map((skill) => skill.displayName);
}

export function normalizeSkillsForMatching(skills: string[]): string[] {
  return skills
    .map((skill) => normalizeSkillName(skill))
    .map((skill) => skill.trim().toLowerCase())
    .filter(Boolean);
}
