package com.localfix.entity;

/**
 * ReportStatus Enum
 *
 * Current state of the problem report in the resolution lifecycle.
 *
 * Civic Issue Resolution Workflow:
 * PENDING (Submitted & waiting for municipal triage)
 *    ├──> IN_PROGRESS (Field team dispatched / Under active repair)
 *    └──> RESOLVED    (Repairs verified & completed)
 *
 * IN_PROGRESS
 *    ├──> RESOLVED    (Work completed)
 *    └──> PENDING     (Work deferred / waiting for parts or reassessment)
 *
 * RESOLVED
 *    └──> IN_PROGRESS (Reopened due to recurring issue)
 */
public enum ReportStatus {
    PENDING,
    IN_PROGRESS,
    RESOLVED;

    /**
     * Determines whether transitioning from this status to targetStatus is valid.
     *
     * @param targetStatus the desired new status
     * @return true if the transition is permitted by business rules
     */
    public boolean canTransitionTo(ReportStatus targetStatus) {
        if (targetStatus == null) {
            return false;
        }
        if (this == targetStatus) {
            return true; // Self-transition is a valid idempotent no-op
        }

        return switch (this) {
            case PENDING -> targetStatus == IN_PROGRESS || targetStatus == RESOLVED;
            case IN_PROGRESS -> targetStatus == RESOLVED || targetStatus == PENDING;
            case RESOLVED -> targetStatus == IN_PROGRESS; // Reopen
        };
    }
}
