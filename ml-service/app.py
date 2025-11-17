"""
ML Document Task Extraction Service
Python-based ML service for extracting tasks from documents using NLP
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import re
from datetime import datetime
from typing import List, Dict, Optional
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load spaCy model (English)
try:
    nlp = spacy.load("en_core_web_sm")
    logger.info("spaCy model loaded successfully")
except OSError:
    logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
    nlp = None

# Task-related keywords for classification
TASK_KEYWORDS = [
    "implement", "create", "develop", "build", "design", "write", "test", "fix",
    "update", "add", "remove", "modify", "improve", "refactor", "deploy",
    "configure", "setup", "task", "feature", "requirement", "deliverable",
    "milestone", "sprint", "story", "action", "complete", "finish"
]

PRIORITY_KEYWORDS = {
    "CRITICAL": ["critical", "urgent", "asap", "immediate", "emergency"],
    "HIGH": ["high", "important", "priority", "urgent"],
    "MEDIUM": ["medium", "moderate", "normal"],
    "LOW": ["low", "minor", "optional", "nice to have"]
}


class TaskExtractor:
    """ML-based task extraction using NLP"""
    
    def __init__(self):
        self.nlp = nlp
    
    def extract_tasks(self, text: str) -> List[Dict]:
        """
        Extract tasks from text using ML/NLP techniques
        
        Args:
            text: Input text from OCR
            
        Returns:
            List of extracted task suggestions with metadata
        """
        if not text or not text.strip():
            return []
        
        if not self.nlp:
            logger.warning("spaCy model not available, falling back to rule-based extraction")
            return self._rule_based_extraction(text)
        
        tasks = []
        
        # Process text with spaCy NLP
        doc = self.nlp(text)
        
        # Method 1: Extract from numbered/bulleted lists using NLP
        tasks.extend(self._extract_from_lists_nlp(doc, text))
        
        # Method 2: Extract task-like sentences using dependency parsing
        tasks.extend(self._extract_from_sentences_nlp(doc))
        
        # Method 3: Pattern-based extraction (fallback)
        tasks.extend(self._pattern_based_extraction(text))
        
        # Deduplicate and score
        tasks = self._deduplicate_tasks(tasks)
        tasks = self._calculate_confidence_scores(tasks, doc)
        
        return tasks
    
    def _extract_from_lists_nlp(self, doc, text: str) -> List[Dict]:
        """Extract tasks from lists using NLP"""
        tasks = []
        
        # Find numbered lists (1., 2., etc.)
        numbered_pattern = re.compile(r'^\s*(\d+)[\.\)]\s+(.+?)(?=\n\s*\d+[\.\)]|\n\n|$)', re.MULTILINE | re.DOTALL)
        for match in numbered_pattern.finditer(text):
            content = match.group(2).strip()
            if self._is_task_like(content):
                task = self._create_task_suggestion(
                    title=self._extract_title(content),
                    description=content,
                    method="NLP_NUMBERED_LIST"
                )
                tasks.append(task)
        
        # Find bullet points
        bullet_pattern = re.compile(r'^\s*[•\-\*\+]\s+(.+?)(?=\n\s*[•\-\*\+]|\n\n|$)', re.MULTILINE | re.DOTALL)
        for match in bullet_pattern.finditer(text):
            content = match.group(1).strip()
            if self._is_task_like(content):
                task = self._create_task_suggestion(
                    title=self._extract_title(content),
                    description=content,
                    method="NLP_BULLET_LIST"
                )
                tasks.append(task)
        
        return tasks
    
    def _extract_from_sentences_nlp(self, doc) -> List[Dict]:
        """Extract tasks from sentences using dependency parsing"""
        tasks = []
        
        for sent in doc.sents:
            # Check if sentence contains task keywords
            sent_text = sent.text.strip()
            if not self._is_task_like(sent_text):
                continue
            
            # Use NLP to identify action verbs and objects
            action_verb = None
            task_object = None
            
            for token in sent:
                # Find root verb (action)
                if token.pos_ == "VERB" and token.dep_ == "ROOT":
                    action_verb = token.text
                # Find direct object
                if token.dep_ == "dobj":
                    task_object = token.text
            
            # Create task from sentence
            if action_verb or any(kw in sent_text.lower() for kw in TASK_KEYWORDS):
                task = self._create_task_suggestion(
                    title=self._extract_title(sent_text),
                    description=sent_text,
                    method="NLP_DEPENDENCY_PARSING"
                )
                tasks.append(task)
        
        return tasks
    
    def _pattern_based_extraction(self, text: str) -> List[Dict]:
        """Pattern-based extraction (fallback method)"""
        tasks = []
        
        # Task pattern: "Task 1:", "Item 2:", etc.
        task_pattern = re.compile(
            r'(?i)(?:task|item|step|requirement|feature|deliverable)\s*[#:]?\s*(\d+)[\\.:]?\s*(.+?)(?=(?:task|item|step|requirement|feature|deliverable)\s*[#:]?\s*\d+|$)',
            re.DOTALL
        )
        
        for match in task_pattern.finditer(text):
            content = match.group(2).strip()
            task = self._create_task_suggestion(
                title=self._extract_title(content),
                description=content,
                method="PATTERN_MATCHING"
            )
            tasks.append(task)
        
        return tasks
    
    def _is_task_like(self, text: str) -> bool:
        """Check if text looks like a task using ML/NLP"""
        if not text or len(text) < 10:
            return False
        
        text_lower = text.lower()
        
        # Check for task keywords
        if any(keyword in text_lower for keyword in TASK_KEYWORDS):
            return True
        
        # Use NLP to check for imperative sentences (commands/actions)
        if self.nlp:
            doc = self.nlp(text)
            for token in doc:
                # Imperative sentences often start with verbs
                if token.pos_ == "VERB" and token.i == 0:
                    return True
        
        return False
    
    def _extract_title(self, text: str, max_length: int = 255) -> str:
        """Extract a clean title from text"""
        # Remove extra whitespace
        title = re.sub(r'\s+', ' ', text).strip()
        
        # Take first sentence or first 255 chars
        sentences = re.split(r'[.!?]\s+', title)
        if sentences:
            title = sentences[0]
        
        # Remove common prefixes
        title = re.sub(r'^(?:task|item|step|requirement|feature|deliverable)\s*[#:]?\s*\d+[\\.:]?\s*', '', title, flags=re.IGNORECASE)
        
        # Capitalize first letter
        if title:
            title = title[0].upper() + title[1:] if len(title) > 1 else title.upper()
        
        return title[:max_length]
    
    def _extract_priority(self, text: str) -> str:
        """Extract priority from text using keyword matching"""
        text_lower = text.lower()
        
        for priority, keywords in PRIORITY_KEYWORDS.items():
            if any(keyword in text_lower for keyword in keywords):
                return priority
        
        return "MEDIUM"  # Default
    
    def _extract_due_date(self, text: str) -> Optional[str]:
        """Extract due date from text"""
        # Date patterns
        date_patterns = [
            r'\b(?:due|deadline|by|before|on)\s*(?:date)?\s*[:]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'\b(?:due|deadline|by|before|on)\s*(?:date)?\s*[:]?\s*(\d{4}[/-]\d{1,2}[/-]\d{1,2})',
            r'\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2},?\s+\d{4}',
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1) if match.groups() else match.group(0)
        
        return None
    
    def _extract_estimated_hours(self, text: str) -> Optional[int]:
        """Extract estimated hours from text"""
        patterns = [
            r'\b(?:estimate|estimated|hours|hrs|time|duration)\s*[:]?\s*(\d+)\s*(?:hours?|hrs?|h)?',
            r'\b(\d+)\s*(?:hours?|hrs?|h)\s*(?:estimate|estimated|time|duration)?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except ValueError:
                    pass
        
        return None
    
    def _create_task_suggestion(self, title: str, description: str, method: str) -> Dict:
        """Create a task suggestion dictionary"""
        return {
            "suggestedTitle": title,
            "suggestedDescription": description if len(description) > len(title) else None,
            "suggestedPriority": self._extract_priority(description),
            "suggestedDueDate": self._extract_due_date(description),
            "suggestedEstimatedHours": self._extract_estimated_hours(description),
            "extractionMethod": method,
            "rawTextSnippet": description[:500],
            "confidenceScore": 0.70  # Will be updated by _calculate_confidence_scores
        }
    
    def _deduplicate_tasks(self, tasks: List[Dict]) -> List[Dict]:
        """Remove duplicate tasks using similarity"""
        unique_tasks = []
        
        for task in tasks:
            is_duplicate = False
            title = task["suggestedTitle"].lower()
            
            for existing in unique_tasks:
                existing_title = existing["suggestedTitle"].lower()
                
                # Check similarity
                if self._similarity_score(title, existing_title) > 0.8:
                    # Keep the one with higher confidence
                    if task["confidenceScore"] > existing["confidenceScore"]:
                        unique_tasks.remove(existing)
                        unique_tasks.append(task)
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_tasks.append(task)
        
        return unique_tasks
    
    def _similarity_score(self, text1: str, text2: str) -> float:
        """Calculate similarity between two texts"""
        if not self.nlp:
            # Simple Levenshtein-based similarity
            return self._levenshtein_similarity(text1, text2)
        
        # Use spaCy similarity
        doc1 = self.nlp(text1)
        doc2 = self.nlp(text2)
        return doc1.similarity(doc2)
    
    def _levenshtein_similarity(self, s1: str, s2: str) -> float:
        """Calculate Levenshtein distance similarity"""
        if len(s1) < len(s2):
            return self._levenshtein_similarity(s2, s1)
        
        if len(s2) == 0:
            return 1.0
        
        previous_row = list(range(len(s2) + 1))
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        max_len = max(len(s1), len(s2))
        distance = previous_row[-1]
        return 1.0 - (distance / max_len) if max_len > 0 else 1.0
    
    def _calculate_confidence_scores(self, tasks: List[Dict], doc) -> List[Dict]:
        """Calculate confidence scores using ML features"""
        for task in tasks:
            score = 0.5  # Base score
            
            title = task["suggestedTitle"]
            method = task["extractionMethod"]
            
            # Boost score based on extraction method
            if "NLP" in method:
                score += 0.2
            if "DEPENDENCY_PARSING" in method:
                score += 0.15
            
            # Boost score if contains task keywords
            title_lower = title.lower()
            keyword_count = sum(1 for kw in TASK_KEYWORDS if kw in title_lower)
            score += min(keyword_count * 0.05, 0.15)
            
            # Boost score if has priority/date/hours
            if task["suggestedPriority"]:
                score += 0.05
            if task["suggestedDueDate"]:
                score += 0.05
            if task["suggestedEstimatedHours"]:
                score += 0.05
            
            # Use NLP to check sentence structure quality
            if self.nlp:
                title_doc = self.nlp(title)
                # Check if it has a verb (action)
                has_verb = any(token.pos_ == "VERB" for token in title_doc)
                if has_verb:
                    score += 0.1
            
            task["confidenceScore"] = min(score, 1.0)
        
        # Sort by confidence
        tasks.sort(key=lambda x: x["confidenceScore"], reverse=True)
        
        return tasks
    
    def _rule_based_extraction(self, text: str) -> List[Dict]:
        """Fallback rule-based extraction if NLP model not available"""
        tasks = []
        
        # Simple pattern matching
        patterns = [
            (r'(?i)(?:task|item|step)\s*[#:]?\s*(\d+)[\\.:]?\s*(.+?)(?=\n|$)', "PATTERN_MATCHING"),
            (r'^\s*[•\-\*\+]\s+(.+?)(?=\n\s*[•\-\*\+]|\n\n|$)', "BULLET_PATTERN"),
            (r'^\s*(\d+)[\.\)]\s+(.+?)(?=\n\s*\d+[\.\)]|\n\n|$)', "NUMBERED_LIST"),
        ]
        
        for pattern, method in patterns:
            for match in re.finditer(pattern, text, re.MULTILINE | re.DOTALL):
                content = match.group(2 if match.groups() else 0).strip()
                if self._is_task_like(content):
                    task = self._create_task_suggestion(
                        title=self._extract_title(content),
                        description=content,
                        method=method
                    )
                    tasks.append(task)
        
        return self._deduplicate_tasks(tasks)


# Initialize extractor
extractor = TaskExtractor()


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "spacy_loaded": nlp is not None,
        "service": "ML Document Task Extraction"
    })


@app.route('/extract-tasks', methods=['POST'])
def extract_tasks():
    """
    Extract tasks from text using ML/NLP
    
    Request body:
    {
        "text": "OCR extracted text from document"
    }
    
    Response:
    {
        "tasks": [
            {
                "suggestedTitle": "...",
                "suggestedDescription": "...",
                "suggestedPriority": "HIGH",
                "suggestedDueDate": "2024-12-31",
                "suggestedEstimatedHours": 8,
                "extractionMethod": "NLP_DEPENDENCY_PARSING",
                "confidenceScore": 0.85,
                "rawTextSnippet": "..."
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field"}), 400
        
        text = data['text']
        
        if not text or not text.strip():
            return jsonify({"tasks": []})
        
        # Extract tasks using ML
        tasks = extractor.extract_tasks(text)
        
        logger.info(f"Extracted {len(tasks)} tasks from text")
        
        return jsonify({
            "tasks": tasks,
            "count": len(tasks)
        })
    
    except Exception as e:
        logger.error(f"Error extracting tasks: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

