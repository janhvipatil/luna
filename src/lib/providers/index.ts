import type { AiContext, Provider, GenerationRequest } from "./types";
import { mockProvider } from "./mock";
import { replicateProvider } from "./replicate";
import { comfyProvider } from "./comfyui";
import { veoProvider } from "./veo";
import { geminiImageProvider } from "./gemini-image";

/**
 * Provider registry.
 *
 * Order matters: this is the display order in settings and the fallback order
 * when auto-selecting. The mock provider is last as an always-available safety
 * net so generation never hard-fails for a user with no backend connected.
 */
const REGISTRY: Provider[] = [
  veoProvider,
  geminiImageProvider,
  replicateProvider,
  comfyProvider,
  mockProvider,
];

/** "auto" picks the best configured backend per scene (video → Veo, etc.). */
export const AUTO_PROVIDER_ID = "auto";
export const DEFAULT_PROVIDER_ID = AUTO_PROVIDER_ID;

export function listProviders(): Provider[] {
  return REGISTRY;
}

export function getProvider(id: string): Provider | undefined {
  return REGISTRY.find((p) => p.id === id);
}

/**
 * Resolve the provider to actually run a request:
 *  - honor an explicit, configured, capable choice ("auto" skips this);
 *  - otherwise pick the first configured provider that supports the medium;
 *  - otherwise fall back to the mock provider.
 */
export function resolveProvider(
  preferredId: string | undefined,
  req: GenerationRequest,
  ctx: AiContext,
): Provider {
  const supports = (p: Provider) => (req.medium === "video" ? p.capabilities.video : p.capabilities.image);

  if (preferredId && preferredId !== AUTO_PROVIDER_ID) {
    const chosen = getProvider(preferredId);
    if (chosen && chosen.isConfigured(ctx) && supports(chosen)) return chosen;
  }

  const configured = REGISTRY.find((p) => p.id !== "mock" && p.isConfigured(ctx) && supports(p));
  return configured ?? mockProvider;
}

/** Serializable provider info for the client (no functions). */
export interface ProviderInfo {
  id: string;
  name: string;
  description: string;
  homepage?: string;
  capabilities: Provider["capabilities"];
  configured: boolean;
  configHint?: string;
}

export function describeProviders(ctx: AiContext): ProviderInfo[] {
  return REGISTRY.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    homepage: p.homepage,
    capabilities: p.capabilities,
    configured: p.isConfigured(ctx),
    configHint: p.configHint,
  }));
}

export type { Provider, GenerationRequest, GenerationResult } from "./types";
