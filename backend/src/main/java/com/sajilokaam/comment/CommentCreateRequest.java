package com.sajilokaam.comment;

import jakarta.validation.constraints.NotBlank;

public class CommentCreateRequest {
    @NotBlank(message = "Comment content is required")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}

