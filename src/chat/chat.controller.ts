import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

export class ChatMessageDto {
  userId!: string;
  message!: string;
  context?: Record<string, unknown>;
  agent?: string; // which agent/persona to use
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async handleMessage(@Body() body: ChatMessageDto) {
    const { userId, message, context } = body;
    const reply = await this.chatService.handleUserMessage({
      userId,
      message,
      agent: body.agent,
      context: context ?? {},
    });

    return { reply };
  }
}
