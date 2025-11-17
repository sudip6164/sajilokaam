# ML Document Task Extraction Service

Python-based machine learning service for extracting tasks from documents using NLP.

## Features

- **Real ML/NLP**: Uses spaCy for natural language processing
- **Dependency Parsing**: Identifies tasks using sentence structure analysis
- **Pattern Recognition**: Multiple extraction methods (NLP + pattern matching)
- **Confidence Scoring**: ML-based confidence calculation
- **REST API**: Flask-based API for integration with Java backend

## Technologies

- **Flask**: Web framework
- **spaCy**: NLP library for task extraction
- **Python 3.11**: Runtime

## Setup

### Local Development

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Download spaCy model:
```bash
python -m spacy download en_core_web_sm
```

3. Run the service:
```bash
python app.py
```

The service will run on `http://localhost:5000`

### Docker

```bash
docker-compose up ml-service
```

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "spacy_loaded": true,
  "service": "ML Document Task Extraction"
}
```

### Extract Tasks
```
POST /extract-tasks
Content-Type: application/json

{
  "text": "OCR extracted text from document"
}
```

Response:
```json
{
  "tasks": [
    {
      "suggestedTitle": "Implement user authentication",
      "suggestedDescription": "Full description...",
      "suggestedPriority": "HIGH",
      "suggestedDueDate": "2024-12-31",
      "suggestedEstimatedHours": 8,
      "extractionMethod": "NLP_DEPENDENCY_PARSING",
      "confidenceScore": 0.85,
      "rawTextSnippet": "Original text snippet..."
    }
  ],
  "count": 1
}
```

## ML Features

1. **Dependency Parsing**: Uses spaCy to identify action verbs and objects
2. **Sentence Classification**: Determines if sentences are task-like
3. **Similarity Scoring**: Uses spaCy word vectors for deduplication
4. **Confidence Calculation**: ML-based scoring using multiple features

## Integration

The Java backend automatically calls this service when processing documents. If the ML service is unavailable, it falls back to rule-based extraction.

