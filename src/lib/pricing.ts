/**
 * Plans shown on /pricing. Kept in one place so prices and limits are easy to
 * tune. Billing isn't wired up — plan buttons lead to sign-up.
 *
 * AI runs on each user's own Gemini key (bring-your-own-key), so Luna's plans
 * price the software only; Google bills generation directly. For reference,
 * Veo 3.1 Fast is ~$0.10 per generated second at 720p, and a typical reel
 * (mostly stills + two 4-second video shots) costs about $0.80 on Google.
 */

export interface Plan {
  id: "free" | "cafe" | "kitchen" | "group";
  name: string;
  tagline: string;
  /** Monthly price in USD (null = contact sales). */
  monthly: number | null;
  /** Effective monthly price when billed yearly. */
  yearly: number | null;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Taste",
    tagline: "Try Luna with your first few reels.",
    monthly: 0,
    yearly: 0,
    features: [
      "1 venue",
      "All café & restaurant templates",
      "Unlimited storyboards & AI drafts",
      "Stock-photo scene previews",
      "720p export with a small Luna badge",
    ],
    cta: "Start free",
  },
  {
    id: "cafe",
    name: "Café",
    tagline: "For a single café posting every week.",
    monthly: 29,
    yearly: 24,
    features: [
      "Everything in Taste",
      "No watermark",
      "Animate your own dish photos",
      "Brand kit: colours, font & logo",
      "Voiceover & background music",
    ],
    cta: "Start with Café",
    highlighted: true,
  },
  {
    id: "kitchen",
    name: "Kitchen",
    tagline: "For busy restaurants posting daily.",
    monthly: 79,
    yearly: 66,
    features: [
      "Everything in Café",
      "1080p video",
      "Up to 3 venues",
      "3 team seats",
      "Priority rendering",
    ],
    cta: "Start with Kitchen",
  },
  {
    id: "group",
    name: "Group",
    tagline: "Multi-site groups and franchises.",
    monthly: null,
    yearly: null,
    features: [
      "Unlimited venues & seats",
      "Custom video allowance",
      "Shared brand templates",
      "Onboarding & support",
    ],
    cta: "Talk to us",
  },
];

export const PRICING_FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What do the AI features cost?",
    a: "Luna runs on your own Google Gemini API key, so Google bills you directly at its own rates. AI drafts and voiceovers work on Gemini's free tier; Veo video (from $0.05 per second) and AI images (about $0.03 each) need billing on your Google project. A typical reel with two short video shots costs about $0.80.",
  },
  {
    q: "Which AI model makes the videos?",
    a: "Google Veo 3.1 — the same model behind Google Flow. It generates vertical clips with natural sound, and can animate photos of your real dishes.",
  },
  {
    q: "Do I own what I make?",
    a: "Yes. Your storyboards, captions and exported videos are yours to post anywhere, including ads.",
  },
  {
    q: "Why bring my own key?",
    a: "You pay Google's price with no markup, keep control of your spending (set budgets in Google Cloud), and your generations run under your own account.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Plans are month-to-month (or yearly at a discount) and you can cancel whenever you like — you keep access until the end of the period.",
  },
];
