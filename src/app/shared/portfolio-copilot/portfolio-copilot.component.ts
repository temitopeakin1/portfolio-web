import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AiChatMessage, AiService } from '../../core/ai.service';
import { PortfolioContextService } from '../../core/portfolio-context.service';

type CopilotRole = 'user' | 'assistant';

interface CopilotMessage {
  id: string;
  role: CopilotRole;
  text: string;
}

const SUGGESTED_PROMPTS = [
  'Which projects are best for fintech use cases?',
  'What frontend technologies does Temitope use most?',
  'Explain CAP theorem at a high level for an interview.',
  'What trade-offs matter when choosing REST vs GraphQL?',
];

@Component({
  selector: 'app-portfolio-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-copilot.component.html',
  styleUrl: './portfolio-copilot.component.css',
})
export class PortfolioCopilotComponent {
  protected readonly starterPrompts = SUGGESTED_PROMPTS;
  protected readonly input = signal('');
  protected readonly loading = signal(false);
  protected readonly messages = signal<CopilotMessage[]>([
    {
      id: this.makeId(),
      role: 'assistant',
      text: "Hey — I'm an AI Chatbot for Temitope Akinmegha's Portfolio site. You can inquire about his Portfolio, or anything related to Programming, Tech, Algos and System design.",
    },
  ]);

  private contextCache: string | null = null;

  constructor(
    private readonly aiService: AiService,
    private readonly contextService: PortfolioContextService
  ) {}

  protected async ask(prompt?: string): Promise<void> {
    const question = (prompt ?? this.input()).trim();
    if (!question || this.loading()) {
      return;
    }

    this.messages.update((current) => [
      ...current,
      { id: this.makeId(), role: 'user', text: question },
    ]);
    this.input.set('');
    this.loading.set(true);

    try {
      const context = await this.getContext();
      const history = this.toAiHistory(this.messages().slice(-8));
      const result = await this.aiService.ask({
        question,
        context,
        history,
      });
      this.messages.update((current) => [
        ...current,
        { id: this.makeId(), role: 'assistant', text: result.answer },
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.ask();
    }
  }

  private async getContext(): Promise<string> {
    if (!this.contextCache) {
      this.contextCache = await this.contextService.buildContext();
    }
    return this.contextCache;
  }

  private toAiHistory(messages: CopilotMessage[]): AiChatMessage[] {
    return messages.map((message) => ({
      role: message.role,
      content: message.text,
    }));
  }

  private makeId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }
}
