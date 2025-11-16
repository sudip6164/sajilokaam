package com.sajilokaam.timelog;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TimeLogCreateRequest {
    @NotNull(message = "Minutes is required")
    @Min(value = 1, message = "Minutes must be at least 1")
    private Integer minutes;

    public Integer getMinutes() {
        return minutes;
    }

    public void setMinutes(Integer minutes) {
        this.minutes = minutes;
    }
}

