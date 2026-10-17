package com.caretrail.controller;

import com.caretrail.dto.AiChatRequest;
import com.caretrail.dto.AiChatResponse;
import com.caretrail.dto.ApiResponse;
import com.caretrail.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        AiChatResponse response = aiChatService.processChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/models")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getModels() {
        List<Map<String, String>> models = List.of(
            Map.of("id", "gemini-2.0-flash", "name", "Google Gemini 2.0 Flash", "group", "Google AI"),
            Map.of("id", "gpt-4o-mini", "name", "OpenAI GPT-4o Mini", "group", "OpenAI"),
            Map.of("id", "claude-3-7-sonnet", "name", "Anthropic Claude 3.7 Sonnet", "group", "Anthropic"),
            Map.of("id", "deepseek-r1", "name", "DeepSeek R1", "group", "DeepSeek")
        );
        return ResponseEntity.ok(ApiResponse.ok("Available AI models retrieved", models));
    }
}
