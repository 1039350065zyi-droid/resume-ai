import fs from 'fs';
import path from 'path';
import { ModelConfig } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'models.json');

export class ModelManager {
  private static instance: ModelManager;
  private models: ModelConfig[] = [];
  private readOnly = false;

  private constructor() {
    this.loadModels();
  }

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  private loadModels(): void {
    // Try loading from file first
    try {
      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        this.models = JSON.parse(content);
        return;
      }
    } catch (error) {
      console.error('Failed to load models from file:', error);
    }

    // Fallback: initialize from environment variables
    this.readOnly = true;
    const envKey = process.env.MIMO_API_KEY || '';
    const envUrl = process.env.MIMO_API_URL || 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions';
    const envModel = process.env.MIMO_MODEL || 'mimo-v2.5-pro';

    if (envKey) {
      this.models = [{
        id: 'mimo',
        name: envModel,
        provider: '小米',
        apiUrl: envUrl,
        model: envModel,
        apiKey: envKey,
        enabled: true,
        isDefault: true,
      }];
    }

    console.log('ModelManager: Using env vars (read-only mode)');
  }

  private saveModels(): void {
    if (this.readOnly) {
      console.warn('ModelManager: Cannot save in read-only mode (Vercel serverless). Changes are in-memory only.');
      return;
    }
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.models, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save models:', error);
    }
  }

  getAll(): ModelConfig[] {
    return this.models;
  }

  getEnabled(): ModelConfig[] {
    return this.models.filter((m) => m.enabled && m.apiKey);
  }

  getDefault(): ModelConfig | undefined {
    return this.models.find((m) => m.isDefault && m.enabled && m.apiKey);
  }

  getById(id: string): ModelConfig | undefined {
    return this.models.find((m) => m.id === id);
  }

  create(model: Omit<ModelConfig, 'id'>): ModelConfig {
    const id = model.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newModel: ModelConfig = { ...model, id };
    this.models.push(newModel);
    this.saveModels();
    return newModel;
  }

  update(id: string, updates: Partial<ModelConfig>): ModelConfig | null {
    const idx = this.models.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    if (updates.isDefault) {
      this.models.forEach((m) => { m.isDefault = false; });
    }

    this.models[idx] = { ...this.models[idx], ...updates, id };
    this.saveModels();
    return this.models[idx];
  }

  delete(id: string): boolean {
    const idx = this.models.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.models.splice(idx, 1);
    this.saveModels();
    return true;
  }
}

export const modelManager = ModelManager.getInstance();
