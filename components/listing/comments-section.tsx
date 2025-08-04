import { CommentDetails } from "@bid-scents/shared-sdk";
import { Text } from "tamagui";

export function CommentsSection({ comments }: { comments: CommentDetails[] | null | undefined }) {
    return (
        <Text>{comments?.length}</Text>
    )
}