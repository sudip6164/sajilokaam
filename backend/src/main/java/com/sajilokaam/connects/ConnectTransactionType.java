package com.sajilokaam.connects;

public enum ConnectTransactionType {
    PURCHASE,  // Bought connects
    REFUND,    // Refunded connects (bid rejected, etc.)
    SPENT,     // Used connects to submit bid
    BONUS      // Free/promotional connects
}
