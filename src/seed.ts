import { db } from './db';

interface TargetCompany {
  name: string;
  slug: string;
  provider: 'greenhouse' | 'lever' | 'ashby' | 'workable';
  token: string;
  category: string;
}

const targetCompanies: TargetCompany[] = [
  // ==========================================
  // 1. TECH GIANTS & SCALE-UPS
  // ==========================================
  { name: 'Stripe', slug: 'stripe', provider: 'greenhouse', token: 'stripe', category: 'Fintech' },
  { name: 'Figma', slug: 'figma', provider: 'greenhouse', token: 'figma', category: 'Design' },
  { name: 'Discord', slug: 'discord', provider: 'greenhouse', token: 'discord', category: 'Consumer' },
  { name: 'Vercel', slug: 'vercel', provider: 'greenhouse', token: 'vercel', category: 'DevTools' },
  { name: 'Airbnb', slug: 'airbnb', provider: 'greenhouse', token: 'airbnb', category: 'Consumer' },
  { name: 'Cloudflare', slug: 'cloudflare', provider: 'greenhouse', token: 'cloudflare', category: 'Infrastructure' },
  { name: 'GitLab', slug: 'gitlab', provider: 'greenhouse', token: 'gitlab', category: 'DevTools' },
  { name: 'Pinterest', slug: 'pinterest', provider: 'greenhouse', token: 'pinterest', category: 'Consumer' },
  { name: 'Reddit', slug: 'reddit', provider: 'greenhouse', token: 'reddit', category: 'Consumer' },
  { name: 'Instacart', slug: 'instacart', provider: 'greenhouse', token: 'instacart', category: 'Consumer' },
  { name: 'Databricks', slug: 'databricks', provider: 'greenhouse', token: 'databricks', category: 'Data & AI' },
  { name: 'Robinhood', slug: 'robinhood', provider: 'greenhouse', token: 'robinhood', category: 'Fintech' },
  { name: 'DoorDash', slug: 'doordash', provider: 'greenhouse', token: 'doordash', category: 'Consumer' },
  { name: 'Coinbase', slug: 'coinbase', provider: 'greenhouse', token: 'coinbase', category: 'Crypto' },
  { name: 'Plaid', slug: 'plaid', provider: 'greenhouse', token: 'plaid', category: 'Fintech' },
  { name: 'Flexport', slug: 'flexport', provider: 'greenhouse', token: 'flexport', category: 'Logistics' },
  { name: 'Chime', slug: 'chime', provider: 'greenhouse', token: 'chime', category: 'Fintech' },
  { name: 'Toast', slug: 'toast', provider: 'greenhouse', token: 'toast', category: 'SaaS' },
  { name: 'Webflow', slug: 'webflow', provider: 'greenhouse', token: 'webflow', category: 'DevTools' },
  { name: 'Elastic', slug: 'elastic', provider: 'greenhouse', token: 'elastic', category: 'DevTools' },
  { name: 'MongoDB', slug: 'mongodb', provider: 'greenhouse', token: 'mongodb', category: 'DevTools' },
  { name: 'Amplitude', slug: 'amplitude', provider: 'greenhouse', token: 'amplitude', category: 'Analytics' },
  { name: 'Asana', slug: 'asana', provider: 'greenhouse', token: 'asana', category: 'Productivity' },
  { name: 'Samsara', slug: 'samsara', provider: 'greenhouse', token: 'samsara', category: 'IoT' },
  { name: 'Twilio', slug: 'twilio', provider: 'greenhouse', token: 'twilio', category: 'Communications' },
  { name: 'Gusto', slug: 'gusto', provider: 'greenhouse', token: 'gusto', category: 'HR Tech' },
  { name: 'Benchling', slug: 'benchling', provider: 'greenhouse', token: 'benchling', category: 'Biotech' },
  { name: 'Braze', slug: 'braze', provider: 'greenhouse', token: 'braze', category: 'Marketing' },
  { name: 'HashiCorp', slug: 'hashicorp', provider: 'greenhouse', token: 'hashicorp', category: 'Infrastructure' },
  { name: 'dbt Labs', slug: 'dbtlabs', provider: 'greenhouse', token: 'dbtlabs', category: 'Data' },
  { name: 'Duolingo', slug: 'duolingo', provider: 'greenhouse', token: 'duolingo', category: 'EdTech' },
  { name: 'Fastly', slug: 'fastly', provider: 'greenhouse', token: 'fastly', category: 'Infrastructure' },
  { name: 'LaunchDarkly', slug: 'launchdarkly', provider: 'greenhouse', token: 'launchdarkly', category: 'DevTools' },
  { name: 'PagerDuty', slug: 'pagerduty', provider: 'greenhouse', token: 'pagerduty', category: 'DevTools' },
  { name: 'Roblox', slug: 'roblox', provider: 'greenhouse', token: 'roblox', category: 'Gaming' },
  { name: 'Snyk', slug: 'snyk', provider: 'greenhouse', token: 'snyk', category: 'Security' },
  { name: 'DataDog', slug: 'datadog', provider: 'greenhouse', token: 'datadog', category: 'DevTools' },
  { name: 'Snowflake', slug: 'snowflake', provider: 'greenhouse', token: 'snowflake', category: 'Data' },
  { name: 'Checkr', slug: 'checkr', provider: 'greenhouse', token: 'checkr', category: 'HR Tech' },
  { name: 'Postman', slug: 'postman', provider: 'greenhouse', token: 'postman', category: 'DevTools' },
  { name: 'Sourcegraph', slug: 'sourcegraph', provider: 'greenhouse', token: 'sourcegraph', category: 'DevTools' },
  { name: 'Cockroach Labs', slug: 'cockroachlabs', provider: 'greenhouse', token: 'cockroachlabs', category: 'DevTools' },
  { name: 'Ironclad', slug: 'ironclad', provider: 'greenhouse', token: 'ironclad', category: 'LegalTech' },
  { name: 'Temporal', slug: 'temporal', provider: 'greenhouse', token: 'temporal', category: 'DevTools' },
  { name: 'Ripple', slug: 'ripple', provider: 'greenhouse', token: 'ripple', category: 'Crypto' },
  { name: 'Chainlink', slug: 'chainlink', provider: 'greenhouse', token: 'chainlinklabs', category: 'Crypto' },
  { name: 'Circle', slug: 'circle', provider: 'greenhouse', token: 'circle', category: 'Crypto' },
  { name: 'DigitalOcean', slug: 'digitalocean', provider: 'greenhouse', token: 'digitalocean', category: 'Infrastructure' },
  { name: 'Anduril', slug: 'anduril', provider: 'greenhouse', token: 'andurilindustries', category: 'Defense' },
  { name: 'Twitch', slug: 'twitch', provider: 'greenhouse', token: 'twitch', category: 'Media' },

  // ==========================================
  // 2. LEVER COMPANIES
  // ==========================================
  { name: 'Spotify', slug: 'spotify', provider: 'lever', token: 'spotify', category: 'Media' },
  { name: 'Palantir', slug: 'palantir', provider: 'lever', token: 'palantir', category: 'Enterprise' },
  { name: 'Airtable', slug: 'airtable', provider: 'lever', token: 'airtable', category: 'Productivity' },
  { name: 'Coursera', slug: 'coursera', provider: 'lever', token: 'coursera', category: 'EdTech' },
  { name: 'Docker', slug: 'docker', provider: 'lever', token: 'docker', category: 'DevTools' },
  { name: 'Eventbrite', slug: 'eventbrite', provider: 'lever', token: 'eventbrite', category: 'Events' },
  { name: 'Mixpanel', slug: 'mixpanel', provider: 'lever', token: 'mixpanel', category: 'Analytics' },
  { name: 'Shopify', slug: 'shopify', provider: 'lever', token: 'shopify', category: 'E-commerce' },
  { name: 'Deepgram', slug: 'deepgram', provider: 'lever', token: 'deepgram', category: 'AI' },
  { name: 'Remote', slug: 'remote', provider: 'lever', token: 'remote', category: 'Remote-First' },
  { name: 'Modern Treasury', slug: 'modern-treasury', provider: 'lever', token: 'moderntreasury', category: 'Fintech' },
  { name: 'Front', slug: 'front', provider: 'lever', token: 'front', category: 'SaaS' },
  { name: 'Clearbit', slug: 'clearbit', provider: 'lever', token: 'clearbit', category: 'SaaS' },
  { name: 'Mercury', slug: 'mercury', provider: 'lever', token: 'mercury', category: 'Fintech' },
  { name: 'Loom', slug: 'loom', provider: 'lever', token: 'loom', category: 'Productivity' },
  { name: 'Atlassian', slug: 'atlassian', provider: 'lever', token: 'atlassian', category: 'DevTools' },

  // ==========================================
  // 3. AI & ASHBY COMPANIES
  // ==========================================
  { name: 'OpenAI', slug: 'openai', provider: 'ashby', token: 'openai', category: 'AI' },
  { name: 'Linear', slug: 'linear', provider: 'ashby', token: 'linear', category: 'DevTools' },
  { name: 'Ramp', slug: 'ramp', provider: 'ashby', token: 'ramp', category: 'Fintech' },
  { name: 'Notion', slug: 'notion', provider: 'ashby', token: 'notion', category: 'Productivity' },
  { name: 'Anthropic', slug: 'anthropic', provider: 'ashby', token: 'anthropic', category: 'AI' },
  { name: 'Retool', slug: 'retool', provider: 'ashby', token: 'retool', category: 'DevTools' },
  { name: 'Perplexity AI', slug: 'perplexity', provider: 'ashby', token: 'perplexity', category: 'AI' },
  { name: 'Cursor (Anysphere)', slug: 'cursor', provider: 'ashby', token: 'anysphere', category: 'AI' },
  { name: 'Runway', slug: 'runway', provider: 'ashby', token: 'runway', category: 'AI' },
  { name: 'Supabase', slug: 'supabase', provider: 'ashby', token: 'supabase', category: 'DevTools' },
  { name: 'Modal', slug: 'modal', provider: 'ashby', token: 'modal', category: 'AI' },
  { name: 'Pinecone', slug: 'pinecone', provider: 'ashby', token: 'pinecone', category: 'AI' },
  { name: 'Fal AI', slug: 'fal', provider: 'ashby', token: 'fal', category: 'AI' },
  { name: 'Resend', slug: 'resend', provider: 'ashby', token: 'resend', category: 'DevTools' },
  { name: 'Dub', slug: 'dub', provider: 'ashby', token: 'dub', category: 'DevTools' },
  { name: 'Railway', slug: 'railway', provider: 'ashby', token: 'railway', category: 'DevTools' },
  { name: 'Clerk', slug: 'clerk', provider: 'ashby', token: 'clerk', category: 'DevTools' },
  { name: 'PostHog', slug: 'posthog', provider: 'ashby', token: 'posthog', category: 'DevTools' },
  { name: 'Vanta', slug: 'vanta', provider: 'ashby', token: 'vanta', category: 'Security' },
  { name: 'Wiz', slug: 'wiz', provider: 'ashby', token: 'wiz', category: 'Security' },
  { name: 'Dust', slug: 'dust', provider: 'ashby', token: 'dust', category: 'AI' },
  { name: 'Mistral AI', slug: 'mistral', provider: 'ashby', token: 'mistral', category: 'AI' },
  { name: 'Together AI', slug: 'together-ai', provider: 'ashby', token: 'together-ai', category: 'AI' },
  { name: 'Poolside', slug: 'poolside', provider: 'ashby', token: 'poolside', category: 'AI' },
  { name: 'Scale AI', slug: 'scale', provider: 'ashby', token: 'scale', category: 'AI' },

  // ==========================================
  // 4. VA AGENCIES & BPOS
  // ==========================================
  { name: 'Athena', slug: 'athena', provider: 'ashby', token: 'athena', category: 'VA Agency' },
  { name: 'Athyna', slug: 'athyna', provider: 'ashby', token: 'athyna', category: 'Offshore Staffing' },
  { name: 'Wing Assistant', slug: 'wingassistant', provider: 'ashby', token: 'wingassistant', category: 'VA Agency' },
  { name: 'Oceans', slug: 'oceans', provider: 'ashby', token: 'oceans', category: 'VA Agency' },
  { name: 'Cyberbacker', slug: 'cyberbacker', provider: 'lever', token: 'cyberbacker', category: 'VA Agency' },
  { name: 'Peak Support', slug: 'peaksupport', provider: 'lever', token: 'peaksupport', category: 'BPO' },
  { name: 'Sourcefit', slug: 'sourcefit', provider: 'lever', token: 'sourcefit', category: 'BPO' },
  { name: 'Personiv', slug: 'personiv', provider: 'lever', token: 'personiv', category: 'BPO' },
  { name: 'MultiplyMii', slug: 'multiplymii', provider: 'lever', token: 'multiplymii', category: 'Offshore Staffing' },
  { name: 'TaskUs', slug: 'taskus', provider: 'greenhouse', token: 'taskus', category: 'BPO' },
  { name: 'SupportNinja', slug: 'supportninja', provider: 'greenhouse', token: 'supportninja', category: 'BPO' },
  { name: 'Helpware', slug: 'helpware', provider: 'greenhouse', token: 'helpware', category: 'BPO' },
  { name: 'PartnerHero', slug: 'partnerhero', provider: 'greenhouse', token: 'partnerhero', category: 'BPO' },
  { name: 'Boldr', slug: 'boldr', provider: 'greenhouse', token: 'boldr', category: 'BPO' },
  { name: 'ModSquad', slug: 'modsquad', provider: 'greenhouse', token: 'modsquad', category: 'BPO' },
  { name: 'SupportShepherd', slug: 'supportshepherd', provider: 'workable', token: 'jobssomewhere', category: 'Offshore Staffing' },
  { name: 'Coconut VA', slug: 'coconutva', provider: 'workable', token: 'coconutva', category: 'VA Agency' },
  { name: 'CrewBloom', slug: 'crewbloom', provider: 'workable', token: 'crewbloom', category: 'Offshore Staffing' },
  { name: 'QuickTeam', slug: 'quickteam', provider: 'workable', token: 'quickteam', category: 'VA Agency' }
];

async function seed() {
  console.log(`Seeding ${targetCompanies.length} target companies into database...`);

  for (const company of targetCompanies) {
    await db.query(
      `INSERT INTO companies (name, slug, ats_provider, ats_board_token, category, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (slug) 
       DO UPDATE SET 
         name = EXCLUDED.name,
         ats_provider = EXCLUDED.ats_provider,
         ats_board_token = EXCLUDED.ats_board_token,
         category = EXCLUDED.category,
         is_active = TRUE,
         updated_at = CURRENT_TIMESTAMP;`,
      [company.name, company.slug, company.provider, company.token, company.category]
    );
  }

  console.log('Seed executed successfully.');
  await db.end();
}

seed().catch((err) => {
  console.error('Seed execution failed:', err);
  process.exit(1);
});