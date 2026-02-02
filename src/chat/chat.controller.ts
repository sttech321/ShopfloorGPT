import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

export class ChatMessageDto {
  userId!: string;
  message!: string;
  context?: Record<string, unknown>;
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
      context: context ?? {},
    });

    return { reply };
  }
}
