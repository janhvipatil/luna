import type { Provider, GenerationRequest, GenerationResult } from "./types";
import { mockProvider } from "./mock";
import { replicateProvider } from "./replicate";
import { comfyProvider } from "./comfyui";

/**
 * Provider registry.
 *
 * Order matters: this is the display order in settings and the fallback order
 * when auto-selecting. The mock provider is last as an always-available safety
 * net so generation never hard-fails for a user with no backend connected.
 */
const REGISTRY: Provider[] = [replicateProvider, comfyProvider, mockProvider];

export const DEFAULT_PROVIDER_ID = "mock";

export function listProviders(): Provider[] {
  return REGISTRY;
}

export function getProvider(id: string): Provider | undefined {
  return REGISTRY.find((p) => p.id === id);
}

/**
 * Resolve the provider to actually run a request:
 *  - honor an explicit, configured, capable choice;
 *  - otherwise pick the first configured provider that supports the medium;
 *  - otherwise fall back to the mock provider.
 */
export function resolveProvider(preferredId: string | undefined, req: GenerationRequest): Provider {
  const supports = (p: Provider) => (req.medium === "video" ? p.capabilities.video : p.capabilities.image);

  if (preferredId) {
    const chosen = getProvider(preferredId);
    if (chosen && chosen.isConfigured() && supports(chosen)) return chosen;
  }

  const configured = REGISTRY.find((p) => p.id !== "mock" && p.isConfigured() && supports(p));
  return configured ?? mockProvider;
}

export async function generate(
  preferredId: string | undefined,
  req: GenerationRequest,
): Promise<GenerationResult> {
  const provider = resolveProvider(preferredId, req);
  return provider.generate(req);
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

export function describeProviders(): ProviderInfo[] {
  return REGISTRY.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    homepage: p.homepage,
    capabilities: p.capabilities,
    configured: p.isConfigured(),
    configHint: p.configHint,
  }));
}

export type { Provider, GenerationRequest, GenerationResult } from "./types";
