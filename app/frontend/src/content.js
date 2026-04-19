/** Site copy — edit here to update the page. */

export const profile = {
  name: "Naman Jain",
  subtitle: "devops",
  photo: "/profile.png",
  email: "namanjainupes@gmail.com",
  phone: "+91 98765 43210",
  linkedin: "https://www.linkedin.com/in/nj8055",
  location: "Bangalore, India",
  /** Add `public/resume.pdf` and set to `/resume.pdf` for a real download. */
  resumeUrl: "#contact",
};

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#engagement", label: "Engagement" },
  { href: "#contact", label: "Contact" },
];

export const hero = {
  availability: "Available for 2 freelance engagements · Q3 2025",
  titleBefore: "Reliable infrastructure, shipped",
  titleAccent: "thoughtfully.",
  bio: `I'm a DevOps / platform engineer at Salesforce, focused on inter-service auth, trust stores and a multi-year AWS → GCP uplift. Before that I shipped pipelines and clusters at Microsoft and Informatica — CI/CD, Kubernetes, IaC, PKI, DR and the observability that keeps it honest.`,
};

/** Terminal blocks rendered under the hero (decorative “shell” UI, not live data). */
export const terminalBlocks = [
  {
    command: "whoami",
    lines: ["> Naman Jain", "> DevOps / platform @ Salesforce"],
  },
  {
    command: "stack --summary",
    lines: [
      "> aws · azure · gcp · oci",
      "> k8s (eks/aks) · istio · helm",
      "> terraform · jenkins · harness · spinnaker",
      "> pki · mTLS · disaster recovery",
    ],
  },
  {
    command: "currently",
    lines: ["> leading aws → gcp uplift", "> designing trust store automation"],
  },
  {
    command: "open-for",
    lines: ["> freelance · advisory · fractional devops"],
  },
];

export const heroStats = [
  { value: "3.5+", label: "Years in DevOps" },
  { value: "4h → 60m", label: "Release time cut" },
  { value: "AWS · Azure · GCP", label: "Clouds shipped" },
  { value: "EKS · AKS · GKE", label: "Clusters managed" },
];

export const marqueeTags = [
  "ISTIO",
  "PROMETHEUS",
  "GRAFANA",
  "DOCKER",
  "AWS",
  "AZURE",
  "GCP",
  "KUBERNETES",
  "TERRAFORM",
  "JENKINS",
  "HARNESS",
];

export const about = {
  titleBefore: "I treat infrastructure like",
  titleAccent: "product",
  titleAfter: "— with users, SLOs and a roadmap.",
  bio: [
    `Today I'm a Software Engineer at Salesforce, working on platform reliability and cloud migration at enterprise scale.`,
    `I've spent years with CI/CD, Kubernetes, Terraform and multi-cloud estates (AWS, Azure, GCP, OCI) — from one-click releases to DR drills that actually get run.`,
  ],
  process: [
    {
      step: "01 · Understand",
      text: "Questions before keystrokes. Map risk, users and constraints.",
    },
    {
      step: "02 · Build",
      text: "Small, reviewed PRs. Code, Terraform and docs in the same flow.",
    },
    {
      step: "03 · Handover",
      text: "Runbooks, dashboards and a 30-day warranty on everything shipped.",
    },
  ],
};

/** Contact form “service” dropdown (short list). */
export const services = [
  { id: "cicd", title: "CI/CD pipeline engineering" },
  { id: "k8s", title: "Kubernetes & containers" },
  { id: "iac", title: "Terraform & IaC" },
  { id: "migration", title: "Multi-cloud migration" },
  { id: "dr", title: "Disaster recovery" },
  { id: "pki", title: "PKI & platform security" },
];

/**
 * Services grid — `icon` maps to lucide-react in ServicesSection.
 */
export const serviceCards = [
  {
    id: "01",
    icon: "Workflow",
    title: "CI/CD Pipeline Engineering",
    description:
      "Design one-click release pipelines on Jenkins, Harness, Spinnaker and GitHub Actions. Gated, auditable, fast.",
    bullets: ["One-click releases", "Policy gates & approvals", "Pipeline as code"],
  },
  {
    id: "02",
    icon: "Boxes",
    title: "Kubernetes & Containers",
    description:
      "Production-grade EKS/AKS/GKE with Istio, Helm, autoscaling, and secure workloads your team can actually debug.",
    bullets: ["Istio service mesh", "Helm + GitOps", "HPA & cost control"],
  },
  {
    id: "03",
    icon: "Layers",
    title: "Terraform & IaC",
    description: "Reusable Terraform modules for AWS, Azure and OCI. Drift-free, reviewed, environment-aware.",
    bullets: ["Custom modules", "Workspaces per env", "Policy as code"],
  },
  {
    id: "04",
    icon: "Cloud",
    title: "Multi-Cloud Migration",
    description:
      "Lift, refactor or re-platform across AWS, Azure and GCP — most recently led an AWS → GCP uplift at Salesforce.",
    bullets: ["Zero-downtime cutover"],
  },
  {
    id: "05",
    icon: "RefreshCw",
    title: "Disaster Recovery",
    description:
      "Automated DR for MySQL, Redis and app tier with tested RPO/RTO targets. Because backups you don't test aren't backups.",
    bullets: ["Cross-region replication"],
  },
  {
    id: "06",
    icon: "Shield",
    title: "PKI & Platform Security",
    description: "Trust stores, certificate automation and mTLS between services. Current focus area at Salesforce.",
    bullets: ["Cert rotation", "mTLS between services"],
  },
];

export const experienceIntro = {
  label: "/experience",
  titleBefore: "Built across",
  titleAccent: "three",
  titleAfter: "of the biggest platforms.",
  sub: "Enterprise scale, regulated environments, and the boring reliability work that keeps revenue flowing.",
};

export const experience = [
  {
    id: "sf",
    initials: "SF",
    range: "Jul 2025 – Present",
    company: "Salesforce",
    title: "Member of Technical Staff · India",
    bullets: [
      "Interservice auth, trust stores and certificate automation at platform scale.",
      "Cloud migration: AWS → GCP uplift — landing zones, networking and safe cutovers.",
      "Partnering with security and product on mTLS, policy and observability guardrails.",
    ],
    tags: ["GCP", "AWS", "Terraform", "K8s", "Istio"],
  },
  {
    id: "ms",
    initials: "MS",
    range: "Prior",
    company: "Microsoft",
    title: "Software Engineer",
    bullets: [
      "ARM templates, Bicep and automation for Azure region provisioning.",
      "Hardened deployment patterns for internal platform teams.",
    ],
    tags: ["Azure", "ARM", "Bicep", "Terraform"],
  },
  {
    id: "in",
    initials: "IN",
    range: "Prior",
    company: "Informatica",
    title: "DevOps Engineer",
    bullets: [
      "One-click release pipelines; cut deploy time from hours to minutes.",
      "Prometheus / Grafana and Kubernetes (EKS/AKS) for production services.",
    ],
    tags: ["Jenkins", "Spinnaker", "K8s", "Prometheus", "Grafana"],
  },
];

export const stackIntro = {
  label: "/stack",
  titleBefore: "The",
  titleAccent: "tools",
  titleAfter: "I reach for.",
  sub: "Opinionated but flexible. I've built real systems with each of these in regulated, high-traffic environments.",
};

export const stackGroups = [
  { title: "Cloud", count: 4, tags: ["AWS", "Azure", "GCP", "OCI"] },
  { title: "Containers", count: 4, tags: ["Kubernetes", "Docker", "Helm", "Istio"] },
  { title: "IaC", count: 3, tags: ["Terraform", "ARM", "Bicep"] },
  { title: "CI/CD", count: 4, tags: ["Jenkins", "Harness", "Spinnaker", "GitHub Actions"] },
  { title: "Languages", count: 4, tags: ["Python", "Shell", "Groovy", "Go"] },
  { title: "Observability", count: 3, tags: ["Prometheus", "Grafana", "Stackdriver"] },
  { title: "Security", count: 4, tags: ["PKI", "mTLS", "Trust stores", "Secrets mgmt"] },
  { title: "OS & tools", count: 4, tags: ["Linux", "Perforce", "GitHub", "MobaXterm"] },
];

export const workIntro = {
  label: "/work",
  titleBefore: "Selected",
  titleAccent: "case studies.",
  sub: "A few shipped outcomes from Informatica, Microsoft and Salesforce — names redacted where needed, metrics real.",
};

export const caseStudies = [
  {
    id: "inf-pipeline",
    company: "Informatica",
    metric: "4h → 60m deploy time",
    title: "One-Click Release Pipeline",
    summary: "Replaced manual, multi-step releases with gated automation and observability baked in from day one.",
    problem: "Manual, slow, fragile releases across environments.",
    approach: "Automation + policy gates + observability from day one.",
    outcome: "4h → 60m deploy time",
    tags: ["Jenkins", "Spinnaker", "Groovy", "GitOps"],
  },
  {
    id: "inf-dr",
    company: "Informatica",
    metric: "Tested RPO < 5 min",
    title: "DR Automation for Data Plane",
    summary: "Cross-region replication, runbooks and quarterly game days so recovery was rehearsed, not theoretical.",
    problem: "DR plans existed on paper but were never exercised under load.",
    approach: "Automated failover paths, metrics for RPO/RTO and game-day scripts.",
    outcome: "Tested RPO < 5 min on critical paths.",
    tags: ["MySQL", "Redis", "Terraform", "AWS"],
  },
  {
    id: "ms-azure",
    company: "Microsoft",
    metric: "Region-scale provisioning",
    title: "Azure Landing Zone Patterns",
    summary: "Repeatable templates and guardrails so internal teams could provision safely without a ticket storm.",
    problem: "Inconsistent region builds and slow handoffs between platform and service teams.",
    approach: "ARM/Bicep modules, policy at subscription scope and clear ownership.",
    outcome: "Faster, safer region onboarding for dependent services.",
    tags: ["Azure", "ARM", "Bicep", "Policy"],
  },
  {
    id: "sf-gcp",
    company: "Salesforce",
    metric: "In flight",
    title: "AWS → GCP Platform Uplift",
    summary: "Multi-year migration: networking, identity, workloads and the operational muscle to run both clouds during the bridge.",
    problem: "Large estate on AWS; strategic move to GCP without stopping the business.",
    approach: "Incremental migration waves, strong IaC and dual-run observability.",
    outcome: "In flight — focus on safe cutover and long-term cost control.",
    tags: ["GCP", "AWS", "Terraform", "K8s"],
  },
];

export const engagements = [
  {
    name: "Advisory sprint",
    price: "From $2.5k",
    blurb: "A focused week on architecture, risks, and a concrete next‑quarter plan.",
    features: [
      "Stack and runway review",
      "Threat‑model style risk pass",
      "Written recommendations + backlog",
    ],
    cta: "Book a sprint",
    featured: false,
  },
  {
    name: "Build slice",
    price: "From $8k",
    blurb: "Ship one vertical end‑to‑end: infra, pipelines, and observability wired in.",
    features: [
      "Terraform / IaC in your repo",
      "CI/CD and environments",
      "Dashboards and alerting hooks",
    ],
    cta: "Scope a slice",
    featured: true,
  },
  {
    name: "Fractional lead",
    price: "Monthly",
    blurb: "Ongoing ownership for platform decisions, reviews, and vendor coordination.",
    features: [
      "Weekly working sessions",
      "On‑call design and runbooks",
      "Hiring and roadmap support",
    ],
    cta: "Discuss retainer",
    featured: false,
  },
];
