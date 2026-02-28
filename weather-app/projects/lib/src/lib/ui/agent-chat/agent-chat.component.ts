import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentMessage } from './agent-message.model';

export type { AgentMessage };

@Component({
    selector: 'lib-agent-chat',
    imports: [FormsModule],
    templateUrl: './agent-chat.component.html',
    styleUrl: './agent-chat.component.scss'
})
export class AgentChatComponent {
  readonly messages = input<AgentMessage[]>([]);
  readonly disabled = input(false);
  readonly sendMessage = output<string>();

  inputText = '';

  onSend(): void {
    const text = this.inputText.trim();
    if (text.length === 0) return;
    this.sendMessage.emit(text);
    this.inputText = '';
  }
}
