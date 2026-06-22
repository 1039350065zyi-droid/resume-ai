import fs from 'fs';
import path from 'path';
import { Skill } from '@/types';

const SKILLS_DIR = path.join(process.cwd(), 'lib', 'ai', 'skills');

export class SkillManager {
  private static instance: SkillManager;
  private skills: Map<string, Skill> = new Map();

  private constructor() {
    this.loadSkills();
  }

  static getInstance(): SkillManager {
    if (!SkillManager.instance) {
      SkillManager.instance = new SkillManager();
    }
    return SkillManager.instance;
  }

  private loadSkills(): void {
    try {
      const files = ['analyze.json', 'optimize.json', 'interview.json'];

      for (const file of files) {
        const filePath = path.join(SKILLS_DIR, file);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const skill: Skill = JSON.parse(content);
        this.skills.set(skill.id, skill);

        if (skill.children) {
          for (const child of skill.children) {
            this.skills.set(child.id, child);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  }

  getSkill(id: string): Skill | undefined {
    return this.skills.get(id);
  }

  getModuleSkills(): Skill[] {
    return Array.from(this.skills.values()).filter((s) => s.level === 'module');
  }

  getRuleSkills(parentId?: string): Skill[] {
    return Array.from(this.skills.values()).filter(
      (s) => s.level === 'rule' && (!parentId || s.parentId === parentId)
    );
  }

  getAllSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getPrompt(skillId: string): string {
    return this.skills.get(skillId)?.prompt || '';
  }

  isEnabled(skillId: string): boolean {
    return this.skills.get(skillId)?.enabled ?? false;
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill | null> {
    const skill = this.skills.get(id);
    if (!skill) return null;

    const updated: Skill = { ...skill, ...updates, updatedAt: new Date().toISOString() };
    this.skills.set(id, updated);
    await this.saveSkillToFile(updated);
    return updated;
  }

  deleteSkill(id: string): boolean {
    const skill = this.skills.get(id);
    if (!skill) return false;

    if (skill.parentId) {
      const parent = this.skills.get(skill.parentId);
      if (parent?.children) {
        parent.children = parent.children.filter((c) => c.id !== id);
        this.saveSkillToFile(parent);
      }
    }

    this.skills.delete(id);
    return true;
  }

  private saveSkillToFile(skill: Skill): void {
    try {
      let targetSkill = skill;
      let fileName: string;

      if (skill.level === 'module') {
        fileName = `${skill.id.replace('_skill', '')}.json`;
      } else {
        const parent = this.skills.get(skill.parentId || '');
        if (!parent?.children) return;

        const idx = parent.children.findIndex((c) => c.id === skill.id);
        if (idx !== -1) parent.children[idx] = skill;
        targetSkill = parent;
        fileName = `${parent.id.replace('_skill', '')}.json`;
      }

      const filePath = path.join(SKILLS_DIR, fileName);
      fs.writeFileSync(filePath, JSON.stringify(targetSkill, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save skill:', error);
    }
  }
}

export const skillManager = SkillManager.getInstance();
