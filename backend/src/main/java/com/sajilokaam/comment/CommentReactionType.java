package com.sajilokaam.comment;

import java.util.Arrays;
import java.util.Optional;

public enum CommentReactionType {
    THUMBS_UP("👍"),
    HEART("❤️"),
    FIRE("🔥"),
    EYES("👀"),
    CHECK("✅");

    private final String emoji;

    CommentReactionType(String emoji) {
        this.emoji = emoji;
    }

    public String getEmoji() {
        return emoji;
    }

    public static Optional<CommentReactionType> fromValue(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }

        return Arrays.stream(values())
                .filter(type -> type.name().equalsIgnoreCase(value.trim()))
                .findFirst();
    }
}


