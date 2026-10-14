package com.company.opsinvestigator.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ops.detection")
public class DetectionProperties {

    private long latencyThresholdMs = 1500;
    private double errorRateThresholdPct = 5.0;
    private double connectionPoolThresholdPct = 85.0;
    private int deadlocksThreshold = 1;
    private double cpuThresholdPct = 85.0;
    private double memoryThresholdPct = 85.0;
    private double diskThresholdPct = 85.0;
    private int recentDeploymentWindowMinutes = 15;
    private int correlationWindowMinutes = 15;

    public long getLatencyThresholdMs() {
        return latencyThresholdMs;
    }

    public void setLatencyThresholdMs(long latencyThresholdMs) {
        this.latencyThresholdMs = latencyThresholdMs;
    }

    public double getErrorRateThresholdPct() {
        return errorRateThresholdPct;
    }

    public void setErrorRateThresholdPct(double errorRateThresholdPct) {
        this.errorRateThresholdPct = errorRateThresholdPct;
    }

    public double getConnectionPoolThresholdPct() {
        return connectionPoolThresholdPct;
    }

    public void setConnectionPoolThresholdPct(double connectionPoolThresholdPct) {
        this.connectionPoolThresholdPct = connectionPoolThresholdPct;
    }

    public int getDeadlocksThreshold() {
        return deadlocksThreshold;
    }

    public void setDeadlocksThreshold(int deadlocksThreshold) {
        this.deadlocksThreshold = deadlocksThreshold;
    }

    public double getCpuThresholdPct() {
        return cpuThresholdPct;
    }

    public void setCpuThresholdPct(double cpuThresholdPct) {
        this.cpuThresholdPct = cpuThresholdPct;
    }

    public double getMemoryThresholdPct() {
        return memoryThresholdPct;
    }

    public void setMemoryThresholdPct(double memoryThresholdPct) {
        this.memoryThresholdPct = memoryThresholdPct;
    }

    public double getDiskThresholdPct() {
        return diskThresholdPct;
    }

    public void setDiskThresholdPct(double diskThresholdPct) {
        this.diskThresholdPct = diskThresholdPct;
    }

    public int getRecentDeploymentWindowMinutes() {
        return recentDeploymentWindowMinutes;
    }

    public void setRecentDeploymentWindowMinutes(int recentDeploymentWindowMinutes) {
        this.recentDeploymentWindowMinutes = recentDeploymentWindowMinutes;
    }

    public int getCorrelationWindowMinutes() {
        return correlationWindowMinutes;
    }

    public void setCorrelationWindowMinutes(int correlationWindowMinutes) {
        this.correlationWindowMinutes = correlationWindowMinutes;
    }
}
