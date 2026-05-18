import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BLOG_SLASH_COMMANDS, SlashCommand } from '../../core/blog/blog-editor-slash.commands';

type SlashCommandWithOffset = SlashCommand & { cursorOffset?: number };

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    },
  ],
})
export class MarkdownEditorComponent implements ControlValueAccessor, AfterViewInit {
  private readonly textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('editor');

  protected readonly placeholder = "Tell your story… Type '/' for commands";
  protected readonly menuOpen = signal(false);
  protected readonly menuItems = signal<SlashCommandWithOffset[]>([]);
  protected readonly activeIndex = signal(0);
  protected readonly menuTop = signal(0);
  protected readonly menuLeft = signal(0);

  protected value = '';
  protected disabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private triggerStart = -1;
  private triggerQuery = '';
  private pendingWrite: string | null = null;

  ngAfterViewInit(): void {
    if (this.pendingWrite !== null) {
      this.value = this.pendingWrite;
      this.pendingWrite = null;
      this.syncToTextarea();
    }
  }

  writeValue(value: string | null): void {
    this.value = value ?? '';
    const el = this.textareaRef()?.nativeElement;
    if (el) {
      el.value = this.value;
    } else {
      this.pendingWrite = this.value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  protected onInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.value = el.value;
    this.onChange(this.value);
    this.updateSlashMenu(el);
  }

  protected onBlur(): void {
    this.onTouched();
    setTimeout(() => this.closeMenu(), 120);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.menuOpen()) return;

    const items = this.menuItems();
    if (!items.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.set((this.activeIndex() + 1) % items.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.set((this.activeIndex() - 1 + items.length) % items.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.applyCommand(items[this.activeIndex()]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
    }
  }

  protected selectCommand(command: SlashCommandWithOffset): void {
    this.applyCommand(command);
  }

  private syncToTextarea(): void {
    const el = this.textareaRef()?.nativeElement;
    if (el) el.value = this.value;
  }

  private emitValue(value: string): void {
    this.value = value;
    this.syncToTextarea();
    this.onChange(this.value);
  }

  private updateSlashMenu(el: HTMLTextAreaElement): void {
    const pos = el.selectionStart ?? 0;
    const before = this.value.slice(0, pos);
    const lineStart = before.lastIndexOf('\n') + 1;
    const linePrefix = before.slice(lineStart);

    if (!linePrefix.startsWith('/')) {
      this.closeMenu();
      return;
    }

    this.triggerStart = lineStart;
    this.triggerQuery = linePrefix.slice(1).toLowerCase();
    const filtered = BLOG_SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(this.triggerQuery) ||
        cmd.id.includes(this.triggerQuery)
    ) as SlashCommandWithOffset[];

    if (!filtered.length) {
      this.closeMenu();
      return;
    }

    this.menuItems.set(filtered);
    this.activeIndex.set(0);
    this.positionMenu(el);
    this.menuOpen.set(true);
  }

  private positionMenu(el: HTMLTextAreaElement): void {
    const lineCount = this.value.slice(0, this.triggerStart).split('\n').length;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight || '28') || 28;
    this.menuTop.set(lineCount * lineHeight + 4);
    this.menuLeft.set(0);
  }

  private applyCommand(command: SlashCommandWithOffset): void {
    const el = this.textareaRef()?.nativeElement;
    if (!el || this.triggerStart < 0) return;

    const pos = el.selectionStart ?? this.value.length;
    const before = this.value.slice(0, this.triggerStart);
    const after = this.value.slice(pos);
    const insert = command.insert;
    const next = `${before}${insert}${after}`;

    this.emitValue(next);
    this.closeMenu();

    queueMicrotask(() => {
      el.focus();
      let cursor = before.length + insert.length;
      if (command.id === 'code') cursor = before.length + 4;
      if (command.id === 'image') cursor = before.length + 2;
      if (command.id === 'link') cursor = before.length + 1;
      if (command.id === 'bold' || command.id === 'italic') {
        cursor = before.length + insert.indexOf(' ');
      }
      el.setSelectionRange(cursor, cursor);
    });
  }

  private closeMenu(): void {
    this.menuOpen.set(false);
    this.menuItems.set([]);
    this.triggerStart = -1;
    this.triggerQuery = '';
  }
}
