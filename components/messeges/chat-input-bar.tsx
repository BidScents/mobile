
import { useMessagingContext } from "providers/messaging-provider";
import { useState } from "react";
import { Input, XStack } from "tamagui";
import { ThemedIonicons } from "../ui/themed-icons";


interface ChatInputBarProps {
    id: string;
}

export const ChatInputBar = ({ id }: ChatInputBarProps) => {

     const [messageText, setMessageText] = useState("");
      const { isConnected, typing, getTypingUsers } = useMessagingContext();
    
      const handleTextChange = (text: string) => {
        typing.onTextChange(id, text);
        setMessageText(text);
      };
    
      const sendMessage = () => {
        console.log("message sending")
        setMessageText("")
      }
    return (
        <XStack alignItems="center" gap="$2" pb="$3">
          <ThemedIonicons name="add-outline" size={28} />
          <Input
            placeholder="Type your message"
            value={messageText}
            onFocus={() => typing.startTyping(id)}
            onBlur={() => typing.stopTyping(id)}
            onChangeText={(text) => handleTextChange(text)}
            onSubmitEditing={sendMessage}
            flex={1}
            borderRadius="$6"
            fontSize="$5"
            height="$3"
            borderWidth={0}
            backgroundColor="$muted"
            color="$foreground"
            px="$3"
            
          />
          {messageText.length > 0 ? (
            <ThemedIonicons name="send" size={28} />
          ) : (
            <ThemedIonicons name="camera-outline" size={28} />
          )}
        </XStack>
    )
}