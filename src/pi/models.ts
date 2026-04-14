import type { ModelRegistry } from "@mariozechner/pi-coding-agent";
import { getModelRegistry } from "./runtime.js";

type RuntimeModel = Awaited<ReturnType<ModelRegistry["getAvailable"]>>[number];

export interface AvailableModelInfo {
  provider: string;
  id: string;
  name?: string;
  label: string;
  model: RuntimeModel;
}

export interface ParsedModelReference {
  provider: string;
  id: string;
}

export function parseModelReference(rawRef: string): ParsedModelReference | null {
  const trimmed = rawRef.trim();
  const separatorIndex = trimmed.indexOf("/");
  if (separatorIndex <= 0 || separatorIndex === trimmed.length - 1) {
    return null;
  }

  const provider = trimmed.slice(0, separatorIndex).trim();
  const id = trimmed.slice(separatorIndex + 1).trim();
  if (!provider || !id) {
    return null;
  }

  return { provider, id };
}

type ModelRegistryLike = Pick<ModelRegistry, "getAvailable">;

export async function listAvailableModels(
  registry: ModelRegistryLike = getModelRegistry(),
): Promise<AvailableModelInfo[]> {
  const models = await registry.getAvailable();

  return [...models]
    .sort((left, right) => {
      const providerCompare = left.provider.localeCompare(right.provider);
      if (providerCompare !== 0) {
        return providerCompare;
      }
      return left.id.localeCompare(right.id);
    })
    .map((model) => ({
      provider: model.provider,
      id: model.id,
      name: model.name,
      label: formatModelLabel(model.provider, model.id),
      model,
    }));
}

export function filterAvailableModels(
  models: AvailableModelInfo[],
  providerFilter?: string,
): AvailableModelInfo[] {
  const trimmed = providerFilter?.trim();
  if (!trimmed) {
    return models;
  }

  const normalizedProvider = trimmed.toLowerCase();
  return models.filter((model) => model.provider.toLowerCase() === normalizedProvider);
}

export async function findAvailableModel(
  rawRef: string,
  registry: ModelRegistryLike = getModelRegistry(),
): Promise<AvailableModelInfo | null> {
  const parsed = parseModelReference(rawRef);
  if (!parsed) {
    return null;
  }

  const models = await listAvailableModels(registry);
  const exact = models.find(
    (model) => model.provider === parsed.provider && model.id === parsed.id,
  );
  if (exact) {
    return exact;
  }

  const providerLower = parsed.provider.toLowerCase();
  const idLower = parsed.id.toLowerCase();
  const caseInsensitiveMatches = models.filter(
    (model) =>
      model.provider.toLowerCase() === providerLower && model.id.toLowerCase() === idLower,
  );
  return caseInsensitiveMatches.length === 1 ? caseInsensitiveMatches[0] : null;
}

export function formatModelLabel(provider: string, id: string): string {
  return `${provider}/${id}`;
}
