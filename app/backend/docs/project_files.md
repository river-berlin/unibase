# Project Files

## Overview
Each project in VoiceCAD has an associated file stored in S3 that contains the project's voice design data. The file is a JSON document that stores all the objects and their relationships in the voice design.

## File Structure
- Files are stored in S3 with the naming convention: `{projectId}.voiceCAD`
- Each file is a JSON document with the following structure:

```json
{
  "objects": [] // Array of voice design objects
}
```

## Access Control
- Only users with access to a project can read/write its associated file
- Access is verified through the project's organization membership
- If a file doesn't exist when requested, an empty file structure is automatically created

## API Endpoints

### GET /projects/:projectId/file
Fetches the project file from S3. If the file doesn't exist, creates an empty one.

**Response**
```json
{
  "objects": []
}
```

**Error Responses**
- 404: Project not found
- 403: No access to this project
- 500: Error fetching/creating project file 