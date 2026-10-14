package com.company.opsinvestigator.audit.domain;

public enum AuditAction {
    START_INVESTIGATION,
    CHANGE_INCIDENT_STATUS,
    CONFIRM_FINDING,
    REJECT_FINDING,
    ADD_ROOT_CAUSE,
    CLOSE_INCIDENT
}
