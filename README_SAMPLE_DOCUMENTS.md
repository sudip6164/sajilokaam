# Sample Documents for ML Task Extraction Testing

This directory contains sample documents that you can use to test the ML document processing feature in the project management system.

## Available Documents

### 1. `sample-requirements-document.txt`
A comprehensive requirements document with:
- Numbered task lists
- Bullet points
- Priority levels (HIGH, MEDIUM, CRITICAL)
- Due dates
- Estimated hours
- Multiple task formats

**Best for testing:**
- Numbered list extraction
- Priority detection
- Date extraction
- Hours estimation

### 2. `sample-project-specs.md`
A markdown-formatted project specification document with:
- Structured task phases
- Detailed task descriptions
- Priority levels
- Due dates
- Estimated hours
- Technical requirements

**Best for testing:**
- Structured task extraction
- Phase-based organization
- Technical task identification

## How to Use

1. **Navigate to Project Workspace:**
   - Go to any active project
   - Click on the "ML Documents" tab

2. **Upload a Document:**
   - Click "Upload Document" button
   - Select one of the sample documents
   - Click "Extract Tasks with AI"

3. **Review Extracted Tasks:**
   - The ML service will analyze the document
   - Review the extracted tasks
   - Check confidence scores and extraction methods
   - Select tasks you want to create

4. **Create Tasks:**
   - Select tasks from the extracted list
   - Click "Create Tasks"
   - Tasks will be added to your project

## What the ML Service Extracts

The ML service (using spaCy NLP) can extract:
- ✅ Task titles from numbered lists, bullet points, and sentences
- ✅ Task descriptions
- ✅ Priority levels (HIGH, MEDIUM, LOW, CRITICAL)
- ✅ Due dates (various formats)
- ✅ Estimated hours
- ✅ Confidence scores for each extraction

## Expected Results

When you upload `sample-requirements-document.txt`, you should see approximately **10-15 tasks** extracted, including:
- Design and UI/UX Tasks
- Frontend Development
- Backend Integration
- Content Management
- Testing and QA
- Deployment and Launch
- And more...

When you upload `sample-project-specs.md`, you should see approximately **12 tasks** extracted, organized by phases.

## Tips for Best Results

1. **Use clear task formats:**
   - Numbered lists (1., 2., 3.)
   - Bullet points (•, -, *)
   - Task keywords (Task, Feature, Requirement)

2. **Include priority indicators:**
   - Words like "HIGH", "CRITICAL", "URGENT", "MEDIUM", "LOW"
   - The ML service will detect these automatically

3. **Add dates in various formats:**
   - YYYY-MM-DD (2024-02-15)
   - MM/DD/YYYY (02/15/2024)
   - "Due: [date]" format

4. **Include time estimates:**
   - "Estimated Hours: 40"
   - "Time: 8 hours"
   - "Duration: 2 days"

## Troubleshooting

If tasks aren't being extracted:
- Check that the document contains task-like content
- Ensure the document is in a supported format (TXT, PDF, DOC, DOCX)
- Try rephrasing tasks with action verbs (create, implement, build, design)
- Make sure the ML service is running (check Docker containers)

## Creating Your Own Test Documents

You can create your own test documents following these patterns:

```
1. Task Title
   Description of the task
   Priority: HIGH
   Due Date: 2024-03-01
   Estimated Hours: 20

2. Another Task
   More details here
   Priority: MEDIUM
   Due Date: 2024-03-15
   Estimated Hours: 15
```

Or use bullet points:

```
• Implement user authentication system
  Priority: CRITICAL
  Due: 2024-02-10
  Hours: 25

• Create product listing page
  Priority: HIGH
  Due: 2024-02-20
  Hours: 18
```

---

**Note:** The ML service works best with well-structured documents that contain clear task descriptions with action verbs and relevant keywords.
