import type { ExecutiveBriefing } from "./api";

export type IntelligenceNodeGroup =
  "Threat" | "Country" | "Organization" | "Technology" | "Crime Type" | "Recommendation";

export interface IntelligenceGraphNode {
  id: string;
  name: string;
  group: IntelligenceNodeGroup;
  evidenceCount: number;
  articles: ExecutiveBriefing["sources"];
}

export interface IntelligenceGraphLink {
  source: string;
  target: string;
  evidenceCount: number;
}

export interface IntelligenceGraphData {
  nodes: IntelligenceGraphNode[];
  links: IntelligenceGraphLink[];
}

const STOP_WORDS = new Set([
  "about",
  "after",
  "against",
  "also",
  "among",
  "being",
  "between",
  "crime",
  "from",
  "have",
  "into",
  "latest",
  "more",
  "news",
  "over",
  "that",
  "their",
  "this",
  "threat",
  "update",
  "with",
  "will",
  "India",
  "Indian",
  "reported",
  "says",
  "said",
  "source",
]);

const CATEGORY_TERMS: Record<string, string[]> = {
  Cybercrime: ["cyber", "ransomware", "malware", "phishing", "hack", "breach", "digital arrest"],
  "Financial Fraud": [
    "fraud",
    "scam",
    "upi",
    "payment",
    "investment",
    "crypto",
    "money laundering",
  ],
  "Organized Crime": ["organized crime", "gang", "cartel", "smuggling", "trafficking"],
  Terrorism: ["terror", "terrorism", "militant", "extremist", "bomb", "insurgent"],
  "International Threats": ["international", "global", "interpol", "cross-border", "foreign"],
  "Human Trafficking": ["human trafficking", "trafficking", "forced labor"],
  "Drug Trafficking": ["drug trafficking", "narcotics", "heroin", "cocaine"],
};

const KNOWN_ENTITIES: Array<{ group: IntelligenceNodeGroup; names: string[] }> = [
  {
    group: "Country",
    names: [
      "India",
      "United States",
      "UK",
      "United Kingdom",
      "Pakistan",
      "China",
      "Russia",
      "Ukraine",
      "Canada",
      "Australia",
    ],
  },
  {
    group: "Organization",
    names: ["Interpol", "CISA", "CERT-In", "FBI", "NCSC", "MHA", "NCRB", "Europol", "Police"],
  },
  {
    group: "Technology",
    names: [
      "AI",
      "artificial intelligence",
      "dark web",
      "blockchain",
      "cryptocurrency",
      "UPI",
      "deepfake",
      "ransomware",
    ],
  },
];

export function getBriefingArticles(briefing: ExecutiveBriefing): ExecutiveBriefing["sources"] {
  return briefing.sources ?? [];
}

export function getThreatDistribution(
  briefing: ExecutiveBriefing,
): Array<{ category: string; count: number; percentage: number }> {
  const articles = getBriefingArticles(briefing);
  return Object.entries(CATEGORY_TERMS)
    .map(([category, terms]) => {
      const count = articles.filter((article) => {
        const text = `${article.title} ${article.summary ?? ""}`.toLowerCase();
        return terms.some((term) => text.includes(term));
      }).length;
      return {
        category,
        count,
        percentage: articles.length ? Math.round((count / articles.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function getTopKeywords(briefing: ExecutiveBriefing): string[] {
  const counts = new Map<string, number>();
  for (const article of getBriefingArticles(briefing)) {
    const words = `${article.title} ${article.summary ?? ""}`
      .replace(/[^a-zA-Z0-9-]+/g, " ")
      .split(/\s+/)
      .map((word) => word.toLowerCase())
      .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
    for (const word of new Set(words)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word]) => word);
}

export function getSourceIntelligence(briefing: ExecutiveBriefing) {
  const articles = getBriefingArticles(briefing);
  const publisherCounts = new Map<string, number>();
  for (const article of articles) {
    const publisher = article.sourceName || "Unknown publisher";
    publisherCounts.set(publisher, (publisherCounts.get(publisher) ?? 0) + 1);
  }
  const dates = articles
    .map((article) => (article.publicationDate ? new Date(article.publicationDate) : null))
    .filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime())));
  const averageAge = dates.length
    ? dates.reduce((sum, date) => sum + Math.max(0, Date.now() - date.getTime()), 0) /
      dates.length /
      86400000
    : null;
  const governmentTerms = [
    "government",
    "police",
    "cert",
    "mha",
    "ncrb",
    "cisa",
    "fbi",
    "ncsc",
    "interpol",
  ];
  const internationalTerms = [
    "international",
    "global",
    "interpol",
    "bbc",
    "reuters",
    "associated press",
    "cisa",
    "fbi",
  ];
  const governmentSources = articles.filter((article) =>
    governmentTerms.some((term) =>
      `${article.sourceName} ${article.title}`.toLowerCase().includes(term),
    ),
  ).length;
  const internationalSources = articles.filter((article) =>
    internationalTerms.some((term) =>
      `${article.sourceName} ${article.title}`.toLowerCase().includes(term),
    ),
  ).length;
  return {
    mostFrequentPublisher:
      [...publisherCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unavailable",
    governmentSources,
    internationalSources,
    averagePublicationRecency:
      averageAge === null ? "Unavailable" : `${Math.round(averageAge)} days`,
    sourceDiversityScore: articles.length
      ? Math.round((publisherCounts.size / articles.length) * 100)
      : 0,
  };
}

export function getOperationalAssessment(briefing: ExecutiveBriefing): string {
  const risk = briefing.riskLevel.toLowerCase();
  const confidence = briefing.confidenceEvidence?.score ?? 0;
  const top =
    briefing.severityMatrix?.slice().sort((a, b) => b.score - a.score)[0]?.category ??
    "multiple threat categories";
  return `Multiple intelligence signals indicate ${risk} activity in ${top.toLowerCase()} with ${confidence >= 70 ? "high" : confidence >= 40 ? "moderate" : "limited"} evidence confidence.`;
}

export function getRelationshipGraph(briefing: ExecutiveBriefing): IntelligenceGraphData {
  const articles = getBriefingArticles(briefing);
  const nodes = new Map<string, IntelligenceGraphNode>();
  const links = new Map<string, IntelligenceGraphLink>();
  const addNode = (
    name: string,
    group: IntelligenceNodeGroup,
    article: ExecutiveBriefing["sources"][number],
  ) => {
    const id = `${group}:${name.toLowerCase()}`;
    const existing = nodes.get(id);
    if (existing) {
      existing.evidenceCount += 1;
      if (!existing.articles.some((item) => item.url === article.url))
        existing.articles.push(article);
      return id;
    }
    nodes.set(id, { id, name, group, evidenceCount: 1, articles: [article] });
    return id;
  };
  const addLink = (source: string, target: string) => {
    const id = `${source}->${target}`;
    const existing = links.get(id);
    if (existing) existing.evidenceCount += 1;
    else links.set(id, { source, target, evidenceCount: 1 });
  };
  for (const article of articles) {
    const text = `${article.title} ${article.summary ?? ""}`.toLowerCase();
    const threats = Object.entries(CATEGORY_TERMS)
      .filter(([, terms]) => terms.some((term) => text.includes(term)))
      .map(([category]) => category);
    const entities = KNOWN_ENTITIES.filter(({ names }) =>
      names.some((name) => text.includes(name.toLowerCase())),
    );
    for (const threat of threats) {
      const threatId = addNode(threat, "Threat", article);
      for (const entity of entities) {
        for (const name of entity.names.filter((candidate) =>
          text.includes(candidate.toLowerCase()),
        ))
          addLink(
            entity.group === "Technology"
              ? addNode(name, entity.group, article)
              : addNode(name, entity.group, article),
            threatId,
          );
      }
    }
  }
  return { nodes: [...nodes.values()], links: [...links.values()] };
}

export function extractKeywords(summary?: string): string[] {
  if (!summary) return [];
  const words = summary
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w));
  return [...new Set(words)].slice(0, 10);
}

export const buildBriefingGraph = getRelationshipGraph;
