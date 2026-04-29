import type { ExtensionFactory } from "@mariozechner/pi-coding-agent";

const RUNTIME_METADATA_HEADER = "## Gateway Runtime Metadata";

function formatModelLabel(model: { provider?: string; id?: string } | undefined): string | null {
  const provider = model?.provider?.trim();
  const id = model?.id?.trim();
  if (!provider || !id) {
    return null;
  }
  return `${provider}/${id}`;
}

function buildRuntimeMetadataBlock(modelLabel: string | null): string | null {
  if (!modelLabel) {
    return null;
  }

  return `${RUNTIME_METADATA_HEADER}\n\n- Current model: ${modelLabel}`;
}

export function createRuntimeMetadataExtension(): ExtensionFactory {
  return (pi) => {
    pi.on("before_agent_start", async (event, ctx) => {
      const metadataBlock = buildRuntimeMetadataBlock(formatModelLabel(ctx.model));
      if (!metadataBlock) {
        return undefined;
      }

      return {
        systemPrompt: `${event.systemPrompt}\n\n${metadataBlock}`,
      };
    });
  };
}
