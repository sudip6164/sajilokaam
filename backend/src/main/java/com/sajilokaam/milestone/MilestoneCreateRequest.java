package com.sajilokaam.milestone;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class MilestoneCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private LocalDate dueDate;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
}

