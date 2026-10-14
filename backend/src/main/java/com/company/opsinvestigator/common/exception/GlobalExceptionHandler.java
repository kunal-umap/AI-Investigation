package com.company.opsinvestigator.common.exception;

import com.company.opsinvestigator.common.observability.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetails> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        String traceId = MDC.get(CorrelationIdFilter.MDC_TRACE_ID);
        log.warn("Resource not found: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.of(
                "https://ops-investigator.company.com/errors/not-found",
                "Resource Not Found",
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                request.getRequestURI(),
                traceId
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(OptimisticLockingException.class)
    public ResponseEntity<ProblemDetails> handleOptimisticLock(OptimisticLockingException ex, HttpServletRequest request) {
        String traceId = MDC.get(CorrelationIdFilter.MDC_TRACE_ID);
        log.warn("Optimistic locking conflict: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.of(
                "https://ops-investigator.company.com/errors/conflict",
                "Version Conflict",
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                request.getRequestURI(),
                traceId
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(InvalidStateTransitionException.class)
    public ResponseEntity<ProblemDetails> handleInvalidState(InvalidStateTransitionException ex, HttpServletRequest request) {
        String traceId = MDC.get(CorrelationIdFilter.MDC_TRACE_ID);
        log.warn("Invalid state transition: {}", ex.getMessage());
        ProblemDetails problem = ProblemDetails.of(
                "https://ops-investigator.company.com/errors/bad-request",
                "Invalid State Transition",
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                request.getRequestURI(),
                traceId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetails> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String traceId = MDC.get(CorrelationIdFilter.MDC_TRACE_ID);
        Map<String, String> errors = new HashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }
        log.warn("Validation failed for URI: {} - errors: {}", request.getRequestURI(), errors);
        ProblemDetails problem = ProblemDetails.withViolations(
                "https://ops-investigator.company.com/errors/bad-request",
                "Validation Failed",
                HttpStatus.BAD_REQUEST.value(),
                "One or more request parameters failed validation.",
                request.getRequestURI(),
                traceId,
                errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetails> handleGeneric(Exception ex, HttpServletRequest request) {
        String traceId = MDC.get(CorrelationIdFilter.MDC_TRACE_ID);
        log.error("Unhandled server exception processing request {}", request.getRequestURI(), ex);
        ProblemDetails problem = ProblemDetails.of(
                "https://ops-investigator.company.com/errors/internal-server-error",
                "Internal Server Error",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected internal error occurred. Reference traceId for support.",
                request.getRequestURI(),
                traceId
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
