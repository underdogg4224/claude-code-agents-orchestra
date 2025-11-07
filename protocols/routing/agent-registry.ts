import * as fs from 'fs';
import * as path from 'path';

export type AgentRole = 'coordinator' | 'specialist' | 'orchestrator';
export type TierType = 'opus' | 'sonnet' | 'haiku';

export interface AgentInfo {
  name: string;
  role: AgentRole;
  tier: TierType;
  department?: string;
  filePath: string;
}

export class AgentRegistry {
  private agents: Map<string, AgentInfo>;

  private constructor() {
    this.agents = new Map();
  }

  /**
   * Load agent registry from filesystem
   */
  static async load(agentsDir: string): Promise<AgentRegistry> {
    const registry = new AgentRegistry();
    await registry.scanDirectory(agentsDir);
    return registry;
  }

  /**
   * Recursively scan directory for agent markdown files
   */
  private async scanDirectory(dir: string): Promise<void> {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          await this.parseAgentFile(fullPath);
        }
      }
    } catch (error) {
      // Silently skip directories that can't be read
    }
  }

  /**
   * Parse an agent markdown file and extract metadata
   */
  private async parseAgentFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const agentInfo = this.extractAgentInfo(content, filePath);

      if (agentInfo) {
        this.agents.set(agentInfo.name, agentInfo);
      }
    } catch (error) {
      // Skip files that can't be parsed
    }
  }

  /**
   * Extract agent information from markdown content
   */
  private extractAgentInfo(content: string, filePath: string): AgentInfo | null {
    // Extract agent name from file path or title
    const fileName = path.basename(filePath, '.md');
    let name = fileName;

    // Try to extract name from markdown title (# Agent Name)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      name = titleMatch[1].toLowerCase().replace(/[^a-z0-9-]/g, '-');
    }

    // Determine role from directory structure or content
    let role: AgentRole = 'specialist'; // Default
    
    if (filePath.includes('coordinator')) {
      role = 'coordinator';
    } else if (filePath.includes('orchestrat')) {
      role = 'orchestrator';
    }

    // Also check content for role mentions
    const contentLower = content.toLowerCase();
    if (contentLower.includes('coordinator') && !contentLower.includes('specialist')) {
      role = 'coordinator';
    } else if (contentLower.includes('orchestrator')) {
      role = 'orchestrator';
    }

    // Determine tier (default to sonnet if not specified)
    let tier: TierType = 'sonnet'; // Default

    // Look for tier specification in markdown
    const tierMatch = content.match(/\*\*model\*\*:\s*(opus|sonnet|haiku)/i);
    if (tierMatch) {
      tier = tierMatch[1].toLowerCase() as TierType;
    }

    // Alternative: check for tier in YAML frontmatter or specific patterns
    const yamlTierMatch = content.match(/tier:\s*(opus|sonnet|haiku)/i);
    if (yamlTierMatch) {
      tier = yamlTierMatch[1].toLowerCase() as TierType;
    }

    // Determine department from directory structure
    let department: string | undefined;
    const pathParts = filePath.split(path.sep);
    const agentsIndex = pathParts.indexOf('agents');
    if (agentsIndex !== -1 && agentsIndex < pathParts.length - 1) {
      department = pathParts[agentsIndex + 1];
    }

    return {
      name,
      role,
      tier,
      department,
      filePath,
    };
  }

  /**
   * Find agent by name
   */
  findByName(name: string): AgentInfo | undefined {
    return this.agents.get(name);
  }

  /**
   * Find all agents with a specific role
   */
  findByRole(role: AgentRole): AgentInfo[] {
    return Array.from(this.agents.values()).filter(a => a.role === role);
  }

  /**
   * Find all agents in a specific tier
   */
  findByTier(tier: TierType): AgentInfo[] {
    return Array.from(this.agents.values()).filter(a => a.tier === tier);
  }

  /**
   * Find all agents in a specific department
   */
  findByDepartment(department: string): AgentInfo[] {
    return Array.from(this.agents.values()).filter(a => a.department === department);
  }

  /**
   * Check if an agent exists
   */
  exists(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * Validate if routing is allowed between sender and recipient
   */
  canRoute(senderName: string, recipientName: string): boolean {
    const sender = this.agents.get(senderName);
    const recipient = this.agents.get(recipientName);

    if (!sender || !recipient) {
      return false; // Unknown agents
    }

    // Apply hierarchy rules
    // Coordinators can send to specialists or other coordinators
    if (sender.role === 'coordinator') {
      return recipient.role === 'specialist' || recipient.role === 'coordinator';
    }

    // Specialists can send to coordinators or orchestrators (escalation)
    if (sender.role === 'specialist') {
      return recipient.role === 'coordinator' || recipient.role === 'orchestrator';
    }

    // Orchestrators can send to coordinators
    if (sender.role === 'orchestrator') {
      return recipient.role === 'coordinator';
    }

    return true;
  }

  /**
   * Get all registered agents
   */
  getAll(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get count of registered agents
   */
  size(): number {
    return this.agents.size;
  }

  /**
   * Get statistics about registered agents
   */
  getStats(): {
    total: number;
    byRole: Record<AgentRole, number>;
    byTier: Record<TierType, number>;
    byDepartment: Record<string, number>;
  } {
    const byRole: Record<AgentRole, number> = {
      coordinator: 0,
      specialist: 0,
      orchestrator: 0,
    };

    const byTier: Record<TierType, number> = {
      opus: 0,
      sonnet: 0,
      haiku: 0,
    };

    const byDepartment: Record<string, number> = {};

    for (const agent of this.agents.values()) {
      byRole[agent.role]++;
      byTier[agent.tier]++;

      if (agent.department) {
        byDepartment[agent.department] = (byDepartment[agent.department] || 0) + 1;
      }
    }

    return {
      total: this.agents.size,
      byRole,
      byTier,
      byDepartment,
    };
  }

  /**
   * Refresh registry by re-scanning the agents directory
   */
  async refresh(agentsDir: string): Promise<void> {
    this.agents.clear();
    await this.scanDirectory(agentsDir);
  }
}
