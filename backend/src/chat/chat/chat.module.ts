import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";
import { AuthModule } from "src/auth/auth.module";
import { ChannelService } from "./channel.service";
import { PrivateChatService } from "./privatechat.service";
import { ChannelController } from "./channel.controller";
import { PrivateChatController } from "./privatechat.controller";
import { UserService } from "src/user/user.service";

@Module({
  imports: [AuthModule],
  providers: [ChatGateway, ChatService, ChannelService, PrivateChatService, UserService],
  controllers: [PrivateChatController, ChannelController],
})
export class ChatModule {}
