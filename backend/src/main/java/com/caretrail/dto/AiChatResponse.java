package com.caretrail.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public class AiChatResponse {
    private String text;
    private String thinkingProcess;
    private List<Map<String, String>> citations;
    private String modelUsed;
    private String timestamp;

    public AiChatResponse() {}

    public AiChatResponse(String text, String thinkingProcess, List<Map<String, String>> citations, String modelUsed) {
        this.text = text;
        this.thinkingProcess = thinkingProcess;
        this.citations = citations;
        this.modelUsed = modelUsed;
        this.timestamp = Instant.now().toString();
    }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getThinkingProcess() { return thinkingProcess; }
    public void setThinkingProcess(String thinkingProcess) { this.thinkingProcess = thinkingProcess; }

    public List<Map<String, String>> getCitations() { return citations; }
    public void setCitations(List<Map<String, String>> citations) { this.citations = citations; }

    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
