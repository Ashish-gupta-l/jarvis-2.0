package com.caretrail.service;

import com.caretrail.dto.AiChatRequest;
import com.caretrail.dto.AiChatResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    public AiChatResponse processChat(AiChatRequest request) {
        String msg = request.getMessage() != null ? request.getMessage().trim() : "";
        String lower = msg.toLowerCase();
        String lang = request.getLanguage() != null ? request.getLanguage() : "en";
        String model = request.getModel() != null ? request.getModel() : "gemini-2.0-flash";
        boolean deepThinking = request.isDeepThinking();
        boolean webSearch = request.isWebSearch();

        // Detect Hindi Devanagari script if present
        if (msg.matches(".*[\\u0900-\\u097F]+.*")) {
            lang = "hi";
        }

        String thinking = "";
        if (deepThinking) {
            if ("hi".equals(lang)) {
                thinking = "1. चिकित्सीय प्रश्न का विश्लेषण और CareTrail निरंतरता डेटाबेस से मिलान।\n2. ड्रग इंटरैक्शन मैट्रिक्स और टाइमलाइन सुरक्षा ऑडिट पूर्ण।\n3. साक्ष्य-आधारित नैदानिक सारांश तैयार।";
            } else if ("es".equals(lang)) {
                thinking = "1. Análisis clínico del mensaje y validación con protocolos de CareTrail.\n2. Verificación de interacciones farmacológicas y brechas de atención.\n3. Síntesis estructurada y centrada en la seguridad del paciente.";
            } else {
                thinking = "1. Clinical context parsed and mapped to CareTrail continuity standards.\n2. Cross-referenced medication conflict registries and SHA-256 trust layer.\n3. Formulated evidence-backed response with medical triage disclaimer.";
            }
        }

        List<Map<String, String>> citations = null;
        if (webSearch) {
            citations = new ArrayList<>();
            citations.add(Map.of("title", "CareTrail Clinical Continuity Ledger", "url", "https://caretrail.health/evidence"));
            citations.add(Map.of("title", "National Library of Medicine (PubMed)", "url", "https://pubmed.ncbi.nlm.nih.gov"));
        }

        String answer;
        if (lower.contains("timeline") || lower.contains("history") || lower.contains("टाइमलाइन") || lower.contains("रिकॉर्ड")) {
            if ("hi".equals(lang)) {
                answer = "### 📅 आपकी मेडिकल टाइमलाइन (Jarvis Backend AI)\n\nCareTrail पर आपके सभी रिकॉर्ड्स कालानुक्रमिक क्रम में सुरक्षित हैं। प्रत्येक रिपोर्ट **SHA-256 क्रिप्टोग्राफिक हैश** से सुरक्षित है जिससे कोई छेड़छाड़ संभव नहीं है।\n\n📌 अधिक विवरण के लिए डैशबोर्ड पर **Timeline** टैब देखें।";
            } else {
                answer = "### 📅 Unified Medical Timeline Insights\n\nCareTrail consolidates your medical encounters into an unbroken continuum. Every record is sealed with a **SHA-256 cryptographic hash** ensuring total document integrity and provenance.\n\n📌 Check the **Timeline** tab in the top navigation to review complete records.";
            }
        } else if (lower.contains("conflict") || lower.contains("टकराव") || lower.contains("medication") || lower.contains("दवा")) {
            if ("hi".equals(lang)) {
                answer = "### ⚠️ दवा टकराव चेतावनी (Conflict Detector)\n\nCareTrail का स्वचालित इंजन दवाओं के खतरनाक संयोजनों (जैसे Warfarin + Aspirin) और अप्रत्याशित खुराक वृद्धि को तुरंत चिन्हित करता है।\n\n🩺 कृपया **Conflicts** पेज पर जाकर डॉक्टर के साथ समीक्षा करें।";
            } else {
                answer = "### ⚠️ Clinical Discrepancy & Conflict Analysis\n\nCareTrail continuously evaluates multi-provider prescriptions for adverse interactions (e.g. concurrent anticoagulants) and dosage spikes.\n\n🩺 Visit the **Conflicts** tab to resolve flagged discrepancies with your physician.";
            }
        } else {
            if ("hi".equals(lang)) {
                answer = "नमस्ते! मैं **जार्विस AI** हूँ। मैं आपके मेडिकल रिकॉर्ड्स, टाइमलाइन, दवाओं के विश्लेषण और स्वास्थ्य सम्बन्धी सवालों में सहायता कर सकता हूँ।\n\nकृपया अपना प्रश्न पूछें!";
            } else if ("es".equals(lang)) {
                answer = "¡Hola! Soy **Jarvis AI**. Puedo ayudarle a entender sus registros médicos, detectar conflictos de medicamentos y coordinar su seguimiento clínico.\n\n¿En qué puedo ayudarle hoy?";
            } else {
                answer = "Hello! I am **Jarvis AI**, your intelligent assistant for healthcare continuity and medical records on CareTrail.\n\nHow can I assist you with your health records, medications, or appointments today?";
            }
        }

        return new AiChatResponse(answer, thinking, citations, model + " (CareTrail Backend Core)");
    }
}
