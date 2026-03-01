import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AgentMessage } from './agent-message.model';

export type { AgentMessage };

@Component({
    selector: 'lib-agent-chat',
    imports: [
      FormsModule,
      MatCardModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatIconModule,
      MatChipsModule,
      MatProgressBarModule,
    ],
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
