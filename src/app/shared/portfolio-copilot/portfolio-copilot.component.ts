import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AiChatMessage, AiService } from '../../core/ai.service';
import { PortfolioContextService } from '../../core/portfolio-context.service';

type CopilotRole = 'user' | 'assistant';

type MessageSegment = { type: 'text' | 'code'; content: string };

interface CopilotMessage {
  id: string;
  role: CopilotRole;
  text: string;
  /** When true, bubble shows `Hey,` + animated 👋 then `text` (same pattern as Home hero). */
  greetingWithWave?: boolean;
}

const SUGGESTED_PROMPTS = [
  "Give me Temitope's 30-second elevator pitch for recruiters.",
  'Which projects are best for fintech use cases?',
  'What frontend technologies does Temitope use most?',
  'Explain CAP theorem at a high level for an interview.',
  'What trade-offs matter when choosing REST vs GraphQL?',
];

@Component({
  selector: 'app-portfolio-copilot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './portfolio-copilot.component.html',
  styleUrl: './portfolio-copilot.component.css',
})
export class PortfolioCopilotComponent {
  @ViewChild('threadEl') private threadEl?: ElementRef<HTMLElement>;

  protected readonly starterPrompts = SUGGESTED_PROMPTS;
  protected readonly capabilities: { label: string; route?: string }[] = [
    { label: 'Portfolio Q&A', route: '/about' },
    { label: 'Tech & system design' },
    { label: 'Projects', route: '/projects' },
    { label: 'Blog', route: '/blog' },
  ];
  protected readonly input = signal('');
  protected readonly loading = signal(false);
  protected readonly botSenderLabel = 'Tmegha AI bot';
  protected readonly userSenderLabel = 'You';
  /** Same mark as site header / favicon */
  protected readonly copilotLogoSrc = 'assets/images/logo.svg';
  protected readonly copyFeedbackId = signal<string | null>(null);
  protected readonly codeCopyFeedback = signal<string | null>(null);
  protected readonly messages = signal<CopilotMessage[]>([
    {
      id: this.makeId(),
      role: 'assistant',
      greetingWithWave: true,
      text: "I'm Tmegha AI bot on Temitope Akinmegha's portfolio site. Ask about this portfolio, or anything on programming, tech, algorithms, and system design.",
    },
  ]);

  private contextCache: string | null = null;
  private copyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private codeCopyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly aiService: AiService,
    private readonly contextService: PortfolioContextService
  ) {}

  protected userAvatarInitial(): string {
    return 'Y';
  }

  protected messageSegments(text: string): MessageSegment[] {
    const segments: MessageSegment[] = [];
    const re = /```(?:[^\n`]*\n)?([\s\S]*?)```/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) {
        const t = text.slice(last, m.index);
        if (t.length) {
          segments.push({ type: 'text', content: t });
        }
      }
      const code = m[1].replace(/\n$/, '');
      segments.push({ type: 'code', content: code });
      last = m.index + m[0].length;
    }
    if (last < text.length) {
      const t = text.slice(last);
      if (t.length) {
        segments.push({ type: 'text', content: t });
      }
    }
    return segments.length ? segments : [{ type: 'text', content: text }];
  }

  protected assistantPlainTextForCopy(message: CopilotMessage): string {
    return message.greetingWithWave
      ? `Hey, 👋 ${message.text}`
      : message.text;
  }

  protected async copyAssistantReply(message: CopilotMessage): Promise<void> {
    const text = this.assistantPlainTextForCopy(message);
    try {
      await navigator.clipboard.writeText(text);
      this.setCopyFeedback(message.id);
    } catch {
      this.fallbackCopy(text);
      this.setCopyFeedback(message.id);
    }
  }

  protected async copyCode(content: string, blockId: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
      this.setCodeCopyFeedback(blockId);
    } catch {
      this.fallbackCopy(content);
      this.setCodeCopyFeedback(blockId);
    }
  }

  private setCopyFeedback(id: string): void {
    if (this.copyFeedbackTimer) {
      clearTimeout(this.copyFeedbackTimer);
    }
    this.copyFeedbackId.set(id);
    this.copyFeedbackTimer = setTimeout(() => {
      this.copyFeedbackId.set(null);
      this.copyFeedbackTimer = null;
    }, 2000);
  }

  private setCodeCopyFeedback(id: string): void {
    if (this.codeCopyFeedbackTimer) {
      clearTimeout(this.codeCopyFeedbackTimer);
    }
    this.codeCopyFeedback.set(id);
    this.codeCopyFeedbackTimer = setTimeout(() => {
      this.codeCopyFeedback.set(null);
      this.codeCopyFeedbackTimer = null;
    }, 2000);
  }

  protected codeBlockId(messageId: string, index: number): string {
    return `${messageId}-code-${index}`;
  }

  private fallbackCopy(text: string): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

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
    this.scrollThreadSoon();

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
      this.scrollThreadSoon();
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.ask();
    }
  }

  private scrollThreadSoon(): void {
    requestAnimationFrame(() => {
      const el = this.threadEl?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
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
      content: message.greetingWithWave
        ? `Hey, ${message.text}`
        : message.text,
    }));
  }

  private makeId(): string {
    return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }
}
