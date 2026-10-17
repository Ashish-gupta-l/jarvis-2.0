package com.caretrail.dto;

import java.util.Map;

public class AiChatRequest {
    private String message;
    private String model;
    private String language;
    private boolean webSearch;
    private boolean deepThinking;
    private Map<String, Object> attachment;

    public AiChatRequest() {}

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public boolean isWebSearch() { return webSearch; }
    public void setWebSearch(boolean webSearch) { this.webSearch = webSearch; }

    public boolean isDeepThinking() { return deepThinking; }
    public void setDeepThinking(boolean deepThinking) { this.deepThinking = deepThinking; }

    public Map<String, Object> getAttachment() { return attachment; }
    public void setAttachment(Map<String, Object> attachment) { this.attachment = attachment; }
}
