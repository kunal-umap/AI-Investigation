package com.company.opsinvestigator.audit.application;

import com.company.opsinvestigator.audit.domain.AuditAction;
import com.company.opsinvestigator.audit.domain.AuditRecord;
import com.company.opsinvestigator.audit.infrastructure.AuditRecordJpaEntity;
import com.company.opsinvestigator.audit.infrastructure.SpringDataAuditRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final SpringDataAuditRecordRepository repository;

    public AuditService(SpringDataAuditRecordRepository repository) {
        this.repository = repository;
    }

    public AuditRecord record(AuditAction action, String targetType, String targetId, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String actor = "system";
        String role = "SYSTEM";

        if (auth != null && auth.isAuthenticated()) {
            actor = auth.getName() != null ? auth.getName() : "sre-engineer";
            role = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a.startsWith("ROLE_"))
                    .map(a -> a.substring(5))
                    .findFirst()
                    .orElse("ENGINEER");
        }

        AuditRecord record = AuditRecord.of(action, actor, role, targetType, targetId, details);
        AuditRecordJpaEntity entity = repository.save(AuditRecordJpaEntity.fromDomain(record));

        log.info("AUDIT LOG: [action={}] [actor={}] [role={}] [targetType={}] [targetId={}] [details={}]",
                action, actor, role, targetType, targetId, details);

        return entity.toDomain();
    }

    @Transactional(readOnly = true)
    public List<AuditRecord> getRecentRecords(int limit) {
        return repository.findRecent(PageRequest.of(0, Math.min(limit, 100))).stream()
                .map(AuditRecordJpaEntity::toDomain)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditRecord> getByTarget(String targetType, String targetId) {
        return repository.findByTarget(targetType, targetId).stream()
                .map(AuditRecordJpaEntity::toDomain)
                .toList();
    }
}
