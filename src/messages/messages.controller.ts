import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Auth, GetUser } from '../common/decorators';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get('conversations')
  @Auth()
  @ApiOperation({
    summary:
      'Lista de conversaciones (amigos confirmados) con último mensaje y unread por peer.',
  })
  listConversations(@GetUser('id') userId: string) {
    return this.messages.listConversations(userId);
  }

  @Get('unread-count')
  @Auth()
  @ApiOperation({ summary: 'Conteo global de mensajes no leídos del usuario.' })
  async unreadCount(@GetUser('id') userId: string) {
    const count = await this.messages.getUnreadCount(userId);
    return { count };
  }

  @Get(':peerId')
  @Auth()
  @ApiOperation({ summary: 'Histórico de mensajes con un peer. Ordenado ASC.' })
  @ApiQuery({ name: 'take', type: Number, required: false, example: 50 })
  @ApiQuery({
    name: 'before',
    type: String,
    required: false,
    description: 'ISO date para paginar hacia atrás (cursor por createdAt).',
  })
  listMessages(
    @GetUser('id') userId: string,
    @Param('peerId') peerId: string,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
    @Query('before') before?: string,
  ) {
    const beforeDate = before ? new Date(before) : undefined;
    return this.messages.listMessages(userId, peerId, take, beforeDate);
  }

  @Post()
  @Auth()
  @ApiOperation({
    summary:
      'Enviar un mensaje. Recomendado usar el WS para feedback en vivo; este endpoint queda como fallback.',
  })
  send(@GetUser('id') userId: string, @Body() dto: SendMessageDto) {
    return this.messages.send(userId, dto.recipientId, dto.body);
  }

  @Patch(':peerId/read')
  @Auth()
  @ApiOperation({
    summary: 'Marca como leídos todos los mensajes recibidos desde un peer.',
  })
  markRead(
    @GetUser('id') userId: string,
    @Param('peerId') peerId: string,
  ) {
    return this.messages.markRead(userId, peerId);
  }

  @Delete(':messageId')
  @Auth()
  @ApiOperation({
    summary: 'Soft delete de un mensaje propio (queda como "mensaje eliminado").',
  })
  remove(
    @GetUser('id') userId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messages.softDelete(userId, messageId);
  }
}
