import type { Provider, GenerationRequest, GenerationResult } from "./types";
import { ProviderNotConfiguredError } from "./types";
import { buildStyledPrompt } from "./prompt";

/**
 * ComfyUI adapter (skeleton).
 *
 * ComfyUI is the popular self-hosted, node-graph generation engine. This
 * adapter targets a running ComfyUI server over its HTTP API. Because a Comfy
 * workflow is a user-authored graph, the realistic integration is: load a saved
 * workflow JSON, inject the prompt/seed into known node ids, POST to /prompt,
 * then poll /history for the output image.
 *
 * The plumbing below is left as a clearly-marked TODO so it can be wired to a
 * specific workflow. It reports configured only when COMFYUI_URL is set.
 *
 * @see https://github.com/comfyanonymous/ComfyUI
 */

export const comfyProvider: Provider = {
  id: "comfyui",
  name: "ComfyUI (self-hosted)",
  description:
    "Point Luna at your own ComfyUI server and drive a saved workflow graph. Full control, runs on your hardware.",
  homepage: "https://github.com/comfyanonymous/ComfyUI",
  capabilities: { image: true, video: true },
  configHint: "Set COMFYUI_URL (e.g. http://127.0.0.1:8188) and COMFYUI_WORKFLOW path.",
  isConfigured: () => Boolean(process.env.COMFYUI_URL),

  async generate(req: GenerationRequest): Promise<GenerationResult> {
    const base = process.env.COMFYUI_URL;
    if (!base) {
      throw new ProviderNotConfiguredError("comfyui", this.configHint);
    }

    // Integration outline (enable by loading your workflow and mapping nodes):
    //
    //   const workflow = await loadWorkflow(process.env.COMFYUI_WORKFLOW);
    //   applyInputs(workflow, { prompt: buildStyledPrompt(req), seed: req.seed });
    //   const { prompt_id } = await postJson(`${base}/prompt`, { prompt: workflow });
    //   const image = await pollHistory(base, prompt_id);
    //   return { url: image, medium: req.medium, providerId: "comfyui" };
    //
    // We surface the styled prompt so the wiring point is obvious.
    void buildStyledPrompt(req);

    throw new ProviderNotConfiguredError(
      "comfyui",
      "Connect a workflow: implement the generate() body in src/lib/providers/comfyui.ts.",
    );
  },
};
